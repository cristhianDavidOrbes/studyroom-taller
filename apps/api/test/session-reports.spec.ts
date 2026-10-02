jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({ AccessToken: jest.fn(), RoomServiceClient: jest.fn() }));
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Ai, generationError, inputContextBudget, jobInstruction } from "../src/ai";
import { Documents, validateDocx } from "../src/documents";
import { RateLimiter } from "../src/core";
const i = { uid: "one", name: "Student", email: "local@example.invalid" };
describe("Historial, archivos y preguntas del reporte", () => {
  test("reporte y pregunta rechazan sesión ajena incluso conuidválido", async () => {
    const db: any = { session: { findUnique: jest.fn(async () => ({ id: "s", roomId: "r", participantIds: ["other"] })) } };
    const ai = new Ai(db, { member: jest.fn() } as any, new RateLimiter(), {} as any);
    await expect(ai.report("s", i)).rejects.toThrow(ForbiddenException);
    await expect(ai.reportQuestion("s", i, { question: "¿Qué dijo Ana?" })).rejects.toThrow(ForbiddenException);
  });
  test("original de archivo exige participante y proveniencia en esa sesión", async () => {
    const db: any = { session: { findUnique: jest.fn(async () => ({ id: "s", roomId: "r", participantIds: ["one"], context: {} })) }, sessionDocument: { findUnique: jest.fn(async () => null) }, document: { findFirst: jest.fn() } };
    const documents = new Documents(db, { member: jest.fn(async () => ({})) } as any);
    await expect(documents.sessionUrl("s", "foreign-document", i)).rejects.toThrow(ForbiddenException);
    expect(db.document.findFirst).not.toHaveBeenCalled();
    db.sessionDocument.findUnique.mockResolvedValue({ documentId: "deleted" }); db.document.findFirst.mockResolvedValue(null);
    await expect(documents.sessionUrl("s", "deleted", i)).rejects.toThrow(NotFoundException);
    await expect(documents.sessionUrl("s", "deleted", { ...i, uid: "outsider" })).rejects.toThrow(ForbiddenException);
  });
  test("pregunta usa fuentes del reporte, jobprivado, identifica recuperación parcial", async () => {
    const db: any = { aiJob: { findUnique: jest.fn(async () => null), count: jest.fn(async () => 0), upsert: jest.fn(async ({ create }) => ({ id: "answer", ...create })) } };
    const ai = new Ai(db, { events: { personal: jest.fn() } } as any, new RateLimiter());
    jest.spyOn(ai, "report").mockResolvedValue({ roomId: "r", messages: [{ id: "m", text: "Una derivada mide cambio" }], documents: [], jobs: [], transcription: { segments: [{ id: "voice", text: "La derivada instantánea", speakerName: "Ana", startMs: 0, endMs: 500 }], coverage: { status: "partial" } } } as any);
    const job = await ai.reportQuestion("s", i, { question: "¿Qué es una derivada?" });
    expect(job.kind).toBe("answer"); expect(job.shared).toBe(false); expect(job).not.toHaveProperty("payload");
    const create = db.aiJob.upsert.mock.calls[0][0].create;
    expect(create.payload.sources).toEqual(expect.arrayContaining(["transcripcion:voice", "mensaje:m"]));
    expect(create.payload.coverage.status).toBe("partial"); expect(create.userId).toBe(i.uid);
    expect(Buffer.byteLength(create.payload.context)).toBeLessThanOrEqual(inputContextBudget(jobInstruction("answer", create.payload)));
  });
  test("contexto que cabe llega directo al modelo, sin resúmenes innecesarios", async () => {
    const job: any = { id: "j", kind: "answer", userId: "u", roomId: "r", status: "failed", payload: { question: "¿Qué dijo?", context: "Texto reconocido ".repeat(95), sources: [] } };
    const tx: any = { aiJob: { findUniqueOrThrow: jest.fn(async () => job) } };
    const db: any = { ensureWriteSpace: jest.fn(), serial: jest.fn(async f => f(tx)) };
    const ai = new Ai(db, {} as any, new RateLimiter());
    const generate = jest.spyOn(ai, "generate").mockResolvedValue("Respuesta corta.");
    await ai.run(job, new AbortController().signal);
    expect(generate).toHaveBeenCalledTimes(1); expect(generate.mock.calls[0][4]).toBe(true);
    expect(generate.mock.calls[0][1]).toContain(job.payload.context);
  });
  test("mapreduce de reporte extenso condensa fuentes manteniendo texto original íntegro", async () => {
    const context = "En este fragmento estudiamos la base y altura. ".repeat(150);
    const job: any = { id: "j", kind: "summary", userId: "u", roomId: "r", status: "failed", payload: { context, sources: [] } };
    const db: any = { ensureWriteSpace: jest.fn(), serial: jest.fn(async f => f({ aiJob: { findUniqueOrThrow: async () => job } })) };
    const ai = new Ai(db, { events: { personal: jest.fn() } } as any, new RateLimiter());
    const generate = jest.spyOn(ai, "generate").mockImplementation(async (_job, prompt, _tokens, _signal, stream) => stream ? "Resumen final." : "Base y altura determinan el área.");
    await ai.run(job, new AbortController().signal);
    expect(generate.mock.calls.some(call => call[1].includes("máximo40palabras"))).toBe(true);
    expect(generate.mock.calls[generate.mock.calls.length - 1][4]).toBe(true);
    expect(job.payload.context).toBe(context);
  });
  test("límite de salida es un fallo de alcance explícito, no desconexión reintentable", () => {
    expect(() => generationError("OUTPUT_LIMIT")).toThrow("el reporte original permanece completo");
    expect(() => generationError("CONTEXT_TOO_LONG")).toThrow("Acota la pregunta");
    expect(() => generationError("INVALID_UPSTREAM")).toThrow("AI_STREAM_ERROR");
  });
  test("artefacto espera los lotes pendientes y refresca fuentes al procesar", async () => {
    const db: any = { ensureWriteSpace: jest.fn(), session: { findUniqueOrThrow: jest.fn(async () => ({ id: "s", endedAt: new Date(Date.now() - 70000) })) }, transcriptionBatch: { count: jest.fn(async () => 1) }, aiJob: { update: jest.fn() } };
    const ai = new Ai(db, {} as any, new RateLimiter());
    const generate = jest.spyOn(ai, "generate");
    await ai.run({ id: "j", sessionId: "s", payload: { reportArtifact: true }, status: "running" } as any, new AbortController().signal);
    expect(generate).not.toHaveBeenCalled(); expect(db.aiJob.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "queued", attempts: { decrement: 1 } }) }));
  });
  test("DOCX inválido no se interpreta como un archivoWord", async () => {
    await expect(validateDocx(Buffer.from("PK invalid docx"))).rejects.toThrow();
  });
});
