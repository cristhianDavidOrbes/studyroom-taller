import { useEffect, useState, type FormEvent } from "react";
import { AudioLines, Bot, Download, FileText, Image, MessageSquare, Send, Users } from "lucide-react";
import { api, errorText, json } from "./api";
import { JobCard } from "./ai";
import type { Job, SessionReport } from "./types";
import { Badge, Empty, ErrorBox, Modal, prettyBytes, shortTime } from "./ui";
import { CoverageNotice, TranscriptList } from "./transcription-panel";
import { reportSourceAnchor, type ReportSourceMap } from "./report-sources";
import { useSourceNavigation } from "./source-text";

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
  const [chatLimit, setChatLimit] = useState(100);
  const [documentLimit, setDocumentLimit] = useState(20);
  const segments = session.transcription?.segments || [];
  const documents = session.documents || [];
  const messages = session.messages || [];
  useSourceNavigation("mensaje", messages.map((message) => message.id), (index) => setChatLimit((value) => Math.max(value, index + 1)));
  useSourceNavigation("documento", documents.map((document) => document.id), (index) => setDocumentLimit((value) => Math.max(value, index + 1)));
  return <>
    <div className="report-overview">
      <div><AudioLines size={20} /><strong>{segments.length}</strong><span>Intervenciones de voz</span></div>
      <div><MessageSquare size={20} /><strong>{messages.length}</strong><span>Mensajes compartidos</span></div>
      <div><FileText size={20} /><strong>{documents.length}</strong><span>Imágenes y archivos</span></div>
      <div><Users size={20} /><strong>{session.transcription?.participants?.length || 0}</strong><span>Participantes registrados</span></div>
    </div>
    <nav className="report-section-links" aria-label="Secciones del reporte"><a href="#report-voice">Voz de la sesión</a><a href="#report-chat">Conversación escrita</a><a href="#report-files">Imágenes y archivos</a><a href="#report-learning">Resumen y puntos clave</a><a href="#report-questions">Preguntar al reporte</a></nav>
    <section className="panel report-section" id="report-voice"><div className="section-heading"><h2><AudioLines size={23} /> Lo que se habló</h2><Badge>{segments.length} intervenciones</Badge></div><p className="muted">Transcripción original, por participante y momento de la sesión. El texto se conserva como lo reconoció el servicio de voz.</p><CoverageNotice data={session.transcription} /><TranscriptList segments={segments} searchable /></section>
    <section className="panel report-section" id="report-chat"><div className="section-heading"><h2><MessageSquare size={23} /> La conversación escrita</h2><Badge>{messages.length} mensajes</Badge></div>
      {messages.length ? <ol className="report-chat-log">{messages.slice(0, chatLimit).map((message) => <li key={message.id} id={reportSourceAnchor("mensaje", message.id)} tabIndex={-1}><div className="transcript-byline"><strong>{message.displayName || (message.kind === "ai" ? "Asistente" : "Participante")}</strong><time>{shortTime(message.createdAt)}</time></div><p className="preserve-lines">{message.text}</p></li>)}</ol> : <Empty title="No hubo mensajes compartidos">La conversación de voz se consulta en la sección anterior.</Empty>}
      {messages.length > chatLimit && <button className="button secondary" onClick={() => setChatLimit((value) => value + 100)}>Mostrar más mensajes</button>}
    </section>
    <section className="panel report-section" id="report-files"><div className="section-heading"><h2><FileText size={23} /> Imágenes y archivos compartidos</h2><Badge>{documents.length} recursos</Badge></div><p className="muted">Los participantes de la sesión pueden volver a consultar los recursos que siguen disponibles.</p>
      {documents.length ? <div className="report-documents">{documents.slice(0, documentLimit).map((document) => <ReportDocument key={`${session.id}:${document.id}`} document={document} sessionId={session.id} />)}</div> : <Empty title="Esta sesión no tiene adjuntos">Aquí aparecerán las imágenes y los archivos compartidos durante la sesión.</Empty>}
      {documents.length > documentLimit && <button className="button secondary" onClick={() => setDocumentLimit((value) => value + 20)}>Mostrar más recursos ({documents.length - documentLimit} restantes)</button>}
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
