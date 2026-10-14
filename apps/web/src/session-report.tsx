import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AudioLines, Bot, Download, FileText, Image, MessageSquare, Search, Send, Users } from "lucide-react";
import { api, errorText, json } from "./api";
import { JobCard } from "./ai";
import type { Job, SessionReport } from "./types";
import { Badge, Empty, ErrorBox, Modal, prettyBytes, shortTime } from "./ui";
import { CoverageNotice, elapsedTime } from "./transcription-panel";
import { reportSourceAnchor, type ReportSourceMap } from "./report-sources";
import { useSourceNavigation } from "./source-text";

type TimelineEvent =
  | { kind: "voice"; id: string; at: number; segment: SessionReport["transcription"]["segments"][number] }
  | { kind: "message"; id: string; at: number; message: SessionReport["messages"][number] }
  | { kind: "document"; id: string; at: number; document: SessionReport["documents"][number] };

function eventTime(value: string, fallback: number) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function reportTimeline(session: SessionReport): TimelineEvent[] {
  const started = eventTime(session.startedAt, 0);
  return [
    ...(session.transcription?.segments || []).map((segment): TimelineEvent => ({ kind: "voice", id: segment.id, at: started + (Number.isFinite(segment.startMs) ? segment.startMs : 0), segment })),
    ...(session.messages || []).map((message): TimelineEvent => ({ kind: "message", id: message.id, at: eventTime(message.createdAt, started), message })),
    ...(session.documents || []).map((document): TimelineEvent => ({ kind: "document", id: document.id, at: eventTime(document.createdAt, started), document })),
  ].sort((a, b) => a.at - b.at || `${a.kind}:${a.id}`.localeCompare(`${b.kind}:${b.id}`));
}

function ReportDocument({ sessionId, document }: { sessionId: string; document: SessionReport["documents"][number] }) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const image = ["image/png", "image/jpeg", "image/webp"].includes(document.mimeType);
  useEffect(() => {
    if (!image || !document.available) return;
    let active = true;
    void api<{ url: string }>(`/sessions/${sessionId}/documents/${document.id}/url`).then((result) => {
      if (active) setUrl(result.url);
    }).catch(() => {});
    return () => { active = false; };
  }, [sessionId, document.id, document.available, image]);
  async function open() {
    setBusy(true); setError("");
    try {
      const result = await api<{ url: string }>(`/sessions/${sessionId}/documents/${document.id}/url`);
      if (image || document.mimeType === "application/pdf") { setUrl(result.url); setPreview(true); }
      else {
        const anchor = window.document.createElement("a");
        anchor.href = result.url; anchor.target = "_blank"; anchor.rel = "noopener noreferrer";
        anchor.download = document.name; anchor.click();
      }
    } catch (failure) { setError(errorText(failure)); }
    finally { setBusy(false); }
  }
  return <article className="report-document" id={reportSourceAnchor("documento", document.id)} tabIndex={-1}>
    {image && url ? <button className="report-image" aria-label={`Ampliar ${document.name}`} onClick={() => void open()}><img src={url} alt={document.name} loading="lazy" onError={() => setUrl("")} /></button> : <div className="report-document-icon">{image ? <Image size={30} /> : <FileText size={30} />}</div>}
    <div className="report-document-info"><strong>{document.name}</strong><small>{prettyBytes(document.size)} · {shortTime(document.createdAt)}</small><Badge tone={document.available ? "green" : ""}>{document.available ? "Disponible" : "Ya no disponible"}</Badge></div>
    <button className="button secondary" disabled={busy || !document.available} onClick={() => void open()}><Download size={15} />{busy ? "Abriendo…" : image ? "Ver imagen" : "Abrir archivo"}</button>
    <ErrorBox message={error} />
    {["partial", "unavailable", "no_text", "pending", "failed"].includes(document.extractionStatus || "") && <p className="report-resource-notice" role="status">{document.extractionStatus === "partial" ? "Solo se reconoció parte del texto de este recurso." : document.extractionStatus === "pending" ? "El texto de este recurso aún se está preparando." : document.extractionStatus === "no_text" ? "No se encontró texto legible en este recurso." : "El texto de este recurso no está disponible para el asistente."}{document.extractionError ? ` ${document.extractionError}` : ""}</p>}
    {document.extractedText && <details className="report-document-text"><summary>Texto reconocido del archivo</summary><p className="preserve-lines">{document.extractedText}</p></details>}
    {preview && <Modal title={document.name} onClose={() => setPreview(false)}>{image ? <img className="report-image-expanded" src={url} alt={document.name} /> : <iframe className="document-pdf" src={url} title={document.name} />}</Modal>}
  </article>;
}

