jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({ AccessToken: jest.fn(), RoomServiceClient: jest.fn() }));
import { ForbiddenException, HttpException, NotFoundException, PayloadTooLargeException, ServiceUnavailableException } from "@nestjs/common";
import JSZip from "jszip";
import { createHash } from "node:crypto";
import { PassThrough, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createReportArchive, reportArchiveHTML, REPORT_ARCHIVE_MAX_BYTES, type ArchiveReport } from "../src/report-archive";
import { Documents } from "../src/documents";
import { Ai } from "../src/ai";
import { AppController } from "../src/controller";
import { CAPS, RateLimiter } from "../src/core";

const identity = { uid: "student", name: "Ana", email: "local@example.invalid" };
const start = new Date("2026-10-02T15:00:00.000Z");
function report(): ArchiveReport {
  return { id: "session", title: "Geometría en compañía", startedAt: start, endedAt: new Date(start.getTime() + 60000), messages: [], documents: [], jobs: [], transcription: { segments: [], batches: [], participants: [{ userId: identity.uid, displayName: "Ana" }], coverage: { status: "partial", notice: "La voz reconocida puede tener errores.", pendingBatches: 0, failedBatches: 1 } } };
}
async function unzip(archive: Awaited<ReturnType<typeof createReportArchive>>) {
  const chunks: Buffer[] = [];
  await pipeline(archive.stream, new Writable({ write(chunk, _encoding, callback) { chunks.push(Buffer.from(chunk)); callback(); } }));
  return JSZip.loadAsync(Buffer.concat(chunks), { checkCRC32: true });
}
function originalFixture() {
  const usage = { id: "month", storageEgress: 0n };
  const doc = { id: "doc", roomId: "room", path: "PRIVATE_STORAGE_PATH", size: 5 };
  const tx: any = { usage: { upsert: jest.fn(async () => usage), update: jest.fn() } };
  const db: any = { session: { findUnique: jest.fn(async () => ({ id: "session", roomId: "room", participantIds: [identity.uid], context: {} })) }, sessionDocument: { findUnique: jest.fn(async () => ({ documentId: doc.id })) }, document: { findFirst: jest.fn(async () => doc) }, serial: jest.fn(async callback => callback(tx)) };
  const rooms: any = { member: jest.fn(async () => ({})) };
  const service = new Documents(db, rooms);
  const storage = { download: jest.fn(async () => ({ data: new Blob(["hello"]), error: null })) };
  const storageFactory = jest.spyOn(service as any, "storage").mockReturnValue(storage);
  return { service, db, tx, rooms, doc, storage, storageFactory, usage };
}

