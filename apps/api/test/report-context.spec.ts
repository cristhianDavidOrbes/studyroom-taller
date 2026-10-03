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
  test("normaliza citas entre paréntesis y texto libre con alias acentuados", () => {
    const voice = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c50";
    const document = "7483c2fa-d3c1-40fe-b569-83ba6e1a2309";
    expect(validatedCitations(`Según ( Transcripcio\u0301n: ${voice} ) y DOCUMENTO:${document}.`, [`transcripcion:${voice}`, `documento:${document}`]))
      .toBe(`Según [transcripcion:${voice}] y [documento:${document}].`);
  });
  test("rechaza una cita UUID extranjera en los tres formatos sin sustituir fuentes", () => {
    const allowed = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c50";
    const foreign = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c51";
    const result = validatedCitations(`Respuesta [Mensaje:${foreign}] (mensaje:${foreign}) MENSAJE:${foreign}; (mensaje:${allowed}).`, [`mensaje:${allowed}`]);
    expect(result).toBe(`Respuesta   ; [mensaje:${allowed}].`);
    expect(result).not.toContain(foreign);
    expect(result.match(/\[mensaje:/g)).toHaveLength(1);
  });
  test("autoriza el namespace y el ID exactos también sin corchetes", () => {
    const id = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c50";
    const result = validatedCitations(`documento:${id}, (síntesis:${id}) [transcripción:${id.toUpperCase()}] transcripción:${id}.`, [`transcripcion:${id}`]);
    expect(result).toBe(`,   [transcripcion:${id}].`);
  });
  test("resuelve grupos de UUID a su fuente exacta y no trata duplicados iguales como ambiguos", () => {
    const voice = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c50";
    const document = "7483c2fa-d3c1-40fe-b569-83ba6e1a2309";
    const sources = [`transcripcion:${voice}`, `documento:${document}`, `transcripcion:${voice}`];
    const text = `Resumen (fuentes: ${voice}, ${document}). [REFERENCIA: ${document}]\nFuentes: ${voice} y ${document}.`;
    expect(validatedCitations(text, sources))
      .toBe(`Resumen (fuentes: [transcripcion:${voice}], [documento:${document}]). (REFERENCIA: [documento:${document}])\nFuentes: [transcripcion:${voice}] y [documento:${document}].`);
  });
  test("un grupo mixto no inventa fuentes para UUID desconocidos, ambiguos o con mayúsculas distintas", () => {
    const known = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c50";
    const missing = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c51";
    const ambiguous = "7483c2fa-d3c1-40fe-b569-83ba6e1a2309";
    const text = `Acuerdo (referencias: ${known}; ${missing}; ${ambiguous}; ${known.toUpperCase()}).`;
    const result = validatedCitations(text, [`mensaje:${known}`, `documento:${ambiguous}`, `mensaje:${ambiguous}`]);
    expect(result).toBe(`Acuerdo (referencias: [mensaje:${known}]; Referencia no disponible; Referencia no disponible; Referencia no disponible).`);
    expect(result).not.toContain(missing);
    expect(result).not.toContain(ambiguous);
  });
  test("preserva notas ordinarias, UUID aisladas y namespaces desconocidos", () => {
    const id = "30cfaf8c-1e3b-4b39-ae6d-f51b116a6c50";
    const text = `Nota (documento: revisar mañana), (base por altura), identificador ${id}, (registro:${id}) y registro:${id}. (fuentes: consultar apuntes), (referencias: ${id} de ejemplo).`;
    expect(validatedCitations(text, [])).toBe(text);
  });
  test("exporta todos los segmentos, palabras, chat y archivos, sin URLfirmada", () => {
    const report: any = { title: "Repaso", startedAt: new Date(), endedAt: new Date(), transcription: { coverage: { notice: "Reconocimiento automático", status: "partial", pendingBatches: 0, failedBatches: 1 }, segments: [{ id: "one", speakerName: "Ana", startMs: 0, endMs: 1000, text: "Primero", words: [{ word: "Primero", startMs: 0, endMs: 1000 }] }, { id: "two", speakerName: "Luis", startMs: 1000, endMs: 2000, text: "Segundo", words: [] }], batches: [] }, messages: [{ id: "chat", displayName: "Ana", text: "Chat completo" }], documents: [{ id: "d", name: "Foto", mimeType: "image/png", size: 100, available: false, extractionStatus: "unavailable" }], jobs: [] };
    const text = reportMarkdown(report);
    expect(text).toContain("Primero"); expect(text).toContain("Segundo"); expect(text).toContain("Palabras:"); expect(text).toContain("Chat completo"); expect(text).toContain("original eliminado"); expect(text).not.toContain("signedUrl");
  });
  test("exportar un reporte antiguo omite quiz y conserva síntesis y respuestas", () => {
    const report: any = { title: "Reporte", startedAt: new Date(), messages: [], documents: [], transcription: {
      coverage: { notice: "Sin voz", status: "none", pendingBatches: 0, failedBatches: 0 }, segments: [], batches: [],
    }, jobs: [
      { kind: "quiz", status: "completed", result: { questions: [{ question: "QUIZ_ANTIGUO_OCULTO" }] } },
      { kind: "summary", status: "completed", result: { text: "Resumen reconocido" } },
      { kind: "answer", status: "completed", question: "¿Qué se habló?", result: { text: "Respuesta del reporte" } },
    ] };
    const before = JSON.stringify(report.jobs), text = reportMarkdown(report);
    expect(text).not.toContain("quiz"); expect(text).not.toContain("QUIZ_ANTIGUO_OCULTO");
    expect(text).toContain("Resumen reconocido"); expect(text).toContain("¿Qué se habló?"); expect(text).toContain("Respuesta del reporte");
    expect(JSON.stringify(report.jobs)).toBe(before);
  });
});
jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({ AccessToken: jest.fn(), RoomServiceClient: jest.fn() }));
