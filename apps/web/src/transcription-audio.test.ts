import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioUploadQueue, captureMicrophone, encodeWav, PcmResampler, type AudioChunk } from "./transcription-audio";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const chunk = (number: number): AudioChunk => ({ clientId: `chunk-${number}`, sessionId: "session", startMs: number * 15000, endMs: (number + 1) * 15000, audio: encodeWav(Float32Array.of(0.1)) });
const workletSource = readFileSync(new URL("../public/audio/studyroom-pcm-worklet.js", import.meta.url), "utf8");
function processor(rate = 48000) {
  let constructor: new () => { process: (inputs: Float32Array[][], outputs: Float32Array[][]) => boolean; port: { postMessage: ReturnType<typeof vi.fn>; onmessage: (event: { data: { type: string } }) => void } };
  runInNewContext(workletSource, { sampleRate: rate, AudioWorkletProcessor: class { port = { postMessage: vi.fn(), onmessage: () => {} }; }, registerProcessor: (_name: string, value: typeof constructor) => { constructor = value; }, Float32Array, Math });
  return new constructor!();
}
describe("voz PCM continua sin interferir con la llamada", () => {
  it("genera WAV mono 16k PCM16 y satura correctamente sin desbordamiento", async () => {
    const wav = encodeWav(Float32Array.of(-2, -0.5, 0, 0.5, 2));
    const data = new DataView(await wav.arrayBuffer());
    expect(wav.type).toBe("audio/wav"); expect(wav.size).toBe(54);
    expect(data.getUint16(20, true)).toBe(1); expect(data.getUint16(22, true)).toBe(1);
    expect(data.getUint32(24, true)).toBe(16000); expect(data.getUint16(34, true)).toBe(16);
    expect(data.getInt16(44, true)).toBe(-32768); expect(data.getInt16(52, true)).toBe(32767);
  });
  it.each([48000, 44100])("no pierde muestras al cambiar de quantum a %i Hz", (rate) => {
    const signal = Float32Array.from({ length: rate }, (_, index) => Math.sin(index * 0.02));
    const continuous = new PcmResampler(rate).push(signal);
    const segmented = new PcmResampler(rate), pieces: number[] = [];
    for (let offset = 0; offset < signal.length; offset += 128) pieces.push(...segmented.push(signal.subarray(offset, offset + 128)));
    expect(pieces).toEqual(Array.from(continuous)); expect(pieces.length).toBeGreaterThanOrEqual(15999);
  });
  it("el procesador real emite 15 segundos contiguos, conserva el final y siempre produce silencio", () => {
    const instance = processor();
    let consumed = 0;
    while (consumed < 48000 * 16) {
      const output = Float32Array.from({ length: 128 }, () => 1);
      instance.process([[Float32Array.from({ length: 128 }, () => 0.1)]], [[output]]);
      expect(output.every((value) => value === 0)).toBe(true);
      consumed += 128;
    }
    instance.port.onmessage({ data: { type: "flush" } });
    const sent = instance.port.postMessage.mock.calls.map(([message]) => message);
    expect(sent).toHaveLength(2); expect(sent[0].samples.length).toBe(16000 * 15);
    expect(sent[0].voiced).toBe(true); expect(sent[1].flushed).toBe(true);
    expect(sent[0].samples.length + sent[1].samples.length).toBe(16000 * 16);
  });
  it("omite un silencio real sin confundirlo con una transcripción completada", () => {
    const instance = processor(); instance.process([[new Float32Array(128)]], [[new Float32Array(128)]]);
    instance.port.onmessage({ data: { type: "flush" } });
    expect(instance.port.postMessage.mock.calls[0][0].voiced).toBe(false);
  });
  it("una subida lenta limita memoria a cinco fragmentos pendientes y conserva el orden restante", async () => {
    const resolve: (() => void)[] = [], sent: string[] = [];
    const gap = vi.fn(), error = vi.fn();
    const queue = new AudioUploadQueue((item) => new Promise<void>((done) => { sent.push(item.clientId); resolve.push(done); }), error, undefined, gap);
    for (let index = 0; index < 8; index++) queue.enqueue(chunk(index));
    expect(sent).toEqual(["chunk-0"]);
    expect(gap.mock.calls.map(([item, reason]) => [item.clientId, reason])).toEqual([["chunk-1", "queue_overflow"], ["chunk-2", "queue_overflow"]]);
    for (let index = 0; index < 6; index++) { resolve[index](); await Promise.resolve(); await Promise.resolve(); }
    expect(sent).toEqual(["chunk-0", "chunk-3", "chunk-4", "chunk-5", "chunk-6", "chunk-7"]);
    await queue.drain(); expect(error).toHaveBeenCalledTimes(2);
  });
  it("un servicio que no responde aborta su petición a 130s y avisa del fragmento perdido", async () => {
    vi.useFakeTimers(); const gap = vi.fn(); let signal!: AbortSignal;
    const queue = new AudioUploadQueue((_item, abort) => { signal = abort; return new Promise((_resolve, reject) => abort.addEventListener("abort", () => reject(new Error("Voz no disponible")))); }, vi.fn(), undefined, gap);
    queue.enqueue(chunk(0)); await vi.advanceTimersByTimeAsync(130000);
    expect(signal.aborted).toBe(true); expect(gap).toHaveBeenCalledWith(expect.objectContaining({ clientId: "chunk-0" }), "upload_failed");
  });
  it("el cierre libera la cola a 55s y registra los huecos sin bloquear navegación", async () => {
    vi.useFakeTimers(); const gap = vi.fn();
    const queue = new AudioUploadQueue((_item, signal) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("Fin")))), vi.fn(), undefined, gap);
    queue.enqueue(chunk(0)); queue.enqueue(chunk(1));
    const drained = queue.drain(55000); await vi.advanceTimersByTimeAsync(55000); await drained;
    expect(gap).toHaveBeenCalledTimes(2);
  });
  it("usa la pista existente, vacía la última voz y nunca detiene ni vuelve a solicitar el micrófono", async () => {
    const original = { readyState: "live", stop: vi.fn() } as unknown as MediaStreamTrack;
    const source = { connect: vi.fn(), disconnect: vi.fn() }, gain = { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() };
    const node = { connect: vi.fn(), disconnect: vi.fn(), port: { onmessage: null as unknown as (event: MessageEvent) => void, postMessage: vi.fn((message) => { if (message.type === "flush") node.port.onmessage({ data: { samples: Float32Array.of(0.1, 0.2), voiced: true, flushed: true } } as unknown as MessageEvent); }) } };
    const close = vi.fn().mockResolvedValue(undefined), createSource = vi.fn((_stream: unknown) => source);
    class Context { state = "running"; audioWorklet = { addModule: vi.fn().mockResolvedValue(undefined) }; destination = {}; resume = vi.fn().mockResolvedValue(undefined); createMediaStreamSource = createSource; createGain = () => gain; close = close; }
    class Stream { constructor(public tracks: MediaStreamTrack[]) {} }
    vi.stubGlobal("window", { AudioContext: Context, AudioWorkletNode: class {} });
    vi.stubGlobal("AudioContext", Context); vi.stubGlobal("AudioWorkletNode", function () { return node; }); vi.stubGlobal("MediaStream", Stream);
    const onChunk = vi.fn(), anchor = vi.fn(() => 1200); const capture = await captureMicrophone(original, "session", anchor, onChunk);
    expect(anchor).toHaveBeenCalledTimes(1);
    expect((createSource.mock.calls[0][0] as { tracks: MediaStreamTrack[] }).tracks).toEqual([original]); expect(gain.gain.value).toBe(0);
    await capture.stop(); await capture.stop();
    expect(onChunk).toHaveBeenCalledTimes(1); expect(onChunk.mock.calls[0][0].startMs).toBe(1200);
    expect(original.stop).not.toHaveBeenCalled(); expect(close).toHaveBeenCalledTimes(1);
  });
});
