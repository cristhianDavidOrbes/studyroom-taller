import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import {
  ArrowLeft,
  MessageSquare,
  Users,
  FileText,
  NotebookPen,
  Bot,
  Send,
  Hand,
  Smile,
  Link2,
  Settings2,
  LogOut,
  Check,
  Upload,
  ExternalLink,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Clock3,
  Flag,
  Shield,
  Download,
  AudioLines,
} from "lucide-react";
import { auth } from "./firebase";
import { api, SOCKET_URL, errorText, json } from "./api";
import { useAuth } from "./auth";
import { RoomForm } from "./explore";
import { AIPanel } from "./ai";
import { MediaStage } from "./media";
import { useTranscription } from "./use-transcription";
import { TranscriptionPanel } from "./transcription-panel";
import "./report-enhancements.css";
import type {
  StudyRoom,
  Member,
  Message,
  StudyDocument,
  Timer,
  Job,
  RoomState,
} from "./types";
import {
  Badge,
  Brand,
  Empty,
  ErrorBox,
  Modal,
  Spinner,
  dateTime,
  initials,
  prettyBytes,
  shortTime,
  useToast,
} from "./ui";
const defaultTimer: Timer = {
  running: false,
  remainingSeconds: 1500,
  mode: "focus",
};
function TimerWidget({
  timer,
  roomId,
  canManage,
  onUpdate,
}: {
  timer: Timer;
  roomId: string;
  canManage: boolean;
  onUpdate: (t: Timer) => void;
}) {
  const [now, setNow] = useState(Date.now()),
    [error, setError] = useState("");
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(
    0,
    timer.running && timer.endsAt
      ? Math.ceil((new Date(timer.endsAt).getTime() - now) / 1000)
      : timer.remainingSeconds,
  );
  async function change(action: string, mode = timer.mode) {
    try {
      setError("");
      onUpdate(
        await api<Timer>(
          `/rooms/${roomId}/timer`,
          json("PUT", {
            action,
            mode,
            ...(action === "reset"
              ? { durationSeconds: mode === "focus" ? 1500 : 300 }
              : {}),
          }),
        ),
      );
    } catch (e) {
      setError(errorText(e));
    }
  }
  return (
    <div className="timer-widget">
      <Clock3 size={19} />
      <div>
        <span>
          {timer.mode === "focus" ? "Tiempo de enfoque" : "Pausa para respirar"}
        </span>
        <strong aria-live={remaining === 0 ? "polite" : "off"}>
          {String(Math.floor(remaining / 60)).padStart(2, "0")}:
          {String(remaining % 60).padStart(2, "0")}
        </strong>
      </div>
      {canManage && (
        <>
          <button
            className="icon-button"
            aria-label={
              timer.running ? "Pausar temporizador" : "Iniciar temporizador"
            }
            onClick={() => void change(timer.running ? "pause" : "start")}
          >
            {timer.running ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button
            className="icon-button"
            aria-label="Reiniciar temporizador"
            onClick={() => void change("reset")}
          >
            <RotateCcw size={16} />
          </button>
          <select
            aria-label="Modo del temporizador"
            value={timer.mode}
            onChange={(e) =>
              void change("reset", e.target.value as "focus" | "break")
            }
          >
            <option value="focus">Enfoque</option>
            <option value="break">Pausa</option>
          </select>
        </>
      )}
      <ErrorBox message={error} />
    </div>
  );
}
export function RoomPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("chat"),
    [error, setError] = useState(""),
    [edit, setEdit] = useState(false),
    [confirm, setConfirm] = useState<"leave" | "close" | "cancel" | null>(null),
    [busy, setBusy] = useState(false);
  const [members, setMembers] = useState<Member[]>([]),
    [messages, setMessages] = useState<Message[]>([]),
    [timer, setTimer] = useState<Timer>(defaultTimer),
    [jobs, setJobs] = useState<Job[]>([]),
    [connected, setConnected] = useState(false),
    [reaction, setReaction] = useState(""),
    [text, setText] = useState(""),
    [sending, setSending] = useState(false),
    [notes, setNotes] = useState(""),
    [notesLoaded, setNotesLoaded] = useState(false),
    [noteSaved, setNoteSaved] = useState(true),
    [noteBusy, setNoteBusy] = useState(false),
    [invite, setInvite] = useState(""),
    [documentPreview, setDocumentPreview] = useState<{
      doc: StudyDocument;
      url?: string;
      status: "requesting" | "loading" | "ready" | "error";
      error?: string;
    } | null>(null);
  const socketRef = useRef<Socket | null>(null),
    bottom = useRef<HTMLDivElement>(null),
    fileRef = useRef<HTMLInputElement>(null),
    previewRequest = useRef(0);
  const reactionTimeout = useRef<ReturnType<typeof setTimeout>>();
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const notesDirtyRef = useRef(!noteSaved);
  notesDirtyRef.current = !noteSaved;
  const pendingMessage = useRef<{ text: string; id: string } | null>(null);
  const {
    data: room,
    isPending,
    error: roomError,
    refetch,
  } = useQuery({
    queryKey: ["room", id],
    queryFn: () => api<StudyRoom>(`/rooms/${id}`),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === "scheduled" ? 5000 : false,
  });
  const joined = !!room?.myRole;
  const transcription = useTranscription(id, joined, user?.uid);
  const finishTranscription = useRef(transcription.stopForClose);
  finishTranscription.current = transcription.stopForClose;
  const role =
    members.find((m) => m.userId === user?.uid)?.role || room?.myRole;
  const manage = role === "host" || role === "moderator";
  const isHost = role === "host";
  const {
    data: documents = [],
    refetch: refetchDocuments,
    error: documentsError,
  } = useQuery({
    queryKey: ["documents", id],
    queryFn: () => api<StudyDocument[]>(`/rooms/${id}/documents`),
    enabled: joined,
    refetchInterval: tab === "documents" ? 15000 : false,
  });
  useEffect(() => {
    if (!joined || noteSaved) return;
    const draft = notes;
    const timeout = setTimeout(() => {
      void api(`/rooms/${id}/notes`, json("PUT", { text: draft }))
        .then(() => {
          if (notesRef.current === draft) setNoteSaved(true);
        })
        .catch(() => {});
    }, 1500);
    return () => clearTimeout(timeout);
  }, [joined, noteSaved, notes, id]);
  const upsertJob = useCallback(
    (job: Job) =>
      setJobs((old) => {
        const previous = old.find((j) => j.id === job.id);
        const next = {
          ...previous,
          ...job,
          ...(job.status === "running" && job.partialText === undefined
            ? { partialText: previous?.partialText }
            : {}),
        };
        return [next, ...old.filter((j) => j.id !== job.id)];
      }),
    [],
  );
  useEffect(() => {
    if (!joined || !room?.sessionId) return;
    let active = true;
    api<{ jobs: Job[] }>(`/sessions/${room.sessionId}`)
      .then((data) => {
        if (active) setJobs(data.jobs || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [joined, room?.sessionId]);
  const updateRoom = useCallback(
    (value: StudyRoom) => {
      queryClient.setQueryData(["room", id], (old: StudyRoom | undefined) => ({
        ...old,
        ...value,
      }));
    },
    [id, queryClient],
  );
  const snapshot = useCallback((state: RoomState) => {
    setMembers(state.members || []);
    setMessages(state.messages || []);
    setTimer(state.timer || defaultTimer);
  }, []);
  useEffect(() => {
    if (!joined || !id) return;
    let disposed = false;
    api<{ text: string }>(`/rooms/${id}/notes`)
      .then((n) => {
        if (!disposed) {
          if (!notesDirtyRef.current) {
            setNotes(n.text || "");
            setNoteSaved(true);
          }
          setNotesLoaded(true);
        }
      })
      .catch((e) => setError(errorText(e)));
    async function setup() {
      const token = await auth.currentUser?.getIdToken();
      if (disposed) return;
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });
      socketRef.current = socket;
      socket.on("connect", () => {
        socket.emit(
          "room:join",
          { roomId: id },
          (ack: { ok: boolean; error?: string }) => {
            setConnected(ack.ok);
            if (!ack.ok)
              setError(ack.error || "No se pudo reconectar a la sala.");
          },
        );
      });
      socket.on("disconnect", () => setConnected(false));
      socket.on("connect_error", async () => {
        setConnected(false);
        socket.auth = { token: await auth.currentUser?.getIdToken(true) };
      });
      socket.on("room:state", snapshot);
      socket.on("room:members", setMembers);
      socket.on("room:updated", updateRoom);
      socket.on("documents:updated", (event: { roomId: string }) => {
        if (event.roomId === id)
          void queryClient.invalidateQueries({ queryKey: ["documents", id] });
      });
      socket.on("chat:message", (m: Message) =>
        setMessages((old) =>
          old.some(
            (x) => x.id === m.id || (!!m.clientId && x.clientId === m.clientId),
          )
            ? old
            : [...old, m].slice(-500),
        ),
      );
      socket.on("timer:updated", setTimer);
      socket.on("ai:updated", (job: Job & { roomId?: string }) => {
        if (!job.roomId || job.roomId === id) upsertJob(job);
      });
      socket.on(
        "ai:chunk",
        (data: { jobId: string; text?: string; delta?: string }) =>
          setJobs((old) =>
            old.map((j) =>
              j.id === data.jobId
                ? {
                    ...j,
                    partialText:
                      (j.partialText || "") + (data.text || data.delta || ""),
                  }
                : j,
            ),
          ),
      );
      socket.on("ai:error", (data: { message: string }) =>
        setError(data.message),
      );
      socket.on(
        "media:expired",
        (data: { roomId: string; message: string }) => {
          if (data.roomId === id) setError(data.message);
        },
      );
      socket.on("auth:error", async () => {
        try {
          socket.auth = { token: await auth.currentUser?.getIdToken(true) };
          socket.connect();
        } catch {
          setError(
            "Tu sesión terminó. Vuelve a iniciar sesión para continuar.",
          );
        }
      });
      socket.on("room:closed", async (event: { roomId: string; sessionId?: string }) => {
        if (event.roomId !== id) return;
        void finishTranscription.current();
        try {
          if (notesDirtyRef.current)
            await api(
              `/rooms/${id}/notes`,
              json("PUT", { text: notesRef.current }),
            );
          toast(
            "La sesión terminó. Tu aprendizaje está guardado en el historial.",
          );
          navigate(event.sessionId ? `/sesiones/${event.sessionId}` : "/historial");
        } catch {
          setTab("notes");
          setError(
            "La sesión terminó y no pudimos guardar tus últimas notas. Cópialas o vuelve a guardar antes de salir.",
          );
        }
      });
      socket.on("room:reaction", (r: { userId: string; emoji: string }) => {
        setReaction(r.emoji);
        clearTimeout(reactionTimeout.current);
        reactionTimeout.current = setTimeout(() => setReaction(""), 2500);
      });
      socket.on("room:hand", (r: { userId: string; raised: boolean }) =>
        setMembers((old) =>
          old.map((m) =>
            m.userId === r.userId ? { ...m, handRaised: r.raised } : m,
          ),
        ),
      );
      socket.on("room:removed", (event: { roomId: string }) => {
        if (event.roomId !== id) return;
        void finishTranscription.current();
        toast("Ya no eres miembro de esta sala.");
        navigate("/");
      });
    }
    void setup();
    return () => {
      disposed = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      clearTimeout(reactionTimeout.current);
    };
  }, [joined, id, navigate, snapshot, updateRoom, upsertJob, toast, queryClient]);
  useEffect(() => {
    if (!joined) return;
    const pending = jobs.filter(
      (j) => j.status === "queued" || j.status === "running",
    );
    if (!pending.length) return;
    const id = setInterval(() => {
      pending.forEach(
        (j) =>
          void api<Job>(`/ai/jobs/${j.id}`)
            .then(upsertJob)
            .catch(() => {}),
      );
    }, 4000);
    return () => clearInterval(id);
  }, [jobs, joined, upsertJob]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!noteSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [noteSaved]);
  async function join(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(
        `/rooms/${id}/join`,
        json("POST", {
          code: new FormData(e.currentTarget).get("code") || undefined,
          inviteToken: params.get("invite") || params.get("token") || undefined,
        }),
      );
      await refetch();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      const content = text.trim();
      if (pendingMessage.current?.text !== content)
        pendingMessage.current = { text: content, id: crypto.randomUUID() };
      const m = await api<Message>(
        `/rooms/${id}/messages`,
        json("POST", { text: content, clientId: pendingMessage.current.id }),
      );
      setMessages((old) =>
        old.some((x) => x.id === m.id) ? old : [...old, m],
      );
      pendingMessage.current = null;
      setText("");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSending(false);
    }
  }
  async function saveNotes() {
    setNoteBusy(true);
    const savedText = notes;
    try {
      await api(`/rooms/${id}/notes`, json("PUT", { text: savedText }));
      setNoteSaved(notesRef.current === savedText);
      toast("Tus notas privadas se guardaron");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setNoteBusy(false);
    }
  }
  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 10000000) {
      setError("El archivo no puede superar 10 MB.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    await action(async () => {
      await api(`/rooms/${id}/documents`, { method: "POST", body: form });
      await refetchDocuments();
      toast("Documento compartido");
    });
  }
  async function openDocument(doc: StudyDocument) {
    const request = ++previewRequest.current;
    setDocumentPreview({ doc, status: "requesting" });
    try {
      const response = await api<{ url: string }>(`/rooms/${id}/documents/${doc.id}/url`);
      if (previewRequest.current === request)
        setDocumentPreview({ doc, url: response.url, status: "loading" });
    } catch (failure) {
      if (previewRequest.current === request)
        setDocumentPreview({ doc, status: "error", error: errorText(failure) });
    }
  }
  useEffect(() => {
    if (documentPreview?.status !== "loading") return;
    const timeout = setTimeout(() => {
      setDocumentPreview((current) => current?.status === "loading"
        ? { ...current, status: "error", error: "La vista previa está tardando. Puedes abrir el archivo directamente." }
        : current);
    }, 20000);
    return () => clearTimeout(timeout);
  }, [documentPreview?.status, documentPreview?.url]);
  async function memberAction(
    member: Member,
    mode: "promote" | "demote" | "kick",
  ) {
    await action(async () => {
      await api(
        `/rooms/${id}/members/${member.userId}`,
        mode === "kick"
          ? json("DELETE")
          : json("PATCH", {
              role: mode === "promote" ? "moderator" : "participant",
            }),
      );
      setMembers(await api<Member[]>(`/rooms/${id}/members`));
    });
  }
  async function finish() {
    if (!confirm) return;
    await action(async () => {
      await finishTranscription.current();
      if (!noteSaved)
        await api(`/rooms/${id}/notes`, json("PUT", { text: notes }));
      const closed = await api<{ id?: string }>(`/rooms/${id}/${confirm}`, json("POST"));
      navigate(confirm === "close" && closed?.id ? `/sesiones/${closed.id}` : confirm === "close" ? "/historial" : "/");
    });
  }
  if (isPending)
    return (
      <div className="fullscreen-loading">
        <Spinner label="Preparando tu sala…" />
      </div>
    );
  if (roomError || !room)
    return (
      <div className="page narrow">
        <Link to="/" className="text-button">
          <ArrowLeft size={17} />
          Volver a explorar
        </Link>
        <ErrorBox message={errorText(roomError)} retry={() => void refetch()} />
      </div>
    );
  if (!joined)
    return (
      <main className="join-page">
        <Link to="/" className="brand-link">
          <Brand />
        </Link>
        <div className="panel">
          <Badge>{room.subject}</Badge>
          <h1>{room.title}</h1>
          <p>{room.description}</p>
          <p className="muted">
            {room.participantCount} de {room.capacity} participantes ·{" "}
            {dateTime(room.scheduledAt)}
          </p>
          <ErrorBox message={error} />
          <form onSubmit={join} className="form-stack">
            {room.privacy === "private" &&
              !params.get("invite") &&
              !params.get("token") && (
                <label>
                  Código de acceso
                  <input name="code" required autoComplete="off" />
                </label>
              )}
            <button
              className="button primary"
              disabled={busy || ["closed", "cancelled"].includes(room.status)}
            >
              {busy ? "Entrando…" : "Unirme a la sala"}
            </button>
            <Link to="/" className="text-button">
              Volver a explorar
            </Link>
          </form>
        </div>
      </main>
    );
  const panels = [
    ["chat", "Chat", MessageSquare],
    ["people", "Personas", Users],
    ["documents", "Archivos", FileText],
    ["notes", "Notas", NotebookPen],
    ["ai", "Asistente", Bot],
    ["transcription", "Voz", AudioLines],
  ] as const;
  return (
    <div className="room-page">
      <a className="skip-link" href="#room-main">
        Saltar al contenido
      </a>
      <header className="room-header">
        <button
          className="icon-button"
          aria-label="Volver a explorar"
          onClick={() =>
            void action(async () => {
              if (!noteSaved)
                await api(`/rooms/${id}/notes`, json("PUT", { text: notes }));
              navigate("/");
            })
          }
        >
          <ArrowLeft size={22} />
        </button>
        <div className="room-heading">
          <span className="eyebrow">
            {room.subject} · {room.modality}
          </span>
          <h1>{room.title}</h1>
        </div>
        <Badge tone="green">
          <span className="live-dot" />
          {room.status === "scheduled" ? "Antesala" : "En sesión"}
        </Badge>
        <div className="room-header-actions">
          <button
            disabled={!manage}
            className="button secondary"
            onClick={() =>
              void action(async () => {
                const data = await api<{ url: string }>(
                  `/rooms/${id}/invites`,
                  json("POST"),
                );
                setInvite(data.url);
              })
            }
          >
            <Link2 size={16} />
            <span>Invitar</span>
          </button>
          {isHost && (
            <button
              className="icon-button"
              aria-label="Editar sala"
              onClick={() => setEdit(true)}
            >
              <Settings2 size={19} />
            </button>
          )}
          <button
            className="button danger-soft"
            onClick={() => setConfirm("leave")}
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </header>
      <ErrorBox message={error} />
      {!connected && (
        <div className="room-reconnecting" role="status">
          Conectando los mensajes y la colaboración… El audio y el video tienen
          su propia conexión.
        </div>
      )}
      <div className="room-workspace" id="room-main">
        <section className="room-main-column">
          <div className="shared-report-banner">
            <span className={`shared-report-indicator ${transcription.recording ? "is-recording" : ""}`}><AudioLines size={22} /></span>
            <div><strong>Un reporte para todos en esta reunión</strong><p>{transcription.recording ? "Tu voz se está transcribiendo. Las intervenciones se ordenan por el momento en que se hablaron." : transcription.enabled ? "La transcripción está lista. Al encender tu micrófono, tu voz se incluirá automáticamente en el reporte compartido." : transcription.busy ? "Preparando la transcripción automática de tu voz…" : "Tu voz no se está transcribiendo. Revisa su estado en Voz; el chat, las imágenes y los archivos se conservan en el reporte."}</p></div>
            <button className="button secondary" onClick={() => setTab("transcription")}>Ver transcripción</button>
          </div>
          <MediaStage
            key={id}
            roomId={id!}
            onMicrophone={transcription.setMicrophone}
          />
          <div className="room-bottom-tools">
            <TimerWidget
              timer={timer}
              roomId={id!}
              canManage={manage}
              onUpdate={setTimer}
            />
            <div className="reactions">
              <button
                className="button secondary"
                disabled={!connected}
                aria-pressed={
                  !!members.find((m) => m.userId === user?.uid)?.handRaised
                }
                onClick={() =>
                  socketRef.current?.emit("room:hand", {
                    roomId: id,
                    raised: !members.find((m) => m.userId === user?.uid)
                      ?.handRaised,
                  })
                }
              >
                <Hand size={18} />
                Pedir la palabra
              </button>
              {["👏", "💡", "❤️"].map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-button"
                  aria-label={`Reaccionar ${emoji}`}
                  disabled={!connected}
                  onClick={() =>
                    socketRef.current?.emit("room:reaction", {
                      roomId: id,
                      emoji,
                    })
                  }
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          {reaction && (
            <div className="reaction-bubble" role="status">
              {reaction}
            </div>
          )}
          <div className="room-session-info">
            <p>
              <Shield size={15} />
              Solo los miembros de esta sala tienen acceso al contenido
              compartido.
            </p>
            {isHost && (
              <button
                className="text-button danger-text"
                onClick={() =>
                  setConfirm(room.status === "scheduled" ? "cancel" : "close")
                }
              >
                <Flag size={15} />
                {room.status === "scheduled"
                  ? "Cancelar sala"
                  : "Finalizar sesión y guardar"}
              </button>
            )}
          </div>
        </section>
        <aside className="collaboration-panel">
          <div
            className="room-tabs"
            role="tablist"
            aria-label="Herramientas de la sala"
          >
            {panels.map(([key, label, Icon]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                title={label}
                className={tab === key ? "active" : ""}
                onClick={() => setTab(key)}
              >
                <Icon size={19} />
                <span>{label}</span>
                {key === "people" && <small>{members.length}</small>}
              </button>
            ))}
          </div>
          <div
            className="room-panel-content"
            role="tabpanel"
            aria-label={panels.find((p) => p[0] === tab)?.[1]}
          >
            {tab === "chat" && (
              <>
                <div className="panel-heading">
                  <h2>La conversación</h2>
                  <span>Comparte, pregunta, conecta</span>
                </div>
                <div
                  className="message-list"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  {!messages.length && (
                    <Empty title="Rompe el hielo">
                      Saluda a tu grupo o comparte qué te gustaría lograr hoy.
                    </Empty>
                  )}
                  {messages.map((m) => (
                    <article
                      className={`message ${m.userId === user?.uid ? "own" : ""} ${m.kind === "ai" ? "ai-message" : ""}`}
                      key={m.id}
                    >
                      <span className="avatar small">
                        {m.kind === "ai" ? (
                          <Bot size={17} />
                        ) : (
                          initials(m.displayName || "Estudiante")
                        )}
                      </span>
                      <div>
                        <div className="message-meta">
                          <strong>
                            {m.kind === "ai" ? "Asistente IA" : m.displayName}
                          </strong>
                          <time>{shortTime(m.createdAt)}</time>
                        </div>
                        <p>{m.text}</p>
                      </div>
                    </article>
                  ))}
                  <div ref={bottom} />
                </div>
                <form onSubmit={send} className="chat-composer">
                  <label className="sr-only" htmlFor="chat-message">
                    Mensaje al grupo
                  </label>
                  <textarea
                    id="chat-message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={4000}
                    rows={2}
                    placeholder="Escribe al grupo…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!sending) void send(e);
                      }
                    }}
                  />
                  <div>
                    <small>@IA consulta el chat de esta sala</small>
                    <button
                      className="send-button"
                      aria-label="Enviar mensaje"
                      disabled={sending || !text.trim()}
                    >
                      <Send size={17} />
                    </button>
                  </div>
                </form>
              </>
            )}
            {tab === "people" && (
              <>
                <div className="panel-heading">
                  <h2>Tu grupo</h2>
                  <span>{members.length} personas en esta sala</span>
                </div>
                <div className="member-list">
                  {members.map((m) => (
                    <div className="member" key={m.userId}>
                      <span className="avatar">{initials(m.displayName)}</span>
                      <div className="member-info">
                        <strong>
                          {m.displayName}
                          {m.userId === user?.uid ? " (tú)" : ""}
                        </strong>
                        <small>
                          {m.role === "host"
                            ? "Anfitrión"
                            : m.role === "moderator"
                              ? "Moderador"
                              : "Participante"}{" "}
                          · {m.online ? "Conectado" : "Ausente"}
                        </small>
                      </div>
                      {m.handRaised && (
                        <Hand size={18} className="raised-hand" />
                      )}
                      {manage &&
                        m.userId !== user?.uid &&
                        m.role !== "host" &&
                        (isHost || m.role === "participant") && (
                          <details className="member-actions">
                            <summary
                              aria-label={`Acciones para ${m.displayName}`}
                            >
                              •••
                            </summary>
                            <div>
                              {isHost && (
                                <button
                                  onClick={() =>
                                    void memberAction(
                                      m,
                                      m.role === "moderator"
                                        ? "demote"
                                        : "promote",
                                    )
                                  }
                                >
                                  {m.role === "moderator"
                                    ? "Quitar moderación"
                                    : "Hacer moderador"}
                                </button>
                              )}
                              <button
                                onClick={() => void memberAction(m, "kick")}
                              >
                                Retirar de la sala
                              </button>
                            </div>
                          </details>
                        )}
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === "documents" && (
              <>
                <div className="panel-heading">
                  <h2>Material compartido</h2>
                  <span>Un mismo punto de partida</span>
                </div>
                <div className="panel-padding">
                  <ErrorBox
                    message={documentsError ? errorText(documentsError) : ""}
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    className="sr-only"
                    accept="application/pdf,text/plain,text/markdown,image/png,image/jpeg,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                    onChange={(e) => {
                      void upload(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <button
                    className="button secondary full"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={17} />
                    Compartir archivo
                  </button>
                  <p className="muted small-text">
                    PDF, Word, texto o imágenes · hasta 10 MB por archivo
                  </p>
                  {documents.length === 0 ? (
                    <Empty title="Un espacio para tus recursos">
                      Comparte el material que van a estudiar.
                    </Empty>
                  ) : (
                    documents.map((doc) => (
                      <article className="document-row" key={doc.id}>
                        <span className="file-icon">
                          <FileText size={22} />
                        </span>
                        <div>
                          <strong>{doc.name}</strong>
                          <small>{prettyBytes(doc.size)}</small>
                          <button
                            className="text-button"
                            onClick={() => void openDocument(doc)}
                          >
                            Ver documento
                            <ExternalLink size={12} />
                          </button>
                        </div>
                        {(manage || doc.uploadedBy === user?.uid) && (
                          <button
                            className="icon-button"
                            aria-label={`Eliminar ${doc.name}`}
                            onClick={() =>
                              void action(async () => {
                                await api(
                                  `/rooms/${id}/documents/${doc.id}`,
                                  json("DELETE"),
                                );
                                await refetchDocuments();
                              })
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </>
            )}
            {tab === "notes" && (
              <div className="notes-panel">
                <div className="panel-heading">
                  <h2>Mis notas</h2>
                  <span>Solo tú puedes verlas</span>
                </div>
                <textarea
                  aria-label="Mis notas privadas"
                  disabled={!notesLoaded}
                  value={notes}
                  maxLength={30000}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setNoteSaved(false);
                  }}
                  placeholder="Anota esa idea que no quieres perder…"
                />
                {!notesLoaded && (
                  <div className="panel-padding">
                    <p className="muted">Cargando tus notas guardadas…</p>
                    <button
                      className="text-button"
                      onClick={() =>
                        void api<{ text: string }>(`/rooms/${id}/notes`)
                          .then((n) => {
                            setNotes(n.text || "");
                            setNotesLoaded(true);
                            setNoteSaved(true);
                          })
                          .catch((e) => setError(errorText(e)))
                      }
                    >
                      Reintentar carga
                    </button>
                  </div>
                )}
                <div className="notes-footer">
                  <span>
                    {notesLoaded && noteSaved ? (
                      <>
                        <Check size={14} />
                        Guardado
                      </>
                    ) : notesLoaded ? (
                      "Cambios sin guardar"
                    ) : (
                      "Cargando…"
                    )}
                  </span>
                  <button
                    className="button primary"
                    disabled={noteBusy || noteSaved}
                    onClick={() => void saveNotes()}
                  >
                    {noteBusy ? "Guardando…" : "Guardar notas"}
                  </button>
                </div>
              </div>
            )}
            {tab === "transcription" && <TranscriptionPanel {...transcription} />}
            {tab === "ai" && (
              <AIPanel
                roomId={id!}
                documents={documents}
                jobs={jobs}
                onJob={upsertJob}
              />
            )}
          </div>
        </aside>
      </div>
      {edit && (
        <RoomForm
          room={room}
          onClose={() => setEdit(false)}
          onSaved={(r) => {
            updateRoom(r);
            setEdit(false);
            toast("Sala actualizada");
          }}
        />
      )}
      {confirm && (
        <Modal
          title={
            confirm === "close"
              ? "¿Finalizar la sesión?"
              : confirm === "cancel"
                ? "¿Cancelar esta sala?"
                : "¿Salir de la sala?"
          }
          onClose={() => setConfirm(null)}
        >
          <p>
            {confirm === "close"
              ? "El grupo saldrá de la sala. La sesión se guardará en el historial y podrás consultar su reporte y hacer preguntas sobre lo compartido."
              : confirm === "cancel"
                ? "La sala programada quedará cancelada y los participantes ya no podrán entrar."
                : "Se desconectarán tu cámara y micrófono. Tus notas se guardarán antes de salir."}
          </p>
          <div className="form-actions">
            <button
              className="button secondary"
              onClick={() => setConfirm(null)}
            >
              Continuar aquí
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={() => void finish()}
            >
              {busy
                ? "Un momento…"
                : confirm === "close"
                  ? "Finalizar sesión"
                  : confirm === "cancel"
                    ? "Cancelar sala"
                    : "Salir de la sala"}
            </button>
          </div>
        </Modal>
      )}
      {invite && (
        <Modal
          title="Aprender juntos empieza con una invitación"
          onClose={() => setInvite("")}
        >
          <p>
            Comparte este enlace con tu grupo. El acceso sigue sujeto a las
            plazas y a los permisos de la sala.
          </p>
          <label>
            Enlace de invitación
            <input
              readOnly
              value={invite}
              onFocus={(e) => e.currentTarget.select()}
            />
          </label>
          <button
            className="button primary full"
            onClick={() =>
              void navigator.clipboard
                .writeText(invite)
                .then(() => toast("Enlace copiado"))
                .catch(() =>
                  setError("Selecciona el enlace para copiarlo manualmente."),
                )
            }
          >
            <Link2 size={17} />
            Copiar enlace
          </button>
        </Modal>
      )}
      {documentPreview && (
        <Modal
          title={documentPreview.doc.name}
          onClose={() => {
            previewRequest.current++;
            setDocumentPreview(null);
          }}
        >
          <div className="document-preview-shell">
            {(documentPreview.status === "requesting" || documentPreview.status === "loading") && (
              <div className="document-preview-loading">
                <Spinner label="Cargando archivo…" />
              </div>
            )}
            {documentPreview.status === "error" && (
              <ErrorBox message={documentPreview.error} retry={() => void openDocument(documentPreview.doc)} />
            )}
            {documentPreview.url && (documentPreview.doc.mimeType.startsWith("image/") ? (
              <img
                className="document-image"
                src={documentPreview.url}
                alt={documentPreview.doc.name}
                style={{ visibility: documentPreview.status === "ready" ? "visible" : "hidden" }}
                onLoad={() => setDocumentPreview((current) => current && current.url === documentPreview.url ? { ...current, status: "ready" } : current)}
                onError={() => setDocumentPreview((current) => current && current.url === documentPreview.url ? { ...current, status: "error", error: "No se pudo mostrar la imagen. Ábrela directamente." } : current)}
              />
            ) : (
              <iframe
                className="document-preview"
                title={documentPreview.doc.name}
                src={documentPreview.url}
                sandbox="allow-same-origin"
                style={{ visibility: documentPreview.status === "ready" ? "visible" : "hidden" }}
                onLoad={() => setDocumentPreview((current) => current && current.url === documentPreview.url ? { ...current, status: "ready" } : current)}
                onError={() => setDocumentPreview((current) => current && current.url === documentPreview.url ? { ...current, status: "error", error: "No se pudo mostrar la vista previa. Abre el archivo directamente." } : current)}
              />
            ))}
          </div>
          {documentPreview.url && (
            <a className="button secondary" href={documentPreview.url} target="_blank" rel="noreferrer">
              Abrir archivo
              <ExternalLink size={16} />
            </a>
          )}
        </Modal>
      )}
    </div>
  );
}
