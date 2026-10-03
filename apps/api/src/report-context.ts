export type ReportSource = { id: string; text: string };
export function reportSources(report: any, includeSynthesis = false): ReportSource[] {
  return (report.transcription?.segments ?? []).map((s: any) => ({ id: `transcripcion:${s.id}`, text: `${s.speakerName} [${s.startMs}-${s.endMs} ms]: ${s.text}` }))
    .concat((report.messages ?? []).map((m: any) => ({ id: `mensaje:${m.id}`, text: `${m.displayName ?? "Participante"}: ${m.text}` })))
    .concat((report.documents ?? []).map((d: any) => ({ id: `documento:${d.id}`, text: `${d.name} (${d.extractionStatus ?? "unknown"}): ${d.extractedText || "Archivo sin texto extraíble. No se conoce su contenido visual."}${d.available === false ? " El archivo original fue eliminado." : ""}` })))
    .concat(includeSynthesis ? (report.jobs ?? []).filter((j: any) => j.shared && j.status === "completed" && ["summary", "keypoints"].includes(j.kind) && j.result?.text).map((j: any) => ({ id: `sintesis:${j.id}`, text: `Síntesis automática, puede contener errores: ${j.result.text}` })) : []);
}
export function sourceText(sources: ReportSource[]) { return sources.map(s => `[${s.id}] ${s.text}`).join("\n"); }
export function relevantSources(sources: ReportSource[], question: string, maxBytes = 50000) {
  const words = new Set(question.toLocaleLowerCase("es").match(/[\p{L}\p{N}]{3,}/gu) ?? []);
  // Preserve complete source IDs when splitting large documents. The report itself is never shortened.
  const pieces = sources.flatMap((source, order) => {
    const chunkBytes = Math.min(1600, Math.max(64, maxBytes - Buffer.byteLength(`[${source.id}] \n`)));
    const chunks: string[] = []; let current = "", bytes = 0;
    for (const c of source.text) { const size = Buffer.byteLength(c); if (bytes + size > chunkBytes) { chunks.push(current); current = ""; bytes = 0; } current += c; bytes += size; }
    if (current) chunks.push(current);
    return chunks.map((text, index) => ({ id: source.id, text, order, index, score: [...words].reduce((n, w) => n + (text.toLocaleLowerCase("es").includes(w) ? 1 : 0), 0) }));
  });
  pieces.sort((a, b) => b.score - a.score || a.order - b.order || a.index - b.index);
  const selected: ReportSource[] = []; let bytes = 0;
  for (const piece of pieces) { const size = Buffer.byteLength(`[${piece.id}] ${piece.text}\n`); if (bytes + size > maxBytes) continue; selected.push({ id: piece.id, text: piece.text }); bytes += size; }
  return { selected, selectedFragments: selected.length, totalFragments: pieces.length, complete: selected.length === pieces.length };
}
export function reportMarkdown(report: any) {
  const time = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
  const lines = [`# ${report.title}`, "", `Inicio: ${new Date(report.startedAt).toISOString()}`, `Fin: ${report.endedAt ? new Date(report.endedAt).toISOString() : "En curso"}`, "", "## Cobertura de transcripción", "", report.transcription.coverage.notice,
    `Estado: ${report.transcription.coverage.status}; pendientes: ${report.transcription.coverage.pendingBatches}; intervalos sin transcribir: ${report.transcription.coverage.failedBatches}.`, "", "## Transcripción literal reconocida", ""];
  for (const s of report.transcription.segments) {
    lines.push(`[${time(s.startMs)}–${time(s.endMs)}] ${s.speakerName}: ${s.text} [transcripcion:${s.id}]`);
    if (s.words?.length) lines.push(`Palabras: ${s.words.map((w: any) => `${time(w.startMs)}–${time(w.endMs)} ${w.word}`).join(" | ")}`);
  }
  if (!report.transcription.segments.length) lines.push("No hay transcripción disponible. No se reconstruyó audio anterior.");
  for (const b of report.transcription.batches.filter((b: any) => ["failed", "pending"].includes(b.status))) lines.push(`Intervalo ${time(b.startMs)}–${time(b.endMs)} (${b.speakerId}): ${b.status}. ${b.error ?? "En procesamiento"}`);
  lines.push("", "## Chat", "");
  for (const m of report.messages) lines.push(`${m.createdAt ? new Date(m.createdAt).toISOString() : ""} ${m.displayName ?? "Participante"}: ${m.text} [mensaje:${m.id}]`);
  lines.push("", "## Imágenes y archivos compartidos", "");
  for (const d of report.documents) lines.push(`### ${d.name} [documento:${d.id}]`, `${d.mimeType}; ${d.size} bytes; ${d.available ? "original disponible en StudyRoom con acceso autorizado" : "original eliminado/no disponible"}; extracción: ${d.extractionStatus}`, d.extractedText || "Sin texto extraíble.", "");
  lines.push("## Síntesis y consultas de IA", "");
  for (const j of report.jobs.filter((job: any) => job.kind !== "quiz")) lines.push(`### ${j.kind} — ${j.status}`, j.question ? `Pregunta: ${j.question}` : "", j.result?.text ?? JSON.stringify(j.result ?? { error: j.error }), "");
  return lines.join("\n");
}