export function ReportArchive({ session }: { session: SessionReport }) {
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | TimelineEvent["kind"]>("all");
  const segments = session.transcription?.segments || [];
  const documents = session.documents || [];
  const messages = session.messages || [];
  const timeline = useMemo(() => reportTimeline(session), [session]);
  const reveal = (entry: TimelineEvent) => {
    setSearch(""); setKind("all");
    setLimit((current) => Math.max(current, timeline.indexOf(entry) + 1));
  };
  useSourceNavigation("transcripcion", segments.map((segment) => segment.id), (index) => { const entry = timeline.find((item) => item.kind === "voice" && item.id === segments[index].id); if (entry) reveal(entry); });
  useSourceNavigation("mensaje", messages.map((message) => message.id), (index) => { const entry = timeline.find((item) => item.kind === "message" && item.id === messages[index].id); if (entry) reveal(entry); });
  useSourceNavigation("documento", documents.map((document) => document.id), (index) => { const entry = timeline.find((item) => item.kind === "document" && item.id === documents[index].id); if (entry) reveal(entry); });
  const query = search.trim().toLocaleLowerCase("es");
  const filtered = useMemo(() => timeline.filter((entry) => (kind === "all" || entry.kind === kind) && (!query || (entry.kind === "voice" ? `${entry.segment.speakerName} ${entry.segment.text}` : entry.kind === "message" ? `${entry.message.displayName} ${entry.message.text}` : `${entry.document.name} ${entry.document.extractedText || ""}`).toLocaleLowerCase("es").includes(query))), [timeline, kind, query]);
  const started = eventTime(session.startedAt, 0);
  const people = new Map((session.transcription?.participants || []).map((person) => [person.userId, person.displayName]));
  return <>
    <div className="report-overview">
      <div><AudioLines size={20} /><strong>{segments.length}</strong><span>Intervenciones de voz</span></div>
      <div><MessageSquare size={20} /><strong>{messages.length}</strong><span>Mensajes compartidos</span></div>
      <div><FileText size={20} /><strong>{documents.length}</strong><span>Imágenes y archivos</span></div>
      <div><Users size={20} /><strong>{session.transcription?.participants?.length || 0}</strong><span>Participantes registrados</span></div>
    </div>
    <nav className="report-section-links" aria-label="Secciones del reporte"><a href="#report-timeline">Conversación en orden</a><a href="#report-learning">Resumen y puntos clave</a><a href="#report-questions">Preguntar al reporte</a></nav>
    <section className="panel report-section" id="report-timeline"><div className="section-heading"><h2><AudioLines size={23} /> La reunión, de principio a fin</h2><Badge>{timeline.length} momentos</Badge></div><p className="muted">Voz transcrita, mensajes, imágenes y archivos aparecen juntos en el orden en que se compartieron. Los tiempos se cuentan desde el inicio de la sesión.</p><CoverageNotice data={session.transcription} />
      <div className="report-timeline-filters"><label className="search-field"><Search size={16} /><input aria-label="Buscar en el reporte" placeholder="Buscar en la conversación…" value={search} onChange={(event) => { setSearch(event.target.value); setLimit(100); }} /></label><label><span className="sr-only">Tipo de contenido</span><select aria-label="Filtrar eventos del reporte" value={kind} onChange={(event) => { setKind(event.target.value as typeof kind); setLimit(100); }}><option value="all">Todo</option><option value="voice">Voz</option><option value="message">Mensajes</option><option value="document">Imágenes y archivos</option></select></label></div>
      {filtered.length ? <ol className="report-timeline">{filtered.slice(0, limit).map((entry) => <li key={`${entry.kind}:${entry.id}`} className={`report-timeline-entry ${entry.kind}`}>
        <time className="report-timeline-time" dateTime={new Date(entry.at).toISOString()} title={shortTime(new Date(entry.at).toISOString())}>{elapsedTime(entry.at - started)}</time>
        <span className="report-timeline-icon" aria-hidden="true">{entry.kind === "voice" ? <AudioLines size={18} /> : entry.kind === "message" ? <MessageSquare size={18} /> : entry.document.mimeType.startsWith("image/") ? <Image size={18} /> : <FileText size={18} />}</span>
        <div className="report-timeline-content">{entry.kind === "voice" ? <div id={reportSourceAnchor("transcripcion", entry.id)} tabIndex={-1}><span className="report-timeline-kind">Voz reconocida</span><div className="transcript-byline"><strong>{entry.segment.speakerName || "Participante"}</strong><time>{elapsedTime(entry.segment.startMs)}–{elapsedTime(entry.segment.endMs)}</time></div><p className="preserve-lines">{entry.segment.text}</p>{!!entry.segment.words?.length && <details className="report-word-times"><summary>Ver palabras y tiempos</summary><p>{entry.segment.words.map((word) => `${elapsedTime(word.startMs)} ${word.word}`).join(" · ")}</p></details>}</div> : entry.kind === "message" ? <div id={reportSourceAnchor("mensaje", entry.id)} tabIndex={-1}><span className="report-timeline-kind">Mensaje escrito</span><div className="transcript-byline"><strong>{entry.message.displayName || (entry.message.kind === "ai" ? "Asistente" : "Participante")}</strong><time>{shortTime(entry.message.createdAt)}</time></div><p className="preserve-lines">{entry.message.text}</p></div> : <><span className="report-timeline-kind">{entry.document.mimeType.startsWith("image/") ? "Imagen compartida" : "Archivo compartido"} · {people.get(entry.document.uploadedBy) || "Participante"}</span><ReportDocument sessionId={session.id} document={entry.document} /></>}</div>
      </li>)}</ol> : <Empty title={query || kind !== "all" ? "No hay coincidencias" : "Aún no hay contenido registrado"}>{query || kind !== "all" ? "Prueba otra búsqueda o muestra todo." : "La voz, el chat y los recursos aparecerán aquí en orden."}</Empty>}
      {filtered.length > limit && <button className="button secondary" onClick={() => setLimit((value) => value + 100)}>Mostrar más momentos ({filtered.length - limit} restantes)</button>}
    </section>
  </>;
}