describe("Reporte ZIP completo y autorizado", () => {
  test("incluye cada original, previsualiza imágenes y declara eliminados sin inventar contenido", async () => {
    const input = report();
    const types = ["image/png", "image/jpeg", "image/webp", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    input.documents = types.map((mimeType, index) => ({ id: `doc-${index}`, name: index === 0 ? "Área compartida.png" : "apunte.txt", mimeType, size: 5, available: true, extractedText: "Texto del recurso", createdAt: start, uploadedBy: identity.uid }));
    input.documents.push({ id: "deleted", name: "Archivo eliminado.pdf", mimeType: "application/pdf", size: 50, available: false, extractedText: "Texto conservado del eliminado", extractionStatus: "text", createdAt: new Date(start.getTime() + 60000) });
    const download = jest.fn(async (id: string) => Buffer.from(id));
    const archive = await createReportArchive(input, download), zip = await unzip(archive);
    expect(download.mock.calls.map(call => call[0])).toEqual(types.map((_, index) => `doc-${index}`));
    expect(archive.resources).toHaveLength(7);
    for (const original of archive.resources.filter(resource => resource.status === "included")) {
      const bytes = await zip.file(original.archivePath!)!.async("nodebuffer");
      expect(bytes.toString()).toBe(original.id);
      expect(original.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    }
    const manifest = JSON.parse(await zip.file("recursos.json")!.async("string"));
    expect(manifest.at(-1)).toEqual(expect.objectContaining({ id: "deleted", status: "unavailable", archivePath: null, notice: expect.stringContaining("eliminado") }));
    const html = await zip.file("index.html")!.async("string");
    expect((html.match(/<img /g) || [])).toHaveLength(3);
    expect(html).toContain("recursos/doc-0-001-%C3%81rea%20compartida.png");
    expect(html).toContain("Texto conservado del eliminado");
    expect(html).toContain("Original eliminado o no disponible");
    expect(Object.keys(zip.files).filter(name => !zip.files[name].dir)).toHaveLength(11);
    expect(zip.file("reporte.docx")).not.toBeNull();
    expect(JSON.parse(await zip.file("reporte.json")!.async("string")).documents).toHaveLength(7);
    expect(await zip.file("LEEME.txt")!.async("string")).toContain("abre index.html");
  });
  test("ordena voz tardía, chat y recursos por su momento original y preserva todas las palabras", async () => {
    const input = report();
    input.transcription.segments = [{ id: "late", speakerName: "Ana", speakerId: identity.uid, text: "VOICE_LATER", startMs: 30000, endMs: 31000, words: [{ word: "VOICE_LATER", startMs: 30001, endMs: 30599, probability: 0.8 }] }, { id: "early", speakerName: "Luis", speakerId: "guest", text: "VOICE_EARLY", startMs: 1000, endMs: 2000, words: [{ word: "VOICE_EARLY", startMs: 1010, endMs: 1900 }] }];
    input.messages = [{ id: "chat", displayName: "Ana", text: "CHAT_BETWEEN", createdAt: new Date(start.getTime() + 5000) }];
    input.documents = [{ id: "doc", name: "FILE_BETWEEN.txt", mimeType: "text/plain", size: 5, available: true, createdAt: new Date(start.getTime() + 10000) }];
    const before = JSON.stringify(input), zip = await unzip(await createReportArchive(input, async () => Buffer.from("hello")));
    const html = await zip.file("index.html")!.async("string"), json = JSON.parse(await zip.file("reporte.json")!.async("string"));
    expect(html.indexOf("VOICE_EARLY")).toBeLessThan(html.indexOf("CHAT_BETWEEN"));
    expect(html.indexOf("CHAT_BETWEEN")).toBeLessThan(html.indexOf("FILE_BETWEEN"));
    expect(html.indexOf("FILE_BETWEEN")).toBeLessThan(html.indexOf("VOICE_LATER"));
    expect(json.transcription.segments.map((segment: any) => segment.id)).toEqual(["early", "late"]);
    expect(json.transcription.segments[1].words).toEqual(input.transcription.segments[0].words);
    expect(JSON.stringify(input)).toBe(before);
  });
  test("escapa contenido hostil, crea rutas únicas y referencias legibles solo si están autorizadas", async () => {
    const input = report();
    input.title = '<script>alert("title")</script>';
    input.transcription.segments = [{ id: "voice", speakerName: 'Ana <img onerror="x">', speakerId: identity.uid, text: '<script>alert("voice")</script>', startMs: 0, endMs: 1000 }];
    input.documents = ["../x.png", "..\\x.png", "javascript:alert(1)\".png"].map((name, index) => ({ id: index < 2 ? "duplicate" : "../unsafe/id", name, mimeType: "image/png", size: 1, available: true }));
    input.jobs = [{ id: "summary", kind: "summary", shared: true, status: "completed", result: { text: '<img src=x onerror="x"> [TRANSCRIPCIÓn:voice] [documento:foreign] [nota: repasar]', sources: ["transcripcion:voice", "documento:foreign"] } }, { id: "legacy", kind: "quiz", status: "completed", result: { text: "LEGACY_QUIZ_HIDDEN" } }];
    const archive = await createReportArchive(input, async () => Buffer.from("x")), zip = await unzip(archive), html = await zip.file("index.html")!.async("string");
    expect(html).not.toMatch(/<script\b|<img src=x|onerror="x"/i);
    expect(html).toContain("&lt;script&gt;"); expect(html).toContain("Voz · Ana &lt;img");
    expect(html).toContain('href="#voz-0"'); expect(html).toContain("Referencia no disponible"); expect(html).toContain("[nota: repasar]");
    expect(html).not.toContain("[documento:foreign]");
    expect(html).not.toContain("LEGACY_QUIZ_HIDDEN");
    expect(new Set(archive.resources.map(resource => resource.archivePath)).size).toBe(3);
    for (const resource of archive.resources) { expect(resource.archivePath).toMatch(/^recursos\/[a-zA-Z0-9_-]+-\d+-[^/\\]+$/); expect(resource.archivePath!.split("/")).toHaveLength(2); }
    expect(html).not.toMatch(/(?:href|src)="(?:https?:|javascript:|data:)/i);
    expect(JSON.parse(await zip.file("reporte.json")!.async("string")).jobs).toHaveLength(1);
  });
  test("rechaza archivos grandes antes de descargarlos y no entrega un ZIP si falta un original disponible", async () => {
    const input = report();
    input.documents = Array.from({ length: 13 }, (_, index) => ({ id: `doc-${index}`, name: "Original.txt", mimeType: "text/plain", size: 10_000_000, available: true }));
    const download = jest.fn(async () => Buffer.from("x"));
    await expect(createReportArchive(input, download)).rejects.toThrow(PayloadTooLargeException);
    expect(download).not.toHaveBeenCalled();
    input.documents = [{ ...input.documents[0], size: 5 }];
    await expect(createReportArchive(input, async () => { throw new ServiceUnavailableException("Sin conexión"); })).rejects.toThrow(ServiceUnavailableException);
    expect(REPORT_ARCHIVE_MAX_BYTES).toBeLessThanOrEqual(CAPS.storage);
  });
  test("descarga autorizada contabiliza cuota, conserva bytes y nunca devuelve enlace o path privado", async () => {
    const fixture = originalFixture();
    const bytes = await fixture.service.downloadForReport("session", "doc", identity, 100);
    expect(bytes.toString()).toBe("hello");
    expect(fixture.rooms.member).toHaveBeenCalledWith("room", identity.uid, undefined, true);
    expect(fixture.storage.download).toHaveBeenCalledWith("PRIVATE_STORAGE_PATH");
    expect(fixture.tx.usage.update).toHaveBeenCalledWith(expect.objectContaining({ data: { storageEgress: { increment: 5 } } }));
  });
  test("participante ajeno o documento ajeno se rechazan antes de tocar almacenamiento", async () => {
    const fixture = originalFixture();
    await expect(fixture.service.downloadForReport("session", "doc", { ...identity, uid: "outsider" }, 100)).rejects.toThrow(ForbiddenException);
    expect(fixture.db.document.findFirst).not.toHaveBeenCalled();
    fixture.db.sessionDocument.findUnique.mockResolvedValue(null);
    await expect(fixture.service.downloadForReport("session", "foreign", identity, 100)).rejects.toThrow(ForbiddenException);
    expect(fixture.storageFactory).not.toHaveBeenCalled();
    fixture.db.sessionDocument.findUnique.mockResolvedValue({ documentId: "doc" }); fixture.db.document.findFirst.mockResolvedValue(null);
    await expect(fixture.service.downloadForReport("session", "doc", identity, 100)).rejects.toThrow(NotFoundException);
    expect(fixture.storageFactory).not.toHaveBeenCalled();
  });
  test("límite restante y cuota gratuita fallan antes de descargar; un tamaño distinto no se presenta completo", async () => {
    const fixture = originalFixture();
    await expect(fixture.service.downloadForReport("session", "doc", identity, 4)).rejects.toThrow(PayloadTooLargeException);
    expect(fixture.storageFactory).not.toHaveBeenCalled();
    fixture.usage.storageEgress = BigInt(CAPS.storageEgress);
    await expect(fixture.service.downloadForReport("session", "doc", identity, 100)).rejects.toThrow(HttpException);
    expect(fixture.storageFactory).not.toHaveBeenCalled();
    fixture.usage.storageEgress = 0n; fixture.doc.size = 6;
    await expect(fixture.service.downloadForReport("session", "doc", identity, 100)).rejects.toThrow(ServiceUnavailableException);
  });
  test("exportación ZIP de sesión ajena verifica el reporte antes de descargar archivos o escribir cabeceras", async () => {
    const db: any = { session: { findUnique: jest.fn(async () => ({ id: "session", roomId: "room", participantIds: ["other"] })) } };
    const ai = new Ai(db, { member: jest.fn() } as any, new RateLimiter(), {} as any);
    const documents: any = { downloadForReport: jest.fn() }, response: any = { setHeader: jest.fn(), type: jest.fn() };
    const controller = new AppController({} as any, {} as any, documents, ai, new RateLimiter(), {} as any);
    await expect(controller.export({ identity } as any, "session", "zip", response)).rejects.toThrow(ForbiddenException);
    expect(documents.downloadForReport).not.toHaveBeenCalled(); expect(response.setHeader).not.toHaveBeenCalled();
  });
  test("controlador transmite un ZIP válido y no emite cabeceras si falla un original", async () => {
    const input = report(); input.documents = [{ id: "doc", name: "Notas.txt", mimeType: "text/plain", size: 5, available: true }];
    const documents: any = { downloadForReport: jest.fn(async () => Buffer.from("hello")) }, response: any = new PassThrough();
    response.setHeader = jest.fn(); response.type = jest.fn(); response.headersSent = false;
    const chunks: Buffer[] = []; response.on("data", (chunk: Buffer) => chunks.push(chunk));
    const controller = new AppController({} as any, {} as any, documents, { report: jest.fn(async () => input) } as any, new RateLimiter(), {} as any);
    await controller.export({ identity } as any, "session", "zip", response);
    expect(response.setHeader).toHaveBeenCalledWith("Cache-Control", "private, no-store"); expect(response.type).toHaveBeenCalledWith("application/zip");
    const zip = await JSZip.loadAsync(Buffer.concat(chunks), { checkCRC32: true }); expect(await zip.file("recursos/doc-001-Notas.txt")!.async("string")).toBe("hello");
    documents.downloadForReport.mockRejectedValue(new ServiceUnavailableException("Sin conexión"));
    const failed: any = { setHeader: jest.fn(), type: jest.fn() };
    await expect(controller.export({ identity } as any, "session", "zip", failed)).rejects.toThrow(ServiceUnavailableException);
    expect(failed.setHeader).not.toHaveBeenCalled(); expect(failed.type).not.toHaveBeenCalled();
  });
});
