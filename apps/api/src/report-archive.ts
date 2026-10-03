import { PayloadTooLargeException, ServiceUnavailableException } from "@nestjs/common";
import { createHash } from "node:crypto";
import JSZip from "jszip";

export const REPORT_ARCHIVE_MAX_BYTES = 128_000_000;
type Resource = { id: string; name: string; mimeType: string; size: number; available: boolean; createdAt?: Date | string | null; uploadedBy?: string; extractedText?: string; extractionStatus?: string; extractionError?: string | null };
type Voice = { id: string; speakerName: string; speakerId: string; text: string; startMs: number; endMs: number; words?: unknown };
type Message = { id: string; text: string; displayName?: string; createdAt?: Date | string };
type Job = { id: string; kind: string; status: string; shared?: boolean; question?: string; createdAt?: Date | string; result?: any; error?: string | null };
export type ArchiveReport = { id: string; title: string; startedAt: Date | string; endedAt?: Date | string | null; messages: Message[]; documents: Resource[]; jobs: Job[]; transcription: { segments: Voice[]; participants?: { userId: string; displayName: string }[]; coverage: { notice?: string; status: string; pendingBatches?: number; failedBatches?: number }; [key: string]: unknown }; [key: string]: unknown };
export type ArchiveResource = { id: string; name: string; mimeType: string; size: number; status: "included" | "unavailable"; archivePath: string | null; sha256?: string; notice?: string };

