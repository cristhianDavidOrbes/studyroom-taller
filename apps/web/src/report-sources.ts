import type { SessionReport } from "./types";

export type ReportSourceKind = "transcripcion" | "mensaje" | "documento" | "sintesis";
export interface ReportSource {
  key: string;
  kind: ReportSourceKind;
  id: string;
  label: string;
  anchorId: string;
}
export type ReportSourceMap = ReadonlyMap<string, ReportSource>;
export type CitationPart = { text: string } | { source: ReportSource } | { label: string } | { unavailable: "pending" | "missing" };

function sourceKind(prefix: string): ReportSourceKind | null {
  const kind = prefix.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return ["transcripcion", "mensaje", "documento", "sintesis"].includes(kind) ? kind as ReportSourceKind : null;
}

export function canonicalSource(value: string): string | null {
  const colon = value.indexOf(":");
  if (colon < 1) return null;
  const kind = sourceKind(value.slice(0, colon));
  const id = value.slice(colon + 1);
  if (!kind || !/^[A-Za-z0-9_-]{1,200}$/.test(id)) return null;
  return `${kind}:${id}`;
}

export function reportSourceAnchor(kind: ReportSourceKind, id: string): string | undefined {
  return canonicalSource(`${kind}:${id}`) ? `report-source-${kind}-${id}` : undefined;
}

function elapsed(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function buildReportSources(report: SessionReport): ReportSourceMap {
  const sources = new Map<string, ReportSource>();
  const add = (kind: ReportSourceKind, id: string, label: string) => {
    const key = canonicalSource(`${kind}:${id}`), anchorId = reportSourceAnchor(kind, id);
    if (key && anchorId) sources.set(key, { key, kind, id, label, anchorId });
  };
  for (const segment of report.transcription?.segments || []) add("transcripcion", segment.id, `Voz · ${segment.speakerName || "Participante"} · ${elapsed(segment.startMs)}`);
  for (const message of report.messages || []) add("mensaje", message.id, `Mensaje · ${message.displayName || "Participante"}`);
  for (const document of report.documents || []) add("documento", document.id, `Archivo · ${document.name}`);
  for (const job of report.jobs || []) if (job.status === "completed" && ["summary", "keypoints"].includes(job.kind)) add("sintesis", job.id, job.kind === "summary" ? "Resumen" : "Puntos clave");
  return sources;
}

export function citationParts(text: string, result: unknown, sourceMap?: ReportSourceMap, pending = false): CitationPart[] {
  const values = result && typeof result === "object" ? (result as { sources?: unknown }).sources : undefined;
  const allowed = new Set(Array.isArray(values) ? values.filter((value): value is string => typeof value === "string").map(canonicalSource).filter((value): value is string => value !== null) : []);
  const parts: CitationPart[] = [];
  // Keep ordinary bracketed notes; only source namespaces or UUID references are technical markers.
  const uuid = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}";
  const uuidOnly = new RegExp(`^${uuid}$`);
  // An unfinished final source marker is hidden until the streamed text completes it.
  const markers = new RegExp(`\\[([\\p{L}\\p{M}]+):([^\\[\\]\\r\\n]*)(\\]|$)|([\\p{L}\\p{M}]+):(${uuid})`, "gu");
  const roomLabels: Record<ReportSourceKind, string> = { transcripcion: "Voz registrada", mensaje: "Mensaje de sala", documento: "Archivo compartido", sintesis: "Resumen" };
  let previous = 0;
  for (const marker of text.matchAll(markers)) {
    if (marker.index! > previous) parts.push({ text: text.slice(previous, marker.index) });
    const prefix = marker[1] || marker[4], id = marker[2] ?? marker[5], kind = sourceKind(prefix);
    if (!kind && !uuidOnly.test(id)) parts.push({ text: marker[0] });
    else {
      const key = canonicalSource(`${prefix}:${id}`), complete = !marker[1] || marker[3] === "]";
      const authorized = key && complete && allowed.has(key);
      const source = authorized ? sourceMap?.get(key) : undefined;
      if (source) parts.push({ source });
      else if (authorized && !sourceMap && kind) parts.push({ label: roomLabels[kind] });
      else parts.push({ unavailable: pending && !Array.isArray(values) ? "pending" : "missing" });
    }
    previous = marker.index! + marker[0].length;
  }
  if (previous < text.length) parts.push({ text: text.slice(previous) });
  return parts;
}
