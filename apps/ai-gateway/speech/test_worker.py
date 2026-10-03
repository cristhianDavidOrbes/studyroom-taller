import base64
import http.client
import io
import json
import threading
import unittest
import wave
from worker import Handler, LocalServer, decode_input


def audio(seconds=1, rate=16000):
    result = io.BytesIO()
    with wave.open(result, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes(b"\0\0" * int(rate * seconds))
    return {"audioBase64": base64.b64encode(result.getvalue()).decode(), "mimeType": "audio/wav", "language": "es"}


class WorkerTests(unittest.TestCase):
    def test_audio_boundaries(self):
        self.assertEqual(decode_input(audio(30))[1], 30000)
        for invalid in [audio(.01), audio(30.1), audio(1, 48000), {**audio(), "url": "https://external"}, {**audio(), "audioBase64": "fake"}]:
            with self.assertRaises(ValueError):
                decode_input(invalid)

    def test_private_worker_host_origin_auth_and_busy(self):
        class Stub:
            lock = threading.Lock()
            fail = False
            def transcribe(self, *args):
                if self.fail:
                    raise RuntimeError("MODEL_FAILURE")
                return {"text": "", "segments": []}
        engine = Stub()
        released_before_reply = []
        class ObservedReply(Handler):
            def reply(self, status, value):
                if self.path == "/v1/transcribe" and status in (200, 400, 408, 503):
                    # Check before any HTTP bytes leave the handler. This fails
                    # deterministically if cleanup still follows the response.
                    acquired = engine.lock.acquire(blocking=False)
                    released_before_reply.append(acquired)
                    if acquired:
                        engine.lock.release()
                super().reply(status, value)
        server = LocalServer(("127.0.0.1", 0), "a" * 64, engine)
        server.RequestHandlerClass = ObservedReply
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        def request(path="/health", headers=None, body=None):
            conn = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=3)
            values = {"Authorization": "Bearer " + "a" * 64, **(headers or {})}
            conn.request("POST" if body is not None else "GET", path, body=body, headers=values)
            response = conn.getresponse()
            response.read()
            conn.close()
            return response.status
        try:
            self.assertEqual(request(), 200)
            self.assertEqual(request(headers={"Authorization": "Bearer wrong"}), 401)
            self.assertEqual(request(headers={"Host": "example.com"}), 403)
            self.assertEqual(request(headers={"Origin": "https://studyroom-sut.onrender.com"}), 403)
            self.assertEqual(request("/other"), 404)
            body = json.dumps(audio())
            self.assertEqual(request("/v1/transcribe", {"Content-Type": "application/json"}, body), 200)
            self.assertEqual(released_before_reply, [True])
            self.assertEqual(request("/v1/transcribe", {"Content-Type": "application/json"}, "bad"), 400)
            engine.fail = True
            self.assertEqual(request("/v1/transcribe", {"Content-Type": "application/json"}, body), 503)
            engine.fail = False
            self.assertEqual(released_before_reply, [True, True, True])
            engine.lock.acquire()
            try:
                self.assertEqual(request("/v1/transcribe", {"Content-Type": "application/json"}, body), 429)
                self.assertTrue(engine.lock.locked(), "Busy response must not release a lock it did not acquire")
            finally:
                engine.lock.release()
        finally:
            server.shutdown()
            server.server_close()
            thread.join()


if __name__ == "__main__":
    unittest.main()
