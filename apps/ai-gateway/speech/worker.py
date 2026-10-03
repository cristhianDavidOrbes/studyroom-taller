"""Local-only, bounded speech recognition. Never persist audio or transcript logs."""
import argparse
import base64
import hashlib
import hmac
import io
import json
import os
import re
import socket
import threading
import time
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

MODEL_NAME = "faster-whisper-small"
MODEL_REPO = "Systran/faster-whisper-small"
MODEL_REVISION = "536b0662742c02347bc0e980a01041f333bce120"
MAX_BODY = 1_281_000
MAX_RESPONSE = 262_144
MAX_AUDIO = 960_256


def secret_from_env(path):
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if line.startswith("AI_GATEWAY_SECRET="):
            secret = line.split("=", 1)[1].strip()
            if re.fullmatch(r"[A-Za-z0-9_-]{43,128}", secret):
                return secret
    raise ValueError("Credencial local ausente o inválida.")


def decode_input(value):
    if not isinstance(value, dict) or set(value) - {"audioBase64", "mimeType", "language"}:
        raise ValueError("INVALID_INPUT")
    encoded = value.get("audioBase64")
    language = value.get("language", "es")
    if value.get("mimeType") != "audio/wav" or not isinstance(encoded, str) or len(encoded) > 1_280_344 or language not in ("es", "en", "auto"):
        raise ValueError("INVALID_INPUT")
    try:
        audio = base64.b64decode(encoded, validate=True)
        if base64.b64encode(audio).decode("ascii") != encoded or not 44 <= len(audio) <= MAX_AUDIO:
            raise ValueError()
        if audio[:4] != b"RIFF" or audio[8:12] != b"WAVE" or int.from_bytes(audio[4:8], "little") + 8 != len(audio):
            raise ValueError()
        # Validate chunk boundaries and reject duplicate format/data chunks before
        # Python's WAV reader can silently select one conflicting payload.
        offset, formats, data_chunks = 12, 0, 0
        while offset + 8 <= len(audio):
            size = int.from_bytes(audio[offset + 4:offset + 8], "little")
            if offset + 8 + size > len(audio):
                raise ValueError()
            if audio[offset:offset + 4] == b"fmt ":
                formats += 1
                fmt = audio[offset + 8:offset + 8 + size]
                if size < 16 or int.from_bytes(fmt[0:2], "little") != 1 or int.from_bytes(fmt[2:4], "little") != 1 or int.from_bytes(fmt[4:8], "little") != 16000 or int.from_bytes(fmt[8:12], "little") != 32000 or int.from_bytes(fmt[12:14], "little") != 2 or int.from_bytes(fmt[14:16], "little") != 16:
                    raise ValueError()
            if audio[offset:offset + 4] == b"data":
                data_chunks += 1
            offset += 8 + size + size % 2
        if offset != len(audio) or formats != 1 or data_chunks != 1:
            raise ValueError()
        with wave.open(io.BytesIO(audio), "rb") as wav:
            frames = wav.getnframes()
            if wav.getcomptype() != "NONE" or wav.getnchannels() != 1 or wav.getsampwidth() != 2 or wav.getframerate() != 16000 or not 1600 <= frames <= 480000:
                raise ValueError()
            pcm = wav.readframes(frames)
            if len(pcm) != frames * 2:
                raise ValueError()
        return pcm, frames / 16, None if language == "auto" else language
    except (ValueError, wave.Error, EOFError):
        raise ValueError("INVALID_AUDIO") from None


class SpeechEngine:
    def __init__(self, model):
        self.model = model
        self.lock = threading.Lock()

    def transcribe(self, pcm, duration_ms, language):
        import numpy as np
        # No decoding of arbitrary media, external fetch, microphone or disk file.
        samples = np.frombuffer(pcm, dtype="<i2").astype(np.float32) / 32768.0
        started = time.monotonic()
        segments, info = self.model.transcribe(
            samples, language=language, task="transcribe", beam_size=3,
            word_timestamps=True, vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
            condition_on_previous_text=False, temperature=0.0,
            no_speech_threshold=0.6, hallucination_silence_threshold=1.0,
        )
        output = []
        word_count = 0
        for segment in segments:
            if time.monotonic() - started > 115 or len(output) >= 200:
                raise RuntimeError("ASR_TIMEOUT")
            words = []
            for word in segment.words or []:
                word_count += 1
                if word_count > 1000:
                    raise RuntimeError("ASR_OUTPUT_LIMIT")
                words.append({"startMs": round(word.start * 1000), "endMs": min(round(word.end * 1000), round(duration_ms)), "word": word.word, "probability": round(word.probability, 5)})
            text = segment.text.strip()
            if text and words:
                output.append({"startMs": round(segment.start * 1000), "endMs": min(round(segment.end * 1000), round(duration_ms)), "text": text, "words": words})
        text = " ".join(segment["text"] for segment in output)
        if len(text) > 16000:
            raise RuntimeError("ASR_OUTPUT_LIMIT")
        return {"text": text, "language": info.language, "durationMs": round(duration_ms), "model": MODEL_NAME, "segments": output}


