jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({ AccessToken: jest.fn(), RoomServiceClient: jest.fn() }));
import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Transcription, wavDuration } from "../src/transcription";
import { RateLimiter } from "../src/core";
export function wav(milliseconds = 1000) {
  const bytes = milliseconds * 32, b = Buffer.alloc(44 + bytes);
  b.write("RIFF", 0); b.writeUInt32LE(b.length - 8, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(16000, 24); b.writeUInt32LE(32000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(bytes, 40); return b;
}
function fixture(options: { enabled?: boolean; endedAt?: Date | null; active?: boolean } = {}) {
  const uid = "speaker", sessionId = randomUUID(), roomId = randomUUID();
  const session = { id: sessionId, roomId: roomId as string, startedAt: new Date(Date.now() - 10000), endedAt: options.endedAt ?? null, participantIds: [uid] };
  const member = { active: options.active ?? true, banned: false, joinedAt: session.startedAt, room: { status: session.endedAt ? "closed" : "open" }, user: { displayName: "Ana" } };
  const consent = { enabled: options.enabled ?? true, enabledSince: new Date(session.startedAt.getTime() + 1000) };
  const batches: any[] = [], segments: any[] = [];
  const tx: any = {
    session: { findUnique: jest.fn(async () => session) }, membership: { findUnique: jest.fn(async () => member) }, transcriptionConsent: { findUnique: jest.fn(async () => consent) },
    transcriptionBatch: {
      findUnique: jest.fn(async ({ where }) => batches.find(b => b.clientId === where.sessionId_userId_clientId.clientId) ?? null),
      create: jest.fn(async ({ data }) => { const b = { id: randomUUID(), status: "pending", ...data }; batches.push(b); return b; }),
      count: jest.fn(async () => 0),
      findUniqueOrThrow: jest.fn(async ({ where }) => { const b = batches.find(b => b.id === where.id); if (!b) throw new Error("missing"); return { ...b, segments: segments.filter(s => s.batchId === b.id) }; }),
      update: jest.fn(async ({ where, data }) => { const b = batches.find(b => b.id === where.id); Object.assign(b, data); return b; }),
      updateMany: jest.fn(async ({ where, data }) => { for (const b of batches) if (b.id === where.id && b.status === where.status) Object.assign(b, data); return { count: 1 }; }),
    }, transcriptSegment: { create: jest.fn(async ({ data }) => { const s = { id: randomUUID(), ...data }; segments.push(s); return s; }) },
  };
  const db: any = { ...tx, serial: jest.fn(async f => f(tx)) };
  const rooms: any = { member: jest.fn(async () => member), events: { emit: jest.fn() } };
  const service = new Transcription(db, rooms, new RateLimiter());
  const identity = { uid, name: "Untrusted displayName", email: "local@example.invalid" };
  const body = { clientId: randomUUID(), sessionId, startMs: 8000, endMs: 9000 };
  const file = { buffer: wav(), size: wav().length, mimetype: "audio/wav" } as Express.Multer.File;
  const response = { text: "Hola hola", language: "es", durationMs: 1000, model: "faster-whisper", segments: [{ text: "Hola hola", startMs: 0, endMs: 1000, words: [{ word: "Hola", startMs: 0, endMs: 400, probability: .9 }, { word: "hola", startMs: 500, endMs: 1000, probability: .9 }] }] };
  jest.spyOn(service, "gateway").mockResolvedValue(response);
  return { service, db, tx, rooms, identity, body, file, session, member, consent, batches, segments, response };
}
describe("Transcripción de audio consentida", () => {
  test("acepta solamente WAV PCM16 mono 16k y tamaño/duración consistentes", () => {
    expect(wavDuration(wav())).toBe(1000);
    for (const b of [Buffer.from("fake"), wav(30001), (() => { const b = wav(); b.writeUInt16LE(2, 22); return b; })(), (() => { const b = wav(); b.writeUInt32LE(24000, 24); return b; })()]) expect(() => wavDuration(b)).toThrow(BadRequestException);
  });
  test("rechaza consentimiento ausente, sesión ajena, expulsión y metadatos de identidad", async () => {
    const f = fixture({ enabled: false });
    await expect(f.service.audio(f.session.roomId, f.identity, f.body, f.file)).rejects.toThrow(ForbiddenException);
    f.consent.enabled = true; f.session.roomId = "other-room";
    await expect(f.service.audio("r", f.identity, f.body, f.file)).rejects.toThrow(ForbiddenException);
    f.session.roomId = "r"; f.member.banned = true;
    await expect(f.service.audio("r", f.identity, f.body, f.file)).rejects.toThrow(ForbiddenException);
    await expect(f.service.audio("r", f.identity, { ...f.body, userId: "other" }, f.file)).rejects.toThrow(BadRequestException);
    expect(f.service.gateway).not.toHaveBeenCalled();
  });
  test("rechaza audio previo al consentimiento y reloj futuro/duración falsa", async () => {
    const f = fixture();
    for (const b of [{ ...f.body, startMs: 0, endMs: 1000 }, { ...f.body, startMs: 20000, endMs: 21000 }, { ...f.body, endMs: 12000 }]) await expect(f.service.audio(f.session.roomId, f.identity, b, f.file)).rejects.toThrow(BadRequestException);
  });
  test("identidad del servidor y tiempos por palabra; no deduplica frases iguales", async () => {
    const f = fixture();
    const a = await f.service.audio(f.session.roomId, f.identity, f.body, f.file);
    expect(a.speakerId).toBe(f.identity.uid); expect(a).not.toHaveProperty("audioHash");
    expect(a.segments[0].speakerName).toBe("Ana"); expect((a.segments[0].words as any)[1].startMs).toBe(8500);
    await f.service.audio(f.session.roomId, f.identity, { ...f.body, clientId: randomUUID() }, f.file);
    expect(f.segments).toHaveLength(2);
  });
  test("mismo clientId es idempotente y rechaza reutilización con otro contenido", async () => {
    const f = fixture();
    const a = await f.service.audio(f.session.roomId, f.identity, f.body, f.file);
    expect((await f.service.audio(f.session.roomId, f.identity, f.body, f.file)).id).toBe(a.id);
    expect(f.service.gateway).toHaveBeenCalledTimes(1);
    const changed = { ...f.file, buffer: Buffer.from(f.file.buffer) }; changed.buffer[50] = 1;
    await expect(f.service.audio(f.session.roomId, f.identity, f.body, changed)).rejects.toThrow(ConflictException);
  });
  test("un fallo STT deja un intervalo visible y no almacena audio ni texto inventado", async () => {
    const f = fixture(); jest.spyOn(f.service, "gateway").mockRejectedValue(new Error("Disconnected private endpoint"));
    const a = await f.service.audio(f.session.roomId, f.identity, f.body, f.file);
    expect(a.status).toBe("failed"); expect(a.error).toContain("no se conservó"); expect(a.segments).toHaveLength(0);
    expect(f.tx.transcriptionBatch.create.mock.calls[0][0].data.audio).toBeUndefined();
    expect(a.error).not.toContain("private endpoint");
  });
  test("permite último lote al cerrar, clamp final, y rechaza cierre fuera de60segundos", async () => {
    const f = fixture({ endedAt: new Date(Date.now() - 1000), active: false });
    f.session.startedAt = new Date(Date.now() - 10000); f.consent.enabledSince = new Date(f.session.startedAt.getTime() + 1000);
    const end = f.session.endedAt!.getTime() - f.session.startedAt.getTime();
    const result = await f.service.audio(f.session.roomId, f.identity, { ...f.body, startMs: end - 500, endMs: end + 500 }, f.file);
    expect(result.endMs).toBe(end); expect(result.segments[0].endMs).toBe(end);
    f.session.endedAt = new Date(Date.now() - 61000);
    await expect(f.service.audio(f.session.roomId, f.identity, { ...f.body, clientId: randomUUID() }, f.file)).rejects.toThrow(ConflictException);
  });
  test("gap por respuesta HTTP perdida no pisa el lote ya completado", async () => {
    const f = fixture();
    const a = await f.service.audio(f.session.roomId, f.identity, f.body, f.file);
    const b = await f.service.gap(f.session.roomId, f.identity, { ...f.body, reason: "upload_failed" });
    expect(b.id).toBe(a.id); expect(b.status).toBe("succeeded"); expect(f.batches).toHaveLength(1);
  });
});
