import { Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from "docx";
import { imageSize } from "image-size";
import type { ArchiveReport } from "./report-archive";

type Original = { id: string; data: Buffer };
type Event = { at: number; tie: string; kind: "voice" | "message" | "document"; value: any };

function instant(value: unknown, fallback = 0) {
  const parsed = new Date(value as string).getTime();
  return Number.isFinite(parsed) ? parsed : fallback;
}
function clock(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export async function reportWord(report: ArchiveReport, originals: Original[] = []) {
  const started = instant(report.startedAt);
  const source = new Map(originals.map((item) => [item.id, item.data]));
  const people = new Map((report.transcription.participants || []).map((person) => [person.userId, person.displayName]));
  const events: Event[] = [
    ...report.transcription.segments.map((value) => ({ at: started + value.startMs, tie: `0-${value.id}`, kind: "voice" as const, value })),
    ...report.messages.map((value) => ({ at: instant(value.createdAt, started), tie: `1-${value.id}`, kind: "message" as const, value })),
    ...report.documents.map((value) => ({ at: instant(value.createdAt, started), tie: `2-${value.id}`, kind: "document" as const, value })),
  ].sort((a, b) => a.at - b.at || a.tie.localeCompare(b.tie));
  const children: Paragraph[] = [
    new Paragraph({ text: report.title || "Reporte de sesión", style: "Title" }),
    new Paragraph({ text: `StudyRoom · ${new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Bogota" }).format(started)}` }),
    new Paragraph({ text: "Transcripción, mensajes, imágenes y archivos en el orden en que ocurrieron. La voz reconocida puede contener errores; los originales disponibles se incluyen en el ZIP del reporte." }),
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
      children.push(new Paragraph({ text: message.text || "" }));
    } else {
      const resource = event.value as ArchiveReport["documents"][number];
      const original = source.get(resource.id);
      children.push(new Paragraph({ children: [new TextRun({ text: `${stamp}  ${resource.mimeType.startsWith("image/") ? "Imagen" : "Archivo"} · ${resource.name}`, bold: true })], keepNext: true }));
      children.push(new Paragraph({ text: `Compartido por ${people.get(resource.uploadedBy || "") || "Participante"}. ${resource.available ? "Original disponible desde el reporte y en la carpeta recursos del ZIP." : "Original eliminado o no disponible."}` }));
      if (original && ["image/png", "image/jpeg"].includes(resource.mimeType)) {
        try {
          const size = imageSize(original);
          const ratio = Math.min(420 / (size.width || 420), 280 / (size.height || 280), 1);
          children.push(new Paragraph({ children: [new ImageRun({ type: resource.mimeType === "image/png" ? "png" : "jpg", data: original, transformation: { width: Math.max(1, Math.round((size.width || 420) * ratio)), height: Math.max(1, Math.round((size.height || 280) * ratio)) }, altText: { title: resource.name, name: resource.name, description: resource.name } })] }));
        } catch { children.push(new Paragraph("La imagen original se conserva en la carpeta recursos del ZIP.")); }
      }
      if (resource.extractedText) children.push(new Paragraph({ text: `Texto reconocido: ${resource.extractedText}` }));
    }
  }
  const synthesis = report.jobs.filter((job) => job.shared && job.status === "completed" && ["summary", "keypoints"].includes(job.kind));
  if (synthesis.length) {
    children.push(new Paragraph({ text: "Resumen y puntos clave", heading: HeadingLevel.HEADING_1 }));
    for (const job of synthesis) {
      children.push(new Paragraph({ text: job.kind === "summary" ? "Resumen" : "Puntos clave", heading: HeadingLevel.HEADING_2 }));
      children.push(new Paragraph({ text: typeof job.result?.text === "string" ? job.result.text : "" }));
    }
  }
  const document = new Document({ sections: [{ properties: { page: { size: { width: 12240, height: 15840 } } }, children }] });
  return Packer.toBuffer(document);
}