class LocalServer(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 4

    def __init__(self, address, secret, engine):
        super().__init__(address, Handler)
        self.secret = secret
        self.engine = engine
        self.clients = threading.BoundedSemaphore(4)

    def process_request(self, request, client_address):
        if not self.clients.acquire(blocking=False):
            request.close()
            return
        super().process_request(request, client_address)

    def process_request_thread(self, request, address):
        try:
            super().process_request_thread(request, address)
        finally:
            self.clients.release()


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def setup(self):
        self.request.settimeout(10)
        super().setup()

    def log_message(self, *args):
        pass  # Neither secret, paths, audio nor recognized words enter HTTP logs.

    def reply(self, status, value):
        data = json.dumps(value, ensure_ascii=False).encode("utf-8")
        if len(data) > MAX_RESPONSE:
            status, data = 502, b'{"code":"ASR_OUTPUT_LIMIT"}'
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError, socket.timeout):
            pass

    def allowed(self):
        if sum(len(k) + len(v) for k, v in self.headers.items()) > 8192 or self.headers.get("Host") != f"127.0.0.1:{self.server.server_port}" or self.headers.get("Origin"):
            self.reply(403, {"code": "FORBIDDEN"})
            return False
        actual = self.headers.get("Authorization", "")
        if not hmac.compare_digest(hashlib.sha256(actual.encode()).digest(), hashlib.sha256(("Bearer " + self.server.secret).encode()).digest()):
            self.reply(401, {"code": "UNAUTHORIZED"})
            return False
        return True

    def do_GET(self):
        if not self.allowed():
            return
        self.reply(200, {"status": "ready", "model": MODEL_NAME}) if self.path == "/health" else self.reply(404, {"code": "NOT_FOUND"})

    def do_POST(self):
        if not self.allowed():
            return
        if self.path != "/v1/transcribe":
            self.reply(404, {"code": "NOT_FOUND"})
            return
        if not self.headers.get("Content-Type", "").lower().startswith("application/json") or self.headers.get("Transfer-Encoding"):
            self.reply(415, {"code": "INVALID_CONTENT_TYPE"})
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            size = 0
        if not 1 <= size <= MAX_BODY:
            self.reply(413, {"code": "BODY_TOO_LARGE"})
            return
        if not self.server.engine.lock.acquire(blocking=False):
            self.reply(429, {"code": "ASR_BUSY"})
            return
        try:
            body = self.rfile.read(size)
            if len(body) != size:
                raise ValueError("INVALID_INPUT")
            pcm, duration, language = decode_input(json.loads(body))
            status, value = 200, self.server.engine.transcribe(pcm, duration, language)
        except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
            status, value = 400, {"code": "INVALID_AUDIO"}
        except socket.timeout:
            status, value = 408, {"code": "INPUT_TIMEOUT"}
        except Exception:
            # A failed/cancelled chunk never becomes invented recognized words.
            status, value = 503, {"code": "ASR_UNAVAILABLE"}
        finally:
            self.server.engine.lock.release()
        # The mutex protects decoding/inference, not the HTTP response write.
        # The gateway may dispatch its next queued chunk as soon as it reads
        # this response; that chunk must not receive a stale ASR_BUSY.
        self.reply(status, value)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--env-file", required=True)
    args = parser.parse_args()
    # A fixed model downloaded by setup-speech.py. Runtime never downloads files.
    os.environ["HF_HUB_OFFLINE"] = "1"
    from faster_whisper import WhisperModel
    model = WhisperModel(str(Path(args.model_dir).resolve()), device="cpu", compute_type="int8", cpu_threads=2, num_workers=1, local_files_only=True)
    server = LocalServer(("127.0.0.1", 8788), secret_from_env(args.env_file), SpeechEngine(model))
    print("ASR local listo en 127.0.0.1:8788 (small int8 CPU).", flush=True)
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
