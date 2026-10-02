import { relevantSources, reportSources, reportMarkdown } from "../src/report-context";
import { validatedCitations } from "../src/ai";
describe("Contexto fiel del reporte", () => {
  test("fuentes incluyen voz/chat/archivos sin notas privadas", () => {
    const sources = reportSources({ transcription: { segments: [{ id: "speech", speakerName: "Ana", text: "Una derivada mide cambio", startMs: 0, endMs: 1000 }] }, messages: [{ id: "chat", text: "Pregunta", displayName: "Luis" }], documents: [{ id: "image", name: "Foto", mimeType: "image/png", extractedText: "", extractionStatus: "unavailable" }], notes: [{ text: "private secret" }] });
    expect(sources.map(s => s.id)).toEqual(["transcripcion:speech", "mensaje:chat", "documento:image"]);
    expect(JSON.stringify(sources)).not.toContain("private secret");
    expect(sources[2].text).toContain("No se conoce su contenido visual");
  });
  test("recupera tema relevante de un documento grande sin recortar el reporte original", () => {
    const document = "relleno ".repeat(15000) + "La derivada es una tasa de cambio instantánea.";
    const sources = [{ id: "documento:d", text: document }];
    const selected = relevantSources(sources, "¿Qué es una derivada?", 4000);
    expect(selected.selected[0].text).toContain("derivada"); expect(selected.complete).toBe(false);
    expect(sources[0].text).toBe(document);
    expect(Buffer.byteLength(selected.selected.map(s => s.text).join("\n"))).toBeLessThan(4000);
  });
  test("ventana pequeña devuelve un fragmento relevante con su referencia completa", () => {
    const result = relevantSources([{ id: "transcripcion:30cfaf8c-1e3b-4b39-ae6d-f51b116a6c50", text: "El área es base por altura. ".repeat(120) }], "¿Cuál es el área?", 700);
    expect(result.selected.length).toBeGreaterThan(0); expect(result.complete).toBe(false);
    expect(Buffer.byteLength(result.selected.map(s => `[${s.id}] ${s.text}`).join("\n"))).toBeLessThanOrEqual(700);
  });
  test("elimina citas a transcripciones ajenas", () => {
    expect(validatedCitations("Sí [transcripcion:visible] [transcripcion:ajena] [documento:otro]", ["transcripcion:visible"])).toBe("Sí [transcripcion:visible]");
  });
  test("normaliza citas acentuadas antes de verificar autorización", () => {
    expect(validatedCitations("Fuente [Transcripción:visible] [transcripcio\u0301n:ajena] [Síntesis:summary] [síntesis:privada]", ["transcripcion:visible", "sintesis:summary"]))
      .toBe("Fuente [transcripcion:visible]  [sintesis:summary]");
  });
  test("exporta todos los segmentos, palabras, chat y archivos, sin URLfirmada", () => {
    const report: any = { title: "Repaso", startedAt: new Date(), endedAt: new Date(), transcription: { coverage: { notice: "Reconocimiento automático", status: "partial", pendingBatches: 0, failedBatches: 1 }, segments: [{ id: "one", speakerName: "Ana", startMs: 0, endMs: 1000, text: "Primero", words: [{ word: "Primero", startMs: 0, endMs: 1000 }] }, { id: "two", speakerName: "Luis", startMs: 1000, endMs: 2000, text: "Segundo", words: [] }], batches: [] }, messages: [{ id: "chat", displayName: "Ana", text: "Chat completo" }], documents: [{ id: "d", name: "Foto", mimeType: "image/png", size: 100, available: false, extractionStatus: "unavailable" }], jobs: [] };
    const text = reportMarkdown(report);
    expect(text).toContain("Primero"); expect(text).toContain("Segundo"); expect(text).toContain("Palabras:"); expect(text).toContain("Chat completo"); expect(text).toContain("original eliminado"); expect(text).not.toContain("signedUrl");
  });
});
jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({ AccessToken: jest.fn(), RoomServiceClient: jest.fn() }));
