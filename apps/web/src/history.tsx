import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  ListChecks,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { api, API_URL, errorText, json } from "./api";
import { auth } from "./firebase";
import type { Job, Session, SessionReport } from "./types";
import { ReportArchive, ReportQuestions } from "./session-report";
import { buildReportSources, reportSourceAnchor } from "./report-sources";
import { JobCard } from "./ai";
import { Badge, dateTime, Empty, ErrorBox, Spinner, useToast } from "./ui";
import "./report-enhancements.css";
export function HistoryPage() {
  const [q, setQ] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const {
    data: sessions = [],
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const all: Session[] = [];
      let after = "";
      for (;;) {
        const page = await api<Session[]>(`/sessions${after ? `?after=${encodeURIComponent(after)}` : ""}`);
        all.push(...page);
        if (page.length < 100) return all;
        after = page[page.length - 1].id;
      }
    },
  });
  const filtered = sessions.filter(
    (s) =>
      `${s.title || s.room?.title || ""} ${s.room?.subject || ""}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!from || new Date(s.startedAt) >= new Date(from)) &&
      (!to ||
        new Date(s.startedAt) < new Date(new Date(to).getTime() + 86400000)),
  );
  const minutes = sessions.reduce(
    (sum, s) =>
      sum +
      (s.endedAt
        ? Math.max(
            0,
            Math.round(
              (new Date(s.endedAt).getTime() -
                new Date(s.startedAt).getTime()) /
                60000,
            ),
          )
        : 0),
    0,
  );
  return (
    <div className="page">
      <span className="eyebrow">TUS SESIONES GUARDADAS</span>
      <h1>Mis reportes</h1>
      <p className="page-intro">
        Consulta los reportes de las reuniones en las que participaste.
      </p>
      <div className="stats-grid">
        <div className="stat-card">
          <span>
            <BookOpen size={21} />
          </span>
          <strong>{sessions.length}</strong>
          <p>Sesiones de estudio</p>
        </div>
        <div className="stat-card">
          <span>
            <Clock3 size={21} />
          </span>
          <strong>
            {minutes >= 60
              ? `${(minutes / 60).toFixed(1)} h`
              : `${minutes} min`}
          </strong>
          <p>Tiempo compartido</p>
        </div>
        <div className="stat-card">
          <span>
            <Sparkles size={21} />
          </span>
          <strong>{sessions.filter((s) => s.endedAt).length}</strong>
          <p>Sesiones finalizadas</p>
        </div>
      </div>
      <section className="history-list">
        <div className="section-heading">
          <h2>Todos tus reportes</h2>
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Buscar en el historial"
              placeholder="Busca una sesión…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>
        <div className="history-date-filters">
          <label>
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button
            className="text-button"
            onClick={() => {
              setFrom("");
              setTo("");
              setQ("");
            }}
          >
            Limpiar
          </button>
        </div>
        <ErrorBox
          message={error ? errorText(error) : ""}
          retry={() => void refetch()}
        />
        {isPending ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <Empty
            title="Aquí empieza tu recorrido"
            action={
              <Link to="/" className="button primary">
                Explorar salas
              </Link>
            }
          >
            Tus sesiones, reportes y consultas aparecerán aquí.{" "}
            {q ? "Prueba otra búsqueda." : "Encuentra una sala para comenzar."}
          </Empty>
        ) : (
          filtered.map((session) => (
            <Link
              className="history-row"
              to={`/sesiones/${session.id}`}
              key={session.id}
            >
              <span className="history-icon">
                <BookOpen size={25} />
              </span>
              <div>
                <h3>
                  {session.title || session.room?.title || "Sesión de estudio"}
                </h3>
                <p>
                  <CalendarDays size={14} />
                  {dateTime(session.startedAt)}
                </p>
              </div>
              <Badge tone={session.endedAt ? "green" : ""}>
                {session.endedAt ? "Finalizada" : "En curso"}
              </Badge>
              <ArrowUpRight size={20} />
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
export function SessionPage() {
  const { id } = useParams();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();
  const {
    data: session,
    isPending,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["session", id],
    queryFn: () => api<SessionReport>(`/sessions/${id}/report`),
    refetchInterval: (query) =>
      query.state.data?.transcription?.coverage.pendingBatches || query.state.data?.jobs?.some((j) =>
        ["summary", "keypoints", "answer"].includes(j.kind) && ["running", "queued"].includes(j.status),
      )
        ? 4000
        : false,
  });
  const { data: privateNotes } = useQuery({
    queryKey: ["session-notes", session?.roomId],
    queryFn: () => api<{ text: string }>(`/rooms/${session!.roomId}/notes`),
    enabled: !!session?.roomId,
  });
  async function generate(kind: "summary" | "keypoints") {
    setBusy(true);
    setError("");
    try {
      await api<Job>(`/sessions/${id}/artifacts`, json("POST", { kind }));
      await refetch();
      toast("La solicitud quedó guardada");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function download(format: "json" | "markdown" | "docx" | "zip") {
    if (downloading) return;
    setDownloading(true); setError("");
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${API_URL}/sessions/${id}/export?format=${format}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(typeof detail?.message === "string" ? detail.message : "No se pudo descargar la sesión.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studyroom-sesion-${id}.${format === "markdown" ? "md" : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(errorText(e));
    } finally { setDownloading(false); }
  }
  if (isPending) return <Spinner />;
  if (queryError || !session)
    return (
      <div className="page">
        <ErrorBox
          message={errorText(queryError)}
          retry={() => void refetch()}
        />
      </div>
    );
  const jobs = (session.jobs || []).filter((job) => ["summary", "keypoints", "answer"].includes(job.kind));
  const sourceMap = buildReportSources(session);
  return (
    <div className="page session-page">
      <Link className="text-button" to="/historial">
        <ArrowLeft size={17} />
        Mis reportes
      </Link>
      <div className="welcome-row report-header-card">
        <div>
          <span className="eyebrow"><Users size={14} /> EL REPORTE DE LA REUNIÓN</span>
          <h1>{session.title || session.room?.title || "Sesión de estudio"}</h1>
          <p className="page-intro">
            {dateTime(session.startedAt)}{" "}
            {session.endedAt
              ? `· Finalizó ${dateTime(session.endedAt)}`
              : "· En curso"}
          </p>
          <p className="report-header-description">Lo que hablaron, las ideas que compartieron y los recursos para volver a entenderlo. Disponible para todos los participantes de esta reunión.</p>
        </div>
        <div className="report-download-actions">
        <button className="button primary" disabled={downloading} onClick={() => void download("zip")}><Download size={17} />{downloading ? "Preparando descarga…" : "Descargar reporte completo"}</button>
        <span>Incluye Word, conversación en orden y todos los archivos originales disponibles.</span>
        <details className="export-menu">
          <summary className="button secondary">
            <Download size={16} />
            Otros formatos
          </summary>
          <button disabled={downloading} onClick={() => void download("markdown")}>
            Documento Markdown
          </button>
          <button disabled={downloading} onClick={() => void download("docx")}>Documento Word</button>
          <button disabled={downloading} onClick={() => void download("json")}>Datos JSON</button>
        </details>
        </div>
      </div>
      <ErrorBox message={error} />
      <ReportArchive key={session.id} session={session} />
      <section id="report-learning" className="report-learning-section">
      <div className="section-heading"><h2><Sparkles size={23} /> Lo aprendido, con ayuda de la IA</h2></div>
      <div className="artifact-actions">
        {[
          ["summary", "Resumen de la sesión", FileText],
          ["keypoints", "Puntos clave y acuerdos", ListChecks],
        ].map(([kind, title, Icon]) => {
          const pending = jobs.some(
            (j) => j.kind === kind && ["queued", "running"].includes(j.status),
          );
          const Symbol = Icon as typeof FileText;
          return (
            <button
              className="artifact-action"
              key={kind as string}
              disabled={busy || pending || !session.endedAt}
              onClick={() => void generate(kind as "summary" | "keypoints")}
            >
              <Symbol size={25} />
              <strong>{title as string}</strong>
              <span>
                {pending
                  ? "Generación en espera…"
                  : !session.endedAt
                    ? "Disponible al finalizar"
                    : "Preparar con el asistente"}
                <ArrowUpRight size={14} />
              </span>
            </button>
          );
        })}
      </div>
      <p className="muted">
        El resumen y los puntos clave usan la voz registrada, el chat y los recursos
        autorizados de la sesión. Revisa los resultados junto con las fuentes.
      </p>
      {jobs.length === 0 && (
        <Empty
          title={
            session.endedAt
              ? "Conserva las ideas que importan"
              : "Tu sesión sigue en marcha"
          }
        >
          {session.endedAt
            ? "Prepara un resumen o extrae los puntos clave de este reporte."
            : "Cuando termine, podrás consultar el reporte y hacer preguntas sobre la sesión."}
        </Empty>
      )}
      <div className="artifact-list">
        {jobs
          .filter((j) => ["summary", "keypoints"].includes(j.kind))
          .map((job) => (
            <section key={job.id} id={reportSourceAnchor("sintesis", job.id)} tabIndex={-1}>
              <h2 className="artifact-heading">
                {job.kind === "summary"
                  ? "Resumen"
                  : "Puntos clave"}
              </h2>
              <JobCard job={job} sourceMap={sourceMap} onUpdated={() => void refetch()} />
            </section>
          ))}
      </div>
      </section>
      <ReportQuestions key={session.id} sessionId={session.id} jobs={jobs} sourceMap={sourceMap} onRefresh={() => void refetch()} />
      {privateNotes?.text && (
        <section className="panel private-notes">
          <h2>Mis notas privadas</h2>
          <p>Solo tú puedes ver estas notas. No se envían al asistente.</p>
          <div className="preserve-lines">{privateNotes.text}</div>
        </section>
      )}
    </div>
  );
}
