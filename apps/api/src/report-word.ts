import { Document, ExternalHyperlink, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from "docx";
import sharp from "sharp";
import type { ArchiveReport } from "./report-archive";

type Original = { id: string; data: Buffer; path?: string };
type Event = { at: number; tie: string; kind: "voice" | "message" | "document"; value: any };

function instant(value: unknown, fallback = 0) {
  const parsed = new Date(value as string).getTime();
  return Number.isFinite(parsed) ? parsed : fallback;
}
function clock(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function messageRuns(text: string): (TextRun | ExternalHyperlink)[] {
  const runs: (TextRun | ExternalHyperlink)[] = [];
  const pattern = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index;
    const visible = match[0].replace(/[.,!?;:)\]}]+$/, "");
    if (!visible) continue;
    const target = visible.toLowerCase().startsWith("www.") ? `https://${visible}` : visible;
    try {
      const url = new URL(target);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
    } catch { continue; }
    if (start > cursor) runs.push(new TextRun(text.slice(cursor, start)));
    runs.push(new ExternalHyperlink({ children: [new TextRun({ text: visible, style: "Hyperlink" })], link: target }));
    cursor = start + visible.length;
  }
  if (cursor < text.length || !runs.length) runs.push(new TextRun(text.slice(cursor)));
  return runs;
}

export async function reportWord(report: ArchiveReport, originals: Original[] = []) {
  const started = instant(report.startedAt);
  const source = new Map(originals.map((item) => [item.id, item]));
  const people = new Map((report.transcription.participants || []).map((person) => [person.userId, person.displayName]));
  const events: Event[] = [
    ...report.transcription.segments.map((value) => ({ at: started + value.startMs, tie: `0-${value.id}`, kind: "voice" as const, value })),
    ...report.messages.map((value) => ({ at: instant(value.createdAt, started), tie: `1-${value.id}`, kind: "message" as const, value })),
    ...report.documents.map((value) => ({ at: instant(value.createdAt, started), tie: `2-${value.id}`, kind: "document" as const, value })),
  ].sort((a, b) => a.at - b.at || a.tie.localeCompare(b.tie));
  const children: Paragraph[] = [
    new Paragraph({ text: report.title || "Reporte de sesión", style: "Title" }),
    new Paragraph({ text: `StudyRoom · ${new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Bogota" }).format(started)}` }),
    new Paragraph({ text: "Transcripción, mensajes, enlaces, imágenes y archivos en el orden en que ocurrieron. La voz reconocida puede contener errores; los originales disponibles se incluyen en el ZIP del reporte." }),
    new Paragraph({ text: `${report.transcription.coverage.pendingBatches || 0} fragmentos de voz pendientes · ${report.transcription.coverage.failedBatches || 0} fragmentos sin transcribir. El texto conserva exactamente el resultado reconocido, sin reconstruir palabras ausentes.` }),
    new Paragraph({ text: "Conversación en orden", heading: HeadingLevel.HEADING_1 }),
  ];
  if (!events.length) children.push(new Paragraph("No hay voz, mensajes ni recursos registrados."));
  for (const event of events) {
    const stamp = clock(event.at - started);
    if (event.kind === "voice") {
      const voice = event.value as ArchiveReport["transcription"]["segments"][number];
      children.push(new Paragraph({ children: [new TextRun({ text: `${stamp}  Voz · ${voice.speakerName || "Participante"}`, bold: true })], keepNext: true }));
      children.push(new Paragraph({ text: voice.text || "" }));
    } else if (event.kind === "message") {
      const message = event.value as ArchiveReport["messages"][number];
      children.push(new Paragraph({ children: [new TextRun({ text: `${stamp}  Mensaje · ${message.displayName || "Participante"}`, bold: true })], keepNext: true }));
      children.push(new Paragraph({ children: messageRuns(message.text || "") }));
    } else {
      const resource = event.value as ArchiveReport["documents"][number];
      const original = source.get(resource.id);
      children.push(new Paragraph({ children: [new TextRun({ text: `${stamp}  ${resource.mimeType.startsWith("image/") ? "Imagen" : "Archivo"} · ${resource.name}`, bold: true })], keepNext: true }));
      children.push(new Paragraph({ text: `Compartido por ${people.get(resource.uploadedBy || "") || "Participante"}. ${resource.available ? "Original disponible desde el reporte." : "Original eliminado o no disponible."}` }));
      if (original?.path) children.push(new Paragraph({ children: [new ExternalHyperlink({ children: [new TextRun({ text: `Abrir adjunto ${resource.name}`, style: "Hyperlink" })], link: original.path })] }));
      if (original && ["image/png", "image/jpeg", "image/webp"].includes(resource.mimeType)) {
        try {
          const image = await sharp(original.data, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 560, height: 350, fit: "inside", withoutEnlargement: true }).png().toBuffer({ resolveWithObject: true });
          children.push(new Paragraph({ children: [new ImageRun({ type: "png", data: image.data, transformation: { width: image.info.width, height: image.info.height }, altText: { title: resource.name, name: resource.name, description: resource.name } })] }));
        } catch { children.push(new Paragraph("No se pudo mostrar la vista previa; abre el adjunto original desde el ZIP.")); }
      }
      if (resource.extractedText) children.push(new Paragraph({ text: `Texto reconocido: ${resource.extractedText}` }));
    }
  }
  const document = new Document({ sections: [{ properties: { page: { size: { width: 12240, height: 15840 } } }, children }] });
  return Packer.toBuffer(document);
}
