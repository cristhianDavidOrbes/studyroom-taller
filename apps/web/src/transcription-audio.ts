/** Keeps resampling continuous across microphone render quanta. */
export class PcmResampler {
  private next = 0;
  private consumed = 0;
  private previous = 0;
  constructor(private inputRate: number, private outputRate = 16000) {
    if (inputRate < outputRate || !Number.isFinite(inputRate))
      throw new Error("Frecuencia de audio no compatible");
  }
  push(input: Float32Array): Float32Array {
    const output: number[] = [];
    const end = this.consumed + input.length;
    const step = this.inputRate / this.outputRate;
    while (this.next < end - 1) {
      const position = this.next - this.consumed;
      const index = Math.floor(position);
      const first = index < 0 ? this.previous : input[index];
      const second = input[index + 1];
      output.push(first + (second - first) * (position - index));
      this.next += step;
    }
    if (input.length) this.previous = input[input.length - 1];
    this.consumed = end;
    return Float32Array.from(output);
  }
}

export function encodeWav(samples: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const data = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) data.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, "RIFF"); data.setUint32(4, buffer.byteLength - 8, true);
  write(8, "WAVE"); write(12, "fmt "); data.setUint32(16, 16, true);
  data.setUint16(20, 1, true); data.setUint16(22, 1, true);
  data.setUint32(24, 16000, true); data.setUint32(28, 32000, true);
  data.setUint16(32, 2, true); data.setUint16(34, 16, true);
  write(36, "data"); data.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    data.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export interface AudioChunk {
  clientId: string;
  sessionId: string;
  startMs: number;
  endMs: number;
  audio: Blob;
}

/** One upload at a time; a slow/offline STT service cannot grow browser memory. */
export class AudioUploadQueue {
  private pending: AudioChunk[] = [];
  private active: AbortController | null = null;
  private stopped = false;
  private waiters: (() => void)[] = [];
  constructor(
    private send: (chunk: AudioChunk, signal: AbortSignal) => Promise<void>,
    private onError: (message: string) => void,
    private onCount: (count: number) => void = () => {},
    private onGap: (chunk: AudioChunk, reason: "queue_overflow" | "upload_failed") => void = () => {},
  ) {}
  enqueue(chunk: AudioChunk) {
    if (this.stopped) return;
    if (this.pending.length >= 5) {
      const dropped = this.pending.shift()!;
      this.onGap(dropped, "queue_overflow");
      this.onError("El servicio de voz está tardando demasiado. Un fragmento no pudo enviarse; la transcripción tiene un hueco.");
    }
    this.pending.push(chunk);
    this.onCount(this.pending.length + (this.active ? 1 : 0));
    void this.pump();
  }
  private async pump() {
    if (this.active || this.stopped) return;
    const chunk = this.pending.shift();
    if (!chunk) {
      this.onCount(0);
      this.waiters.splice(0).forEach((done) => done());
      return;
    }
    const controller = new AbortController();
    this.active = controller;
    const deadline = setTimeout(() => controller.abort(), 130000);
    try {
      await this.send(chunk, controller.signal);
    } catch (error) {
      this.onGap(chunk, "upload_failed");
      if (!this.stopped) this.onError(error instanceof Error ? error.message : "No se pudo transcribir un fragmento de voz.");
    } finally {
      clearTimeout(deadline);
      this.active = null;
      this.onCount(this.pending.length);
      void this.pump();
    }
  }
  drain(timeout = 60000): Promise<void> {
    if (!this.active && !this.pending.length) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.onError("No se pudieron enviar todos los fragmentos pendientes. El reporte conserva lo que sí se transcribió.");
        this.abort();
        resolve();
      }, timeout);
      this.waiters.push(() => { clearTimeout(timer); resolve(); });
    });
  }
  abort() {
    this.stopped = true;
    for (const chunk of this.pending) this.onGap(chunk, "upload_failed");
    this.pending = [];
    this.active?.abort();
    this.onCount(0);
    this.waiters.splice(0).forEach((done) => done());
  }
}

export interface MicrophoneCapture { stop: () => Promise<void> }

export async function captureMicrophone(
  track: MediaStreamTrack,
  sessionId: string,
  startMs: number | (() => number),
  onChunk: (chunk: AudioChunk) => void,
): Promise<MicrophoneCapture> {
  if (!window.AudioContext || !window.AudioWorkletNode)
    throw new Error("Este navegador no puede transcribir la voz. Usa una versión reciente de Chrome, Edge o Firefox.");
  const context = new AudioContext();
  let source: MediaStreamAudioSourceNode | undefined;
  let processor: AudioWorkletNode | undefined;
  let mute: GainNode | undefined;
  let stopped = false;
  let stopTask: Promise<void> | undefined;
  let flushDone: (() => void) | undefined;
  const bounded = async <T>(task: Promise<T>): Promise<T> => {
    let timer: ReturnType<typeof setTimeout>;
    try { return await Promise.race([task, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("El navegador no pudo iniciar el procesamiento de voz. Vuelve a activar la transcripción.")), 10000); })]); }
    finally { clearTimeout(timer!); }
  };
  try {
    // Existing LiveKit microphone, never request or stop a second microphone.
    await bounded(context.resume());
    if (context.state !== "running") throw new Error("El navegador pausó el audio. Vuelve a activar la transcripción desde el botón de Voz.");
    await bounded(context.audioWorklet.addModule("/audio/studyroom-pcm-worklet.js"));
    if (track.readyState !== "live") throw new Error("El micrófono se apagó antes de comenzar. Actívalo y vuelve a intentarlo.");
    source = context.createMediaStreamSource(new MediaStream([track]));
    processor = new AudioWorkletNode(context, "studyroom-pcm");
    mute = context.createGain();
    mute.gain.value = 0;
    // Anchor after resume/module loading, just before connecting the live microphone.
    let offset = Math.max(0, Math.round(typeof startMs === "function" ? startMs() : startMs));
    processor.port.onmessage = (event: MessageEvent<{ samples?: Float32Array; voiced?: boolean; flushed?: boolean }>) => {
      const { samples, voiced, flushed } = event.data;
      if (samples?.length) {
        const duration = Math.round(samples.length * 1000 / 16000);
        if (voiced) onChunk({ clientId: crypto.randomUUID(), sessionId, startMs: offset, endMs: offset + duration, audio: encodeWav(samples) });
        offset += duration;
      }
      if (flushed) flushDone?.();
    };
    // Worklet produces only zero-valued output. Gain=0 also prevents monitoring/echo.
    source.connect(processor); processor.connect(mute); mute.connect(context.destination);
    return {
      stop() {
        if (stopTask) return stopTask;
        stopped = true;
        stopTask = (async () => {
          await new Promise<void>((resolve) => {
            let timer: ReturnType<typeof setTimeout>;
            flushDone = () => { clearTimeout(timer); resolve(); };
            timer = setTimeout(resolve, 250);
            processor!.port.postMessage({ type: "flush" });
          });
          source?.disconnect(); processor?.disconnect(); mute?.disconnect();
          processor!.port.onmessage = null;
          await context.close().catch(() => {});
        })();
        return stopTask;
      },
    };
  } catch (error) {
    if (!stopped) { source?.disconnect(); processor?.disconnect(); mute?.disconnect(); await context.close().catch(() => {}); }
    throw error;
  }
}
