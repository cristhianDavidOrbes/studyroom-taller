import { useEffect, useState, type FormEvent } from "react";
import {
  Bot,
  Send,
  ThumbsUp,
  ThumbsDown,
  StopCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { api, errorText, json } from "./api";
import type { Job, StudyDocument } from "./types";
import { ErrorBox, Spinner, useToast } from "./ui";
import { SourceText } from "./source-text";
import type { ReportSourceMap } from "./report-sources";
export const jobLabel: Record<Job["status"], string> = {
  queued: "En espera",
  running: "Preparando respuesta",
  completed: "Completado",
  failed: "No disponible",
  cancelled: "Cancelado",
};
export function resultText(result: unknown): string {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    const o = result as {
      text?: string;
      summary?: string;
      keypoints?: string[];
      points?: string[];
    };
    if (typeof o.text === "string") return o.text;
    if (typeof o.summary === "string") return o.summary;
    if (Array.isArray(o.keypoints) && o.keypoints.every((point) => typeof point === "string")) return o.keypoints.join("\n• ");
    if (Array.isArray(o.points) && o.points.every((point) => typeof point === "string")) return o.points.join("\n• ");
    return "No hay texto de respuesta disponible.";
  }
  return result ? String(result) : "";
}
export function JobCard({
  job,
  onUpdated,
  retryQuestion,
  sourceMap,
}: {
  job: Job;
  onUpdated?: (job: Job) => void;
  retryQuestion?: (question: string) => void;
  sourceMap?: ReportSourceMap;
}) {
  const [error, setError] = useState(""),
    [rated, setRated] = useState<number | null>(null),
    [report, setReport] = useState(false);
  const toast = useToast();
  async function rate(rating: 1 | -1, reason?: string) {
    try {
      await api(
        `/ai/answers/${job.id}/feedback`,
        json("POST", { rating, reason }),
      );
      setRated(rating);
      setReport(false);
      toast("Gracias. Tu valoración se guardó.");
    } catch (e) {
      setError(errorText(e));
    }
  }
  return (
    <article className={`job-card job-${job.status}`}>
      <div className="job-card-title">
        <Bot size={17} />
        <strong>Asistente de estudio</strong>
        <span className="badge">{jobLabel[job.status]}</span>
      </div>
      {job.question && (
        <p className="preserve-lines">
          <strong>Tu pregunta:</strong> {job.question}
        </p>
      )}
      {job.status === "running" || job.status === "queued" ? (
        <>
          <p className="preserve-lines">
            <SourceText text={job.partialText || "Tu solicitud está guardada. La respuesta aparecerá aquí cuando el equipo de IA esté disponible."} result={job.result} sourceMap={sourceMap} pending />
          </p>
          <button
            className="text-button"
            onClick={() =>
              void api<Job>(`/ai/jobs/${job.id}/cancel`, json("POST"))
                .then((j) => onUpdated?.(j))
                .catch((e) => setError(errorText(e)))
            }
          >
            <StopCircle size={15} />
            Cancelar solicitud
          </button>
        </>
      ) : job.status === "completed" ? (
        <>
          <div className="ai-result preserve-lines">
            <SourceText text={resultText(job.result)} result={job.result} sourceMap={sourceMap} />
          </div>
          <p className="ai-disclaimer">
            Respuesta generada por IA. Comprueba los datos importantes con tus
            fuentes.
          </p>
          <div className="feedback-row">
            <span>¿Te resultó útil?</span>
            <button
              className="icon-button"
              aria-label="Respuesta útil"
              aria-pressed={rated === 1}
              onClick={() => void rate(1)}
            >
              <ThumbsUp size={16} />
            </button>
            <button
              className="icon-button"
              aria-label="Reportar respuesta"
              aria-pressed={rated === -1}
              onClick={() => setReport(!report)}
            >
              <ThumbsDown size={16} />
            </button>
          </div>
          {report && (
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                void rate(
                  -1,
                  String(new FormData(e.currentTarget).get("reason")),
                );
              }}
            >
              <label>
                ¿Qué deberíamos revisar?
                <textarea name="reason" required maxLength={1000} rows={2} />
              </label>
              <button className="button secondary">Enviar valoración</button>
            </form>
          )}
        </>
      ) : (
        <p role="status">
          {job.error ||
            "La solicitud fue cancelada. Puedes volver a intentarlo cuando lo necesites."}
        </p>
      )}
      {(job.status === "failed" || job.status === "cancelled") &&
        job.question &&
        retryQuestion && (
          <button
            className="text-button"
            onClick={() => retryQuestion(job.question!)}
          >
            <RefreshCw size={15} />
            Volver a preparar esta pregunta
          </button>
        )}
      <ErrorBox message={error} />
    </article>
  );
}
export function AIPanel({
  roomId,
  documents,
  jobs,
  onJob,
}: {
  roomId: string;
  documents: StudyDocument[];
  jobs: Job[];
  onJob: (j: Job) => void;
}) {
  const [question, setQuestion] = useState(""),
    [includeChat, setIncludeChat] = useState(false),
    [documentIds, setDocumentIds] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setDocumentIds((ids) =>
      ids.filter((id) => documents.some((d) => d.id === id)),
    );
  }, [documents]);
  async function send(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const job = await api<Job>(
        `/rooms/${roomId}/ai`,
        json("POST", { question, includeChat, documentIds }),
      );
      onJob({ ...job, question });
      setQuestion("");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ai-panel">
      <div className="panel-intro">
        <span className="assistant-icon">
          <Bot size={25} />
        </span>
        <h3>Un empujón para entender</h3>
        <p>
          Pregunta, contrasta y sigue aprendiendo. Tú eliges qué contexto
          compartir.
        </p>
      </div>
      <ErrorBox message={error} />
      <form className="form-stack" onSubmit={send}>
        <label className="sr-only" htmlFor="ai-question">
          Tu pregunta a la IA
        </label>
        <textarea
          id="ai-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          minLength={3}
          maxLength={1500}
          rows={3}
          placeholder="¿Me explicas este concepto con un ejemplo?"
        />
        <details className="context-settings">
          <summary>Contexto para esta pregunta</summary>
          <label className="check-row">
            <input
              type="checkbox"
              checked={includeChat}
              onChange={(e) => setIncludeChat(e.target.checked)}
            />
            Incluir el chat de esta sala
          </label>
          {documents.length === 0 ? (
            <small>No hay documentos compartidos.</small>
          ) : (
            documents.map((doc) => (
              <label className="check-row" key={doc.id}>
                <input
                  type="checkbox"
                  checked={documentIds.includes(doc.id)}
                  disabled={
                    !documentIds.includes(doc.id) && documentIds.length >= 5
                  }
                  onChange={(e) =>
                    setDocumentIds((ids) =>
                      e.target.checked
                        ? [...ids, doc.id]
                        : ids.filter((id) => id !== doc.id),
                    )
                  }
                />
                <FileText size={14} />
                {doc.name}
              </label>
            ))
          )}
          <small>Tus notas privadas no se envían al asistente.</small>
        </details>
        <button className="button primary" disabled={busy}>
          {busy ? (
            <Spinner label="Enviando…" />
          ) : (
            <>
              Consultar al asistente
              <Send size={16} />
            </>
          )}
        </button>
      </form>
      <p className="local-ai-note">
        La IA funciona en el equipo del anfitrión del servicio. Si está apagado
        o sin conexión, tu pregunta puede quedar en espera.
      </p>
      <div className="job-list">
        {jobs.filter((job) => job.kind !== "quiz").map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onUpdated={onJob}
            retryQuestion={(value) => {
              setQuestion(value);
              document.getElementById("ai-question")?.focus();
            }}
          />
        ))}
      </div>
    </div>
  );
}
