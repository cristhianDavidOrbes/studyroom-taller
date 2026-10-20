jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({ AccessToken: jest.fn(), RoomServiceClient: jest.fn() }));
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PATH_METADATA } from "@nestjs/common/constants";
import { Ai, generationError, inputContextBudget, jobInstruction } from "../src/ai";
import { Documents, validateDocx } from "../src/documents";
import { RateLimiter } from "../src/core";
import { Rooms } from "../src/rooms";
import { AppController } from "../src/controller";
import { documentContracts } from "../src/openapi";
import { reportMarkdown } from "../src/report-context";
import { reportArchiveHTML } from "../src/report-archive";
const i = { uid: "one", name: "Student", email: "local@example.invalid" };
describe("Historial, archivos y preguntas del reporte", () => {
  test("cerrar guarda la sesión sin crear síntesis adicionales", async () => {
    const session = { id: "s", roomId: "r", startedAt: new Date(Date.now() - 1000), participantIds: [i.uid] };
    const tx: any = {
      room: { findUniqueOrThrow: jest.fn(async () => ({ id: "r", status: "open" })), update: jest.fn() },
      invite: { deleteMany: jest.fn() },
      session: { findFirst: jest.fn(async () => session), update: jest.fn(async () => ({ ...session, endedAt: new Date() })) },
      message: { findMany: jest.fn(async () => [{ id: "m", text: "Base por altura", userId: i.uid, displayName: "Ana", kind: "user", createdAt: new Date() }]) },
      document: { findMany: jest.fn(async () => []) },
      membership: { findMany: jest.fn(async () => [{ userId: i.uid }]) },
      aiJob: { upsert: jest.fn(async ({ create }) => ({ id: create.kind, ...create })) },
    };
    const db: any = { serial: jest.fn(async callback => callback(tx)) };
    const rooms = new Rooms(db, { emit: jest.fn() } as any, new RateLimiter());
    jest.spyOn(rooms, "member").mockResolvedValue({ role: "host" } as any);
    jest.spyOn(rooms, "mediaClient").mockReturnValue({ deleteRoom: jest.fn() } as any);
    await rooms.close("r", i);
    expect(tx.aiJob.upsert).not.toHaveBeenCalled();
    const artifact = jest.fn();
    const controller = new AppController({ close: jest.fn(async () => ({ id: "s" })) } as any,
      {} as any, {} as any, { artifact } as any, {} as any, {} as any);
    artifact.mockResolvedValue({});
    await controller.close({ identity: i } as any, "r");
    expect(artifact).not.toHaveBeenCalled();
  });
  test("rechaza crear cuestionarios y no procesa los trabajos antiguos", async () => {
    const db: any = { aiJob: { upsert: jest.fn() }, ensureWriteSpace: jest.fn() };
    const ai = new Ai(db, {} as any, new RateLimiter());
    const generate = jest.spyOn(ai, "generate");
    await expect(ai.artifact("s", i, { kind: "quiz" })).rejects.toThrow(BadRequestException);
    await expect(ai.run({ id: "old", kind: "quiz", payload: {} } as any, new AbortController().signal)).rejects.toThrow(BadRequestException);
    expect(db.aiJob.upsert).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });
  test("historial, detalle, reporte y exportación excluyen quiz sin borrar sus datos", async () => {
    const session = { id: "s", roomId: "r", title: "Geometría", startedAt: new Date(), endedAt: new Date(), participantIds: [i.uid], context: { messages: [] } };
    const legacyQuiz = { id: "old", kind: "quiz", shared: true, status: "completed", result: { questions: [{ question: "LEGACY_QUIZ_HIDDEN" }] } };
    const summary = { id: "summary", kind: "summary", shared: true, status: "completed", result: { text: "Resumen del área" } };
    const jobs = [legacyQuiz, summary], before = JSON.stringify(jobs);
    const db: any = {
      session: { findUnique: jest.fn(async () => session), findMany: jest.fn(async () => [{ ...session, jobs }]) },
      aiJob: { findMany: jest.fn(async () => jobs), findUnique: jest.fn(async () => legacyQuiz) },
      quizAttempt: { findMany: jest.fn() },
      sessionDocument: { findMany: jest.fn(async () => []) }, document: { findMany: jest.fn(async () => []) },
    };
    const ai = new Ai(db, { member: jest.fn() } as any, new RateLimiter(), { view: jest.fn(async () => ({
      segments: [], batches: [], coverage: { notice: "Sin voz", status: "none", pendingBatches: 0, failedBatches: 0 },
    })) } as any);
    const history = await ai.history(i), detail = await ai.detail("s", i), report = await ai.report("s", i);
    for (const value of [history[0], detail, report]) {
      expect(value.jobs.map(job => job.kind)).toEqual(["summary"]);
      expect(value).not.toHaveProperty("attempts");
      expect(JSON.stringify(value)).not.toContain("LEGACY_QUIZ_HIDDEN");
    }
    expect(reportMarkdown(report)).toContain("Resumen del área");
    expect(reportMarkdown(report)).not.toContain("LEGACY_QUIZ_HIDDEN");
    expect(db.quizAttempt.findMany).not.toHaveBeenCalled();
    expect(db.aiJob.findMany.mock.calls[0][0].where.kind).toEqual({ not: "quiz" });
    expect(db.session.findMany.mock.calls[0][0].include).not.toHaveProperty("attempts");
    await expect(ai.get("old", i)).rejects.toThrow(NotFoundException);
    expect(JSON.stringify(jobs)).toBe(before);
  });
  test("leer resúmenes antiguos normaliza sus referencias en reporte y exportaciones sin escribir ni mutar el registro", async () => {
    const voice = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c50", chat = "7483c2fa-d3c1-40fe-b569-83ba6e1a2309";
    const missing = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c51";
    const original = Object.freeze({ text: `Estudiamos el área (fuentes: ${voice}, ${chat}, ${missing}).`, sources: Object.freeze([`transcripcion:${voice}`, `mensaje:${chat}`]), contextFragments: 2 });
    const job = Object.freeze({ id: "summary", kind: "summary", shared: true, status: "completed", result: original, payload: { context: "CONTEXTO_PRIVADO" } });
    const jobs = Object.freeze([job]), before = JSON.stringify(jobs);
    const session = { id: "s", roomId: "r", title: "Geometría", startedAt: new Date(), endedAt: new Date(), participantIds: [i.uid], context: { messages: [{ id: chat, text: "Base por altura", displayName: "Luis" }] } };
    const db: any = {
      session: { findUnique: jest.fn(async () => session) },
      aiJob: { findMany: jest.fn(async () => jobs), update: jest.fn(), updateMany: jest.fn() },
      sessionDocument: { findMany: jest.fn(async () => []) }, document: { findMany: jest.fn(async () => []) },
    };
    const ai = new Ai(db, { member: jest.fn() } as any, new RateLimiter(), { view: jest.fn(async () => ({
      segments: [{ id: voice, speakerName: "Ana", text: "Estudiamos el área", startMs: 0, endMs: 1000 }], batches: [], coverage: { notice: "Reconocimiento automático", status: "complete", pendingBatches: 0, failedBatches: 0 },
    })) } as any);
    const detail = await ai.detail("s", i), report = await ai.report("s", i);
    const expected = `Estudiamos el área (fuentes: [transcripcion:${voice}], [mensaje:${chat}], Referencia no disponible).`;
    for (const value of [detail, report]) {
      expect(value.jobs[0].result.text).toBe(expected);
      expect(value.jobs[0].result).not.toBe(original);
      expect(value.jobs[0].result.contextFragments).toBe(2);
      expect(JSON.stringify(value)).not.toContain("CONTEXTO_PRIVADO");
    }
    expect(reportMarkdown(report)).toContain(expected);
    const html = reportArchiveHTML(report, []);
    expect(html).toContain("Voz · Ana · 00:00"); expect(html).toContain("Mensaje · Luis");
    expect(html).toContain("Referencia no disponible");
    for (const id of [voice, chat, missing]) expect(html).not.toContain(id);
    expect(db.aiJob.update).not.toHaveBeenCalled(); expect(db.aiJob.updateMany).not.toHaveBeenCalled();
    expect(JSON.stringify(jobs)).toBe(before);
  });
  test("contrato API admite solo partes del reporte y elimina la ruta de intentos", () => {
    const spec = documentContracts({ paths: { "/api/sessions/{id}/artifacts": { post: { responses: {} } } } } as any);
    expect((spec.components!.schemas!.Artifact as any).properties.kind.enum).toEqual(["summary", "keypoints"]);
    expect(spec.components!.schemas).not.toHaveProperty("QuizAttempt");
    const routes = Object.getOwnPropertyNames(AppController.prototype).map(name =>
      Reflect.getMetadata(PATH_METADATA, Object.getOwnPropertyDescriptor(AppController.prototype, name)?.value ?? {}));
    expect(routes).not.toContain("sessions/:id/quiz/attempts");
    expect(() => jobInstruction("quiz", {})).toThrow(BadRequestException);
  });
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