function escapeHTML(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
function time(ms: number) {
  const seconds = Math.floor(Math.max(0, Number.isFinite(ms) ? ms : 0) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function instant(date: unknown, fallback = 0) {
  const result = new Date(date as any).getTime();
  return Number.isFinite(result) ? result : fallback;
}
function calendar(date: unknown) {
  const value = instant(date, NaN);
  return Number.isFinite(value) ? new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Bogota" }).format(value) : "Sin fecha registrada";
}
function safeFilename(name: string) {
  return name.normalize("NFC").replace(/[\x00-\x1f\x7f<>:"/\\|?*\u202a-\u202e\u2066-\u2069]/g, "_").replace(/^[. ]+|[. ]+$/g, "").slice(0, 150) || "archivo";
}
function resourcePath(resource: Resource, index: number) {
  const safeId = resource.id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "recurso";
  return `recursos/${safeId}-${String(index + 1).padStart(3, "0")}-${safeFilename(resource.name)}`;
}
function localURL(path: string) { return path.split("/").map(part => encodeURIComponent(part)).join("/"); }
function tooLarge(): never { throw new PayloadTooLargeException("El reporte completo supera 128 MB. No se descargó un archivo parcial; conserva los originales desde el reporte en StudyRoom."); }

function sourceRenderer(report: ArchiveReport) {
  const sources = new Map<string, { label: string; anchor: string }>();
  report.transcription.segments.forEach((s, index) => sources.set(`transcripcion:${s.id}`, { label: `Voz · ${s.speakerName} · ${time(s.startMs)}`, anchor: `voz-${index}` }));
  report.messages.forEach((m, index) => sources.set(`mensaje:${m.id}`, { label: `Mensaje · ${m.displayName || "Participante"}`, anchor: `chat-${index}` }));
  report.documents.forEach((d, index) => sources.set(`documento:${d.id}`, { label: `Archivo · ${d.name}`, anchor: `archivo-${index}` }));
  report.jobs.forEach((job, index) => sources.set(`sintesis:${job.id}`, { label: job.kind === "summary" ? "Resumen" : "Puntos clave", anchor: `sintesis-${index}` }));
  const uuid = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}";
  const refs = new RegExp(String.raw`\[([\p{L}\p{M}]{1,40})\s*:\s*([^\]\r\n]{1,200})\]|\(\s*([\p{L}\p{M}]{1,40})\s*:\s*(${uuid})\s*\)|([\p{L}\p{M}]{1,40})\s*:\s*(${uuid})`, "gu");
  return (text: string, allowed: unknown) => {
    const approved = new Set(Array.isArray(allowed) ? allowed.filter(value => typeof value === "string") : []);
    let output = "", cursor = 0;
    for (const match of text.matchAll(refs)) {
      const prefix = (match[1] || match[3] || match[5]).normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
      if (!["transcripcion", "mensaje", "documento", "sintesis"].includes(prefix)) continue;
      const key = `${prefix}:${(match[2] || match[4] || match[6]).trim()}`;
      const source = sources.get(key);
      output += escapeHTML(text.slice(cursor, match.index));
      output += source && approved.has(key) ? `<a class="source" href="#${source.anchor}">${escapeHTML(source.label)}</a>` : '<span class="source unavailable">Referencia no disponible</span>';
      cursor = match.index! + match[0].length;
    }
    return output + escapeHTML(text.slice(cursor));
  };
}

export function reportArchiveHTML(report: ArchiveReport, resources: ArchiveResource[]) {
  const started = instant(report.startedAt), people = new Map((report.transcription.participants ?? []).map(p => [p.userId, p.displayName]));
  const refs = sourceRenderer(report), originals = new Map(resources.map(resource => [resource.id, resource]));
  const timeline = report.transcription.segments.map((s, index) => ({ at: started + s.startMs, tie: `0-${s.id}`, html: `<li id="voz-${index}" class="entry voice"><span class="entry-time">${time(s.startMs)}–${time(s.endMs)}</span><div><span class="kind">Voz reconocida</span><h3>${escapeHTML(s.speakerName)}</h3><p class="original">${escapeHTML(s.text)}</p>${Array.isArray(s.words) && s.words.length ? `<details><summary>Palabras y tiempos</summary><p class="word-times">${s.words.map(w => `${time(w.startMs)}–${time(w.endMs)} ${escapeHTML(w.word)}`).join(" · ")}</p></details>` : ""}</div></li>` }))
    .concat(report.messages.map((m, index) => ({ at: instant(m.createdAt, started), tie: `1-${m.id}`, html: `<li id="chat-${index}" class="entry chat"><span class="entry-time">${time(instant(m.createdAt, started) - started)}</span><div><span class="kind">Mensaje escrito</span><h3>${escapeHTML(m.displayName || "Participante")}</h3><p class="original">${escapeHTML(m.text)}</p></div></li>` })))
    .concat(report.documents.map((d, index) => ({ at: instant(d.createdAt, started), tie: `2-${d.id}`, html: `<li class="entry file"><span class="entry-time">${time(instant(d.createdAt, started) - started)}</span><div><span class="kind">Recurso compartido</span><h3><a href="#archivo-${index}">${escapeHTML(d.name)}</a></h3><p>${escapeHTML(people.get(d.uploadedBy || "") || "Participante")} · ${escapeHTML(d.mimeType)}</p></div></li>` })))
    .sort((a, b) => a.at - b.at || a.tie.localeCompare(b.tie));
  const gallery = report.documents.map((d, index) => {
    const resource = originals.get(d.id), url = resource?.archivePath ? localURL(resource.archivePath) : null;
    const image = ["image/png", "image/jpeg", "image/webp"].includes(d.mimeType);
    return `<article id="archivo-${index}" class="resource">${url && image ? `<a href="${escapeHTML(url)}" download><img loading="lazy" src="${escapeHTML(url)}" alt="${escapeHTML(d.name)}"></a>` : '<div class="file-icon" aria-hidden="true">▤</div>'}<div class="resource-body"><span class="kind">${image ? "Imagen" : "Archivo"}</span><h3>${escapeHTML(d.name)}</h3><p class="muted">${escapeHTML(d.mimeType)} · ${(d.size / 1000000).toLocaleString("es-CO", { maximumFractionDigits: 2 })} MB</p>${url ? `<a class="download" href="${escapeHTML(url)}" download>Abrir original incluido</a>` : '<p class="notice">Original eliminado o no disponible. Se conserva su registro y el texto reconocido.</p>'}${d.extractionStatus === "partial" ? '<p class="notice">El texto reconocido está incompleto; consulta el original incluido cuando esté disponible.</p>' : ""}${d.extractionError ? `<p class="muted">${escapeHTML(d.extractionError)}</p>` : ""}${d.extractedText ? `<details><summary>Texto reconocido del recurso</summary><p class="original">${escapeHTML(d.extractedText)}</p></details>` : '<p class="muted">Sin texto extraíble registrado.</p>'}</div></article>`;
  }).join("");
  const synthesis = report.jobs.filter(job => job.shared && ["summary", "keypoints"].includes(job.kind));
  const answers = report.jobs.filter(job => job.kind === "answer");
  const status: Record<string, string> = { completed: "Listo", queued: "En espera", running: "En preparación", failed: "No disponible", cancelled: "Cancelado" };
  const card = (job: Job) => `<article class="ai-card" id="sintesis-${report.jobs.indexOf(job)}"><span class="kind">${escapeHTML(status[job.status] || job.status)}</span><h3>${job.kind === "summary" ? "Resumen" : job.kind === "keypoints" ? "Puntos clave y acuerdos" : escapeHTML(job.question || "Pregunta sobre el reporte")}</h3>${job.result?.text ? `<p class="original">${refs(String(job.result.text), job.result.sources)}</p>` : `<p class="muted">${escapeHTML(job.error || "No hay una respuesta terminada en el momento de esta descarga.")}</p>`}</article>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' file:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escapeHTML(report.title)} · Reporte de StudyRoom</title><style>
  :root{color-scheme:light;--ink:#22413a;--green:#177769;--muted:#60746d;--line:#dde7df;--paper:#fff;--wash:#f3f7f1}*{box-sizing:border-box}body{margin:0;background:var(--wash);color:var(--ink);font:16px/1.65 system-ui,-apple-system,Segoe UI,sans-serif}a{color:var(--green);text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere}header{padding:54px max(24px,calc((100vw - 1080px)/2));background:#e4eee0;border-bottom:1px solid var(--line)}.brand{font-size:14px;font-weight:750;letter-spacing:.15em;text-transform:uppercase}.eyebrow,.kind{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:650}h1{font-size:clamp(30px,5vw,48px);line-height:1.15;margin:16px 0 20px;overflow-wrap:anywhere}h2{font-size:25px;line-height:1.3;margin:0 0 12px}h3{font-size:17px;line-height:1.4;margin:4px 0 8px;overflow-wrap:anywhere}p{margin:0 0 12px}.muted{color:var(--muted);font-size:14px}.meta{display:flex;gap:10px 24px;flex-wrap:wrap}.stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.stats span{padding:8px 13px;border:1px solid #c4d8c1;border-radius:10px;background:#f7faf4;font-size:14px}nav{max-width:1136px;margin:24px auto;padding:0 28px;display:flex;flex-wrap:wrap;gap:12px 24px;font-weight:650}main{max-width:1136px;margin:auto;padding:0 28px 50px}section{margin:28px 0;padding:28px;background:var(--paper);border:1px solid var(--line);border-radius:18px}.notice{padding:13px 16px;background:#fff6dd;border:1px solid #eddcab;border-radius:10px;font-size:14px}.timeline{padding:0;list-style:none;margin:24px 0 0}.entry{display:grid;grid-template-columns:105px minmax(0,1fr);gap:16px;padding:22px 0;border-bottom:1px solid var(--line)}.entry:last-child{border-bottom:0}.entry-time{font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted);padding-top:4px}.original,.word-times{white-space:pre-wrap;overflow-wrap:anywhere}.word-times{font-size:13px;color:var(--muted)}details{margin:12px 0}summary{cursor:pointer;color:var(--green);font-size:14px;font-weight:650}.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:20px}.resource{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fbfcfa}.resource img{display:block;width:100%;height:220px;object-fit:contain;background:#edf3e9}.resource-body{padding:20px}.file-icon{font-size:55px;text-align:center;color:var(--green);padding:18px;background:#edf3e9}.download{display:inline-block;padding:8px 12px;border:1px solid #c8ddd3;border-radius:8px;font-size:14px;font-weight:650;margin:0 0 12px}.ai-card{padding:20px 0;border-top:1px solid var(--line)}.source{display:inline-block;padding:1px 8px;background:#edf4e8;border:1px solid #d2e1cc;border-radius:6px;font-size:12px;margin:0 2px}.unavailable{color:var(--muted);background:#f3f4f1}.offline-note{margin-top:22px;font-size:14px;color:var(--muted)}footer{max-width:1080px;margin:0 auto 40px;padding:0 28px;color:var(--muted);font-size:13px}@media(max-width:650px){header{padding:35px 20px}nav,main{padding-left:16px;padding-right:16px}section{padding:20px}.gallery{grid-template-columns:1fr}.entry{grid-template-columns:1fr;gap:4px}}@media print{body{background:#fff}header,section{break-inside:avoid}nav{display:none}section{border-radius:0}a{color:inherit}.gallery{grid-template-columns:1fr}}
  </style></head><body><header><div class="brand">StudyRoom</div><span class="eyebrow">Reporte de tu sesión</span><h1>${escapeHTML(report.title)}</h1><div class="meta"><span>Inicio: ${escapeHTML(calendar(report.startedAt))}</span><span>Fin: ${report.endedAt ? escapeHTML(calendar(report.endedAt)) : "Sesión en curso"}</span></div><div class="stats"><span>${report.transcription.segments.length} fragmentos de voz</span><span>${report.messages.length} mensajes</span><span>${resources.filter(r => r.status === "included").length} originales incluidos</span></div><p class="offline-note">Extrae el ZIP y abre este archivo index.html. Los originales están en la carpeta recursos y los datos completos en reporte.json.</p></header><nav aria-label="Contenido del reporte"><a href="#conversacion">Conversación en orden</a><a href="#recursos">Imágenes y archivos</a><a href="#resumen">Resumen y acuerdos</a><a href="#preguntas">Tus preguntas</a></nav><main><section aria-labelledby="cobertura"><h2 id="cobertura">Cobertura de la conversación</h2><p class="notice">${escapeHTML(report.transcription.coverage.notice || "La transcripción contiene la voz reconocida de los micrófonos encendidos mientras estuvo activa; puede tener errores y no reconstruye audio anterior.")}</p><p class="muted">${Number(report.transcription.coverage.pendingBatches || 0)} intervalos pendientes · ${Number(report.transcription.coverage.failedBatches || 0)} intervalos sin transcribir. Las marcas de tiempo se cuentan desde el inicio de la sesión; las fechas se muestran en hora de Bogotá.</p></section><section id="conversacion"><h2>La conversación, de principio a fin</h2><p class="muted">Voz, mensajes y recursos ordenados por el momento en que ocurrieron. El texto reconocido se conserva completo.</p>${timeline.length ? `<ol class="timeline">${timeline.map(item => item.html).join("")}</ol>` : '<p class="notice">No hay voz, mensajes ni recursos registrados. No se inventó una conversación.</p>'}</section><section id="recursos"><h2>Imágenes y archivos compartidos</h2>${gallery ? `<div class="gallery">${gallery}</div>` : '<p class="muted">No se compartieron recursos en esta sesión.</p>'}</section><section id="resumen"><h2>Resumen y acuerdos</h2><p class="muted">Síntesis automática de la información registrada; puede contener errores. Conserva la conversación original como referencia.</p>${synthesis.length ? synthesis.map(card).join("") : '<p class="muted">No había una síntesis disponible al descargar el reporte.</p>'}</section><section id="preguntas"><h2>Tus preguntas sobre el reporte</h2><p class="muted">Esta copia incluye las preguntas y respuestas a las que tienes acceso. Para hacer nuevas preguntas, abre el reporte en StudyRoom.</p>${answers.length ? answers.map(card).join("") : '<p class="muted">No había consultas guardadas para esta copia.</p>'}</section></main><footer>StudyRoom · Aprender también es compartir. Guarda esta copia con cuidado: contiene la conversación y los recursos de tu sesión.</footer></body></html>`;
}

/** Every available original is fetched and checked before a ZIP stream exists. */
export async function createReportArchive(input: ArchiveReport, download: (documentId: string, maxBytes: number) => Promise<Buffer>) {
  const report: ArchiveReport = { ...input, jobs: input.jobs.filter(job => job.kind !== "quiz"), messages: [...input.messages].sort((a, b) => instant(a.createdAt) - instant(b.createdAt) || a.id.localeCompare(b.id)), documents: [...input.documents].sort((a, b) => instant(a.createdAt) - instant(b.createdAt) || a.id.localeCompare(b.id)), transcription: { ...input.transcription, segments: [...input.transcription.segments].sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs || a.id.localeCompare(b.id)) } };
  const resources: ArchiveResource[] = report.documents.map((resource, index) => ({ id: resource.id, name: resource.name, mimeType: resource.mimeType, size: resource.size, status: resource.available ? "included" : "unavailable", archivePath: resource.available ? resourcePath(resource, index) : null, ...(!resource.available ? { notice: "El original fue eliminado o no está disponible; se conserva el registro y el texto extraído." } : {}) }));
  const json = JSON.stringify(report, null, 2), html = reportArchiveHTML(report, resources);
  const instructions = "STUDYROOM — REPORTE COMPLETO\n\nExtrae esta carpeta y abre index.html.\nreporte.json conserva la transcripción, cada palabra y sus tiempos, chat, recursos, cobertura y consultas autorizadas.\nrecursos/ incluye cada original disponible. recursos.json identifica los originales eliminados, que no se pueden recuperar.\nLa transcripción automática puede tener errores. Esta copia refleja el estado en el momento de descargarla.\n";
  let bytes = Buffer.byteLength(json) + Buffer.byteLength(html) + Buffer.byteLength(instructions) + Buffer.byteLength(JSON.stringify(resources, null, 2)) + resources.length * 128;
  const available = report.documents.filter(resource => resource.available);
  if (available.some(resource => !Number.isSafeInteger(resource.size) || resource.size < 0 || resource.size > 10_000_000) || bytes + available.reduce((sum, resource) => sum + resource.size, 0) > REPORT_ARCHIVE_MAX_BYTES) tooLarge();
  const zip = new JSZip();
  zip.file("index.html", html); zip.file("reporte.json", json); zip.file("LEEME.txt", instructions);
  for (const resource of resources.filter(resource => resource.status === "included")) {
    const content = await download(resource.id, REPORT_ARCHIVE_MAX_BYTES - bytes);
    if (!Buffer.isBuffer(content)) throw new ServiceUnavailableException("No se pudo incluir un original. No se preparó un reporte parcial.");
    bytes += content.length;
    if (bytes > REPORT_ARCHIVE_MAX_BYTES || content.length > 10_000_000) tooLarge();
    resource.size = content.length;
    resource.sha256 = createHash("sha256").update(content).digest("hex");
    zip.file(resource.archivePath!, content, { binary: true, compression: "STORE" });
  }
  zip.file("recursos.json", JSON.stringify(resources, null, 2));
  return { resources, stream: zip.generateNodeStream({ streamFiles: true, compression: "DEFLATE", compressionOptions: { level: 3 } }) };
}