export function ReportQuestions({ sessionId, jobs, onRefresh, sourceMap }: { sessionId: string; jobs: Job[]; onRefresh: () => void; sourceMap?: ReportSourceMap }) {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [request, setRequest] = useState<{ question: string; clientId: string } | null>(null);
  useEffect(() => {
    setAnswers((old) => {
      const incoming = jobs.filter((job) => job.kind === "answer");
      return [...incoming, ...old.filter((job) => !incoming.some((entry) => entry.id === job.id))];
    });
  }, [jobs]);
  useEffect(() => {
    const waiting = answers.filter((job) => ["queued", "running"].includes(job.status));
    if (!waiting.length) return;
    let active = true;
    const timer = setInterval(() => waiting.forEach((job) => {
      void api<Job>(`/ai/jobs/${job.id}`).then((updated) => {
        if (active) setAnswers((old) => old.map((entry) => entry.id === updated.id ? { ...entry, ...updated } : entry));
      }).catch(() => {});
    }), 4000);
    return () => { active = false; clearInterval(timer); };
  }, [answers]);
  async function send(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const trimmed = question.trim();
    const submission = request?.question === trimmed ? request : { question: trimmed, clientId: crypto.randomUUID() };
    setRequest(submission);
    try {
      const job = await api<Job>(`/sessions/${sessionId}/questions`, json("POST", submission));
      setAnswers((old) => [{ ...job, question: trimmed }, ...old.filter((entry) => entry.id !== job.id)]);
      setQuestion(""); setRequest(null); onRefresh();
    } catch (failure) { setError(errorText(failure)); }
    finally { setBusy(false); }
  }
  return <section className="panel report-section report-question-panel" id="report-questions"><div className="section-heading"><h2><Bot size={24} /> Pregúntale a este reporte</h2><Badge tone="green">Conversación privada</Badge></div><p className="muted">El asistente consulta la voz registrada, el chat y el texto reconocido de los archivos de esta sesión para ayudarte a repasar.</p><ErrorBox message={error} /><form className="form-stack" onSubmit={send}><label htmlFor="report-question">¿Qué te gustaría entender?</label><textarea id="report-question" required minLength={3} maxLength={1500} rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="¿Qué explicó cada participante sobre este tema?" /><button className="button primary" disabled={busy || question.trim().length < 3}><Send size={17} />{busy ? "Guardando tu pregunta…" : "Consultar este reporte"}</button></form><p className="local-ai-note">La respuesta aparecerá aquí cuando el equipo de IA esté disponible. Solo tú ves tus preguntas y respuestas.</p><div className="job-list">{answers.map((job) => <JobCard key={job.id} job={job} sourceMap={sourceMap} onUpdated={(updated) => { setAnswers((old) => old.map((entry) => entry.id === updated.id ? { ...entry, ...updated } : entry)); onRefresh(); }} retryQuestion={(value) => { setQuestion(value); window.document.getElementById("report-question")?.focus(); }} />)}</div></section>;
}
