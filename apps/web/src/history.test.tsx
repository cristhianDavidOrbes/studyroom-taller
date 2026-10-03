import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HistoryPage, SessionPage } from "./history";
import { AIPanel } from "./ai";
import type { Job, SessionReport } from "./types";

vi.mock("./firebase", () => ({ auth: { currentUser: null } }));
vi.mock("./api", () => ({ API_URL: "/api", api: vi.fn(() => { throw new Error("No external requests in the static report test"); }), errorText: String, json: vi.fn() }));

const legacyJobs = ["queued", "running", "completed", "failed", "cancelled"].map((status) => ({
  id: `legacy-${status}`, kind: "quiz", status, createdAt: "2026-10-02T12:00:00Z",
  partialText: "LEGACY_PARTIAL_MARKER", error: "LEGACY_ERROR_MARKER",
  result: { questions: [{ question: "LEGACY_QUESTION_MARKER", options: ["LEGACY_OPTION_MARKER"], correctIndex: 0 }] },
})) as Job[];
const fixture = {
  id: "session-test", roomId: "room-test", title: "Reporte de estudio", startedAt: "2026-10-02T12:00:00Z", endedAt: "2026-10-02T12:30:00Z",
  jobs: [...legacyJobs, { id: "summary", kind: "summary", status: "completed", createdAt: "2026-10-02T12:30:00Z", result: { text: "Resumen conservado [transcripcion:voice]", sources: ["transcripcion:voice"] } }],
  attempts: [{ score: 7, total: 9, createdAt: "2026-10-02T12:30:00Z" }], quizAttempts: [{ id: "attempt", score: 7, total: 9, createdAt: "2026-10-02T12:30:00Z" }],
  messages: [{ id: "chat", userId: "ana", displayName: "Ana", text: "Mensaje compartido conservado", kind: "user", createdAt: "2026-10-02T12:00:00Z" }],
  documents: [{ id: "file", name: "Archivo conservado.txt", mimeType: "text/plain", size: 20, uploadedBy: "ana", createdAt: "2026-10-02T12:00:00Z", available: false, extractedText: "Texto de archivo conservado" }],
  transcription: { sessionId: "session-test", startedAt: "2026-10-02T12:00:00Z", segments: [{ id: "voice", speakerId: "ana", speakerName: "Ana", text: "Voz original conservada", startMs: 20000, endMs: 25000 }], batches: [], participants: [{ userId: "ana", displayName: "Ana", enabled: false }], coverage: { status: "available", pendingBatches: 0, failedBatches: 0, completedBatches: 1, consentingParticipants: 1, totalParticipants: 1 } },
} as unknown as SessionReport;

function renderPage(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  client.setQueryData(["session", fixture.id], fixture);
  client.setQueryData(["sessions"], [fixture]);
  client.setQueryData(["session-notes", fixture.roomId], { text: "Nota privada conservada" });
  return renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><Routes><Route path="/sesiones/:id" element={<SessionPage />} /><Route path="/historial" element={<HistoryPage />} /></Routes></MemoryRouter></QueryClientProvider>);
}

describe("reporte sin cuestionarios", () => {
  it("ignora cuestionarios históricos en cualquier estado y resultados de intentos", () => {
    const html = renderPage(`/sesiones/${fixture.id}`);
    expect(html).not.toMatch(/LEGACY_|quiz|cuestionario|Pon a prueba|Comprobar respuestas|respuestas correctas|Tu progreso en el repaso/i);
    expect(html).not.toContain("7 / 9");
    expect(fixture.jobs?.filter((job) => job.kind === "quiz")).toHaveLength(5);
  });

  it("conserva voz, chat, archivos, resumen citado, notas y la consulta del reporte", () => {
    const html = renderPage(`/sesiones/${fixture.id}`);
    for (const text of ["Voz original conservada", "Mensaje compartido conservado", "Archivo conservado.txt", "Resumen conservado", "Voz · Ana · 00:20", "Nota privada conservada", "Consultar este reporte", "Descargar reporte completo", "Otros formatos"]) expect(html).toContain(text);
    expect(html).toContain('href="#report-source-transcripcion-voice"');
    expect(html.match(/class="artifact-action"/g)).toHaveLength(2);
  });

  it("mantiene el acceso al reporte desde Mi aprendizaje sin mostrar cuestionarios", () => {
    const html = renderPage("/historial");
    expect(html).toContain('href="/sesiones/session-test"');
    expect(html).not.toMatch(/LEGACY_|quiz|cuestionario|respuestas correctas/i);
  });

  it("excluye trabajos históricos de cuestionario del asistente de sala", () => {
    const html = renderToStaticMarkup(<AIPanel roomId="room-test" documents={[]} jobs={legacyJobs} onJob={() => {}} />);
    expect(html).not.toMatch(/LEGACY_|quiz|cuestionario/i);
    expect(html).toContain("Consultar al asistente");
  });
});
