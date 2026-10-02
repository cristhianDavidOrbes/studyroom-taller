import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { SessionReport } from "./types";
import { buildReportSources, canonicalSource, citationParts } from "./report-sources";
import { SourceText } from "./source-text";

const voiceId = "a0254252-5b7c-4708-9f73-611cf0c60a21";
const foreignId = "f5b3d83f-37f3-4658-b0a3-cb95f82cd989";
const report = {
  id: "report", roomId: "room", startedAt: "2026-10-02T12:00:00Z",
  transcription: { segments: [{ id: voiceId, speakerName: "Ana", speakerId: "ana", text: "Palabras originales", startMs: 20000, endMs: 25000 }] },
  messages: [{ id: "message", displayName: "Luis", text: "Texto del chat" }],
  documents: [{ id: "image", name: "Figura compartida.png", available: false }],
  jobs: [{ id: "summary", kind: "summary", status: "completed" }, { id: "answer", kind: "answer", status: "completed" }, { id: "pending", kind: "summary", status: "queued" }],
} as unknown as SessionReport;

describe("fuentes legibles del reporte", () => {
  it("vincula solo la intersección del resultado autorizado y el reporte actual", () => {
    const sources = buildReportSources(report);
    const parts = citationParts(`[transcripción:${voiceId}] [mensaje:message] [documento:image] [síntesis:summary]`, { sources: [`transcripcion:${voiceId}`, "mensaje:message", "documento:image", "sintesis:summary"] }, sources);
    const labels = parts.flatMap((part) => "source" in part ? [part.source.label] : []);
    expect(labels).toEqual(["Voz · Ana · 00:20", "Mensaje · Luis", "Archivo · Figura compartida.png", "Resumen"]);
    expect(sources.has("sintesis:answer")).toBe(false);
    expect(sources.has("sintesis:pending")).toBe(false);
  });

  it("no revela nombres ni enlaces por una referencia ajena o no incluida en el resultado", () => {
    const sources = buildReportSources(report);
    const output = renderToStaticMarkup(<SourceText text={`Uno [transcripcion:${voiceId}], otro [transcripcion:${foreignId}] y [desconocida:${foreignId}].`} result={{ sources: [`transcripcion:${foreignId}`] }} sourceMap={sources} />);
    expect(output).not.toContain("<a");
    expect(output).not.toContain("Ana");
    expect(output).not.toContain(voiceId);
    expect(output).not.toContain(foreignId);
    expect(output).toContain("Referencia no disponible");
  });

  it("normaliza prefijos con acentos y mayúsculas conservando el ID exacto", () => {
    expect(canonicalSource("TRANSCRIPCIÓN:AbC_12")).toBe("transcripcion:AbC_12");
    expect(canonicalSource("Síntesis:ABC-123")).toBe("sintesis:ABC-123");
    expect(canonicalSource("documento:javascript:alert(1)")).toBeNull();
    expect(canonicalSource("documento:../otra-sesion")).toBeNull();
    const output = renderToStaticMarkup(<SourceText text={`[transcripción:${voiceId.toUpperCase()}]`} result={{ sources: [`transcripcion:${voiceId.toUpperCase()}`] }} sourceMap={buildReportSources(report)} />);
    expect(output).not.toContain("<a");
  });

  it("oculta referencias terminadas e incompletas de una respuesta aún en preparación", () => {
    const output = renderToStaticMarkup(<SourceText text={`Respuesta [transcripcion:${voiceId}] [síntesis:${foreignId}`} sourceMap={buildReportSources(report)} pending />);
    expect(output).toContain("Referencia en preparación");
    expect(output).not.toContain(voiceId);
    expect(output).not.toContain(foreignId);
    expect(output).not.toContain("<a");
  });

  it("escapa el texto y las etiquetas y genera únicamente anclas locales verificadas", () => {
    const dangerous = { ...report, documents: [{ id: "image", name: "<img src=x onerror=alert(1)>", available: true }] } as SessionReport;
    const output = renderToStaticMarkup(<SourceText text="<script>alert(1)</script> [documento:image]" result={{ sources: ["documento:image"] }} sourceMap={buildReportSources(dangerous)} />);
    expect(output).toContain('href="#report-source-documento-image"');
    expect(output).toContain("&lt;script&gt;");
    expect(output).toContain("&lt;img");
    expect(output).not.toContain("<script");
    expect(output).not.toContain("<img");
  });

  it("preserva notas con dos puntos y ofrece categorías autorizadas sin mapa de reporte", () => {
    const output = renderToStaticMarkup(<SourceText text="[nota: recuerda la altura] [x:2] [mensaje:message] [documento:image]" result={{ sources: ["mensaje:message", "documento:image"] }} />);
    expect(output).toContain("[nota: recuerda la altura] [x:2]");
    expect(output).toContain("Mensaje de sala");
    expect(output).toContain("Archivo compartido");
    expect(output).not.toContain("<a");
    expect(output).not.toContain("Referencia no disponible");
  });

  it("reconoce acentos NFD y referencias UUID sin corchetes", () => {
    const output = renderToStaticMarkup(<SourceText text={`[TRANSCRIPCIO\u0301N:${voiceId}] y transcripción:${voiceId}.`} result={{ sources: [`transcripcio\u0301n:${voiceId}`] }} sourceMap={buildReportSources(report)} />);
    expect(output.match(/Voz · Ana · 00:20/g)).toHaveLength(2);
    expect(output.match(/<a /g)).toHaveLength(2);
    expect(output).not.toContain(`transcripción:${voiceId}`);
  });

  it("oculta referencias UUID desconocidas sin fabricar enlaces", () => {
    const output = renderToStaticMarkup(<SourceText text={`Fuente transcripcion:${foreignId}, [nota:${foreignId}] y desconocida:${foreignId}.`} result={{ sources: [] }} sourceMap={buildReportSources(report)} />);
    expect(output).not.toContain(foreignId);
    expect(output).not.toContain("<a");
    expect(output.match(/Referencia no disponible/g)).toHaveLength(3);
  });
});
