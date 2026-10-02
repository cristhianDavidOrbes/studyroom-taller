import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Room,
  RoomEvent,
  Track,
  VideoPresets,
  ConnectionState,
  type Participant,
  type RemoteTrack,
  type LocalTrack,
  type TrackPublication,
} from "livekit-client";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  MousePointer2,
  Pencil,
  Trash2,
  Settings2,
  Video,
  Volume2,
  Download,
  Wifi,
} from "lucide-react";
import { api, errorText, json } from "./api";
import { contentBox, normalizedPoint, type Box } from "./annotations";
import type { Annotation } from "./types";
import { ErrorBox, initials } from "./ui";
interface TrackView {
  participant: Participant;
  publication: TrackPublication;
  track: RemoteTrack | LocalTrack;
}
function TrackElement({
  track,
  muted = false,
  screen = false,
  onVideo,
}: {
  track: RemoteTrack | LocalTrack;
  muted?: boolean;
  screen?: boolean;
  onVideo?: (video: HTMLVideoElement | null) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null),
    onVideoRef = useRef(onVideo);
  onVideoRef.current = onVideo;
  useEffect(() => {
    const element = ref.current;
    if (element) {
      track.attach(element);
      onVideoRef.current?.(element);
    }
    return () => {
      if (element) track.detach(element);
      onVideoRef.current?.(null);
    };
  }, [track]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={screen ? "screen-video" : "camera-video"}
    />
  );
}
function AudioElement({ track }: { track: RemoteTrack | LocalTrack }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) track.attach(el);
    return () => {
      if (el) track.detach(el);
    };
  }, [track]);
  return <audio ref={ref} autoPlay />;
}
function SharedScreen({
  view,
  annotations,
  tool,
  color,
  onAnnotation,
}: {
  view: TrackView;
  annotations: Annotation[];
  tool: "off" | "point" | "stroke";
  color: string;
  onAnnotation: (a: Annotation) => Promise<void>;
}) {
  const container = useRef<HTMLDivElement>(null),
    video = useRef<HTMLVideoElement | null>(null),
    points = useRef<{ x: number; y: number }[]>([]);
  const [box, setBox] = useState<Box>({ left: 0, top: 0, width: 0, height: 0 }),
    [draft, setDraft] = useState<{ x: number; y: number }[]>([]),
    [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const [error, setError] = useState("");
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    function measure() {
      const r = el!.getBoundingClientRect();
      setBox(
        contentBox(
          { left: 0, top: 0, width: r.width, height: r.height },
          video.current?.videoWidth || 16,
          video.current?.videoHeight || 9,
        ),
      );
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const timer = setInterval(measure, 1000);
    measure();
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [view.publication.trackSid]);
  const screenId = view.publication.trackSid;
  async function send(a: Annotation) {
    try {
      setError("");
      await onAnnotation(a);
    } catch (e) {
      setError(errorText(e));
    }
  }
  function point(e: ReactPointerEvent) {
    const r = container.current!.getBoundingClientRect();
    return normalizedPoint(e.clientX - r.left, e.clientY - r.top, box);
  }
  function down(e: ReactPointerEvent<HTMLDivElement>) {
    if (tool === "off") return;
    const p = point(e);
    if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    points.current = [p];
    setDraft([p]);
    if (tool === "point") void send({ action: "point", screenId, ...p, color });
  }
  function move(e: ReactPointerEvent) {
    if (tool !== "stroke" || !points.current.length) return;
    const p = point(e);
    if (p && points.current.length < 100) {
      points.current.push(p);
      setDraft([...points.current]);
    }
  }
  function up() {
    if (tool === "stroke" && points.current.length > 1)
      void send({ action: "stroke", screenId, points: points.current, color });
    points.current = [];
    setDraft([]);
  }
  return (
    <div className="shared-screen-wrap">
      <div className="screen-label">
        <MonitorUp size={15} />
        {view.participant.name || view.participant.identity} está compartiendo
        pantalla
      </div>
      <div
        className={`shared-screen ${tool !== "off" ? "annotating" : ""}`}
        ref={container}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => {
          points.current = [];
          setDraft([]);
        }}
        tabIndex={tool === "off" ? -1 : 0}
        role={tool === "off" ? undefined : "application"}
        aria-label={
          tool === "off"
            ? "Pantalla compartida"
            : "Señalar pantalla: usa flechas para mover el cursor y Enter para compartir la señal"
        }
        onKeyDown={(e) => {
          if (tool === "off") return;
          const delta = e.shiftKey ? 0.1 : 0.02;
          if (
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            setCursor((p) => ({
              x: Math.min(
                1,
                Math.max(
                  0,
                  p.x +
                    (e.key === "ArrowRight"
                      ? delta
                      : e.key === "ArrowLeft"
                        ? -delta
                        : 0),
                ),
              ),
              y: Math.min(
                1,
                Math.max(
                  0,
                  p.y +
                    (e.key === "ArrowDown"
                      ? delta
                      : e.key === "ArrowUp"
                        ? -delta
                        : 0),
                ),
              ),
            }));
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            void send({ action: "point", screenId, ...cursor, color });
          }
        }}
      >
        <TrackElement
          track={view.track}
          screen
          muted={view.participant.isLocal}
          onVideo={(v) => {
            video.current = v;
          }}
        />
        <svg
          aria-hidden="true"
          className="annotation-overlay"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          style={{
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
          }}
        >
          {annotations
            .filter((a) => a.screenId === screenId)
            .map((a, i) =>
              a.action === "point" ? (
                <g key={a.id || i}>
                  <circle
                    cx={(a.x || 0) * 1000}
                    cy={(a.y || 0) * 1000}
                    r={12}
                    fill={a.color || "#f6bf4f"}
                    stroke="white"
                    strokeWidth={3}
                  />
                </g>
              ) : (
                a.points && (
                  <polyline
                    key={a.id || i}
                    points={a.points
                      .map((p) => `${p.x * 1000},${p.y * 1000}`)
                      .join(" ")}
                    stroke={a.color || "#f6bf4f"}
                    strokeWidth={4}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )
              ),
            )}
          {draft.length > 1 && (
            <polyline
              points={draft.map((p) => `${p.x * 1000},${p.y * 1000}`).join(" ")}
              stroke={color}
              strokeWidth={4}
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
          )}
          {tool !== "off" && (
            <circle
              className="keyboard-cursor"
              cx={cursor.x * 1000}
              cy={cursor.y * 1000}
              r={13}
              fill="none"
              stroke={color}
              strokeDasharray="5 5"
              strokeWidth={3}
            />
          )}
        </svg>
      </div>
      {tool !== "off" && (
        <small className="annotation-hint">
          Tus señales son visibles para todos. También puedes usar flechas y
          Enter.
        </small>
      )}
      <ErrorBox message={error} />
    </div>
  );
}
export function MediaStage({
  roomId,
  role,
  annotations,
  onAnnotation,
  collaborationConnected,
}: {
  roomId: string;
  role?: string;
  annotations: Annotation[];
  onAnnotation: (a: Annotation) => Promise<void>;
  collaborationConnected: boolean;
}) {
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h540.resolution,
          frameRate: 24,
        },
        publishDefaults: {
          simulcast: true,
          videoCodec: "vp8",
          videoEncoding: { maxBitrate: 1000000, maxFramerate: 24 },
          screenShareEncoding: { maxBitrate: 1600000, maxFramerate: 15 },
        },
      }),
  );
  const [version, refresh] = useState(0),
    [state, setState] = useState<ConnectionState>(ConnectionState.Disconnected),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [menu, setMenu] = useState(false),
    [devicesOpen, setDevicesOpen] = useState(false),
    [devices, setDevices] = useState<MediaDeviceInfo[]>([]),
    [tool, setTool] = useState<"off" | "point" | "stroke">("off"),
    [color, setColor] = useState("#f6bf4f"),
    [audioOnly, setAudioOnly] = useState(false),
    [selectedScreen, setSelectedScreen] = useState("");
  const stats = useRef<unknown[]>([]);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => refresh((x) => x + 1);
    const events = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
      RoomEvent.ConnectionQualityChanged,
    ];
    events.forEach((e) => room.on(e, update));
    room.on(RoomEvent.ConnectionStateChanged, setState);
    room.on(RoomEvent.MediaDevicesError, (e) =>
      setError(`No se pudo acceder al dispositivo: ${errorText(e)}`),
    );
    return () => {
      room.removeAllListeners();
      void room.disconnect();
    };
  }, [room]);
  useEffect(() => {
    if (!devicesOpen) return;
    Room.getLocalDevices()
      .then(setDevices)
      .catch((e) => setError(errorText(e)));
  }, [devicesOpen]);
  useEffect(() => {
    if (state !== ConnectionState.Connected) return;
    const id = setInterval(async () => {
      const samples: unknown[] = [];
      for (const p of [
        room.localParticipant,
        ...room.remoteParticipants.values(),
      ])
        for (const pub of p.trackPublications.values()) {
          if (!pub.track) continue;
          try {
            const report = await pub.track.getRTCStatsReport();
            report?.forEach((s) => {
              if (
                ["inbound-rtp", "outbound-rtp", "candidate-pair"].includes(
                  s.type,
                )
              )
                samples.push({
                  type: s.type,
                  kind: s.kind,
                  bytesReceived: s.bytesReceived,
                  bytesSent: s.bytesSent,
                  packetsLost: s.packetsLost,
                  jitter: s.jitter,
                  framesDecoded: s.framesDecoded,
                  freezeCount: s.freezeCount,
                  totalFreezesDuration: s.totalFreezesDuration,
                  currentRoundTripTime: s.currentRoundTripTime,
                  state: s.state,
                });
            });
          } catch {}
        }
      stats.current.push({ at: new Date().toISOString(), samples });
      if (stats.current.length > 1500) stats.current.shift();
    }, 5000);
    return () => clearInterval(id);
  }, [room, state]);
  const participants = [
    room.localParticipant,
    ...room.remoteParticipants.values(),
  ];
  const all: TrackView[] = participants.flatMap((participant) =>
    [...participant.trackPublications.values()]
      .filter((p) => p.track && !p.isMuted)
      .map((publication) => ({
        participant,
        publication,
        track: publication.track!,
      })),
  );
  const screens = all
      .filter((t) => t.publication.source === Track.Source.ScreenShare)
      .sort((a, b) =>
        a.publication.trackSid.localeCompare(b.publication.trackSid),
      ),
    screen =
      screens.find((s) => s.publication.trackSid === selectedScreen) ||
      screens[0];
  useEffect(() => {
    if (!audioOnly) return;
    for (const participant of room.remoteParticipants.values()) {
      for (const publication of participant.videoTrackPublications.values()) {
        if (publication.isSubscribed) publication.setSubscribed(false);
      }
    }
  }, [audioOnly, room, version]);
  const canAnnotate =
    collaborationConnected &&
    !!screen &&
    (screen.participant.isLocal || role === "host" || role === "moderator");
  useEffect(() => {
    if (!canAnnotate) setTool("off");
  }, [canAnnotate, screen?.publication.trackSid]);
  async function connect() {
    setBusy(true);
    setError("");
    try {
      const response = await api<{ token: string; url: string }>(
        `/rooms/${roomId}/media/token`,
        json("POST"),
      );
      await room.connect(response.url, response.token);
      setState(room.state);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function change(fn: () => Promise<unknown>) {
    try {
      setError("");
      await fn();
      refresh((x) => x + 1);
    } catch (e) {
      setError(errorText(e));
    }
  }
  function exportStats() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            roomId,
            exportedAt: new Date().toISOString(),
            intervalMs: 5000,
            samples: stats.current,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studyroom-calidad-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="media-stage" ref={container}>
      <div className="media-topline">
        <span>
          <Video size={16} />
          Espacio de encuentro
        </span>
        <span
          className={`connection-pill ${state === "connected" ? "connected" : ""}`}
        >
          <Wifi size={13} />
          {state === "connected"
            ? "Conectado"
            : state === "reconnecting" || state === "signalReconnecting"
              ? "Reconectando…"
              : state === "connecting"
                ? "Conectando…"
                : "Cámara y audio sin conectar"}
        </span>
      </div>
      <ErrorBox message={error} />
      {screens.length > 1 && (
        <label className="screen-picker">
          Pantalla que estás viendo
          <select
            value={screen?.publication.trackSid}
            onChange={(e) => {
              setTool("off");
              setSelectedScreen(e.target.value);
            }}
          >
            {screens.map((source) => (
              <option
                value={source.publication.trackSid}
                key={source.publication.trackSid}
              >
                {source.participant.name || source.participant.identity}
              </option>
            ))}
          </select>
        </label>
      )}
      {screen && (
        <SharedScreen
          view={screen}
          annotations={annotations}
          tool={canAnnotate ? tool : "off"}
          color={color}
          onAnnotation={onAnnotation}
        />
      )}
      <div className={`camera-grid ${screen ? "compact" : ""}`}>
        {state === ConnectionState.Disconnected ? (
          <div className="media-welcome">
            <div className="media-welcome-icon">
              <Video size={35} strokeWidth={1.5} />
            </div>
            <h2>Un buen lugar para pensar juntos</h2>
            <p>
              Conecta el audio y el video cuando estés listo.
              <br />
              Tú decides cuándo activar la cámara y el micrófono.
            </p>
            <button
              className="button primary"
              onClick={() => void connect()}
              disabled={busy}
            >
              {busy ? "Conectando…" : "Conectar videollamada"}
            </button>
          </div>
        ) : (
          participants.map((p) => {
            const camera = all.find(
              (v) =>
                v.participant.identity === p.identity &&
                v.publication.source === Track.Source.Camera,
            );
            return (
              <div className="camera-tile" key={p.identity || "self"}>
                {camera ? (
                  <TrackElement track={camera.track} muted={p.isLocal} />
                ) : (
                  <div className="camera-placeholder">
                    <span className="video-avatar">
                      {initials(p.name || "Tú")}
                    </span>
                    <small>Cámara apagada</small>
                  </div>
                )}
                <div className="participant-caption">
                  <span>
                    {p.name || p.identity || "Tú"}
                    {p.isLocal ? " (tú)" : ""}
                  </span>
                  {p.isMicrophoneEnabled ? (
                    <Mic size={14} />
                  ) : (
                    <MicOff size={14} />
                  )}
                </div>
                {p.isLocal && (
                  <div className="camera-menu">
                    <button
                      className="icon-button"
                      aria-label="Herramientas de señalamiento"
                      aria-expanded={menu}
                      onClick={() => setMenu(!menu)}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {menu && (
                      <div
                        className="camera-tools"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setMenu(false);
                        }}
                      >
                        <strong>Señalar en pantalla</strong>
                        <p>
                          {!screen
                            ? "Comparte pantalla para activar las herramientas."
                            : canAnnotate
                              ? "Las señales se comparten con la sala."
                              : "Puede señalar quien comparte y quien modera."}
                        </p>
                        <button
                          disabled={!canAnnotate}
                          aria-pressed={tool === "point"}
                          onClick={() =>
                            setTool(tool === "point" ? "off" : "point")
                          }
                        >
                          <MousePointer2 size={16} />
                          Puntero
                        </button>
                        <button
                          disabled={!canAnnotate}
                          aria-pressed={tool === "stroke"}
                          onClick={() =>
                            setTool(tool === "stroke" ? "off" : "stroke")
                          }
                        >
                          <Pencil size={16} />
                          Lápiz
                        </button>
                        <label>
                          Color
                          <input
                            type="color"
                            aria-label="Color del señalamiento"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                          />
                        </label>
                        <button
                          disabled={!canAnnotate}
                          onClick={() => {
                            setTool("off");
                            void change(() =>
                              onAnnotation({
                                action: "clear",
                                screenId: screen!.publication.trackSid,
                              }),
                            );
                          }}
                        >
                          <Trash2 size={16} />
                          Borrar señales
                        </button>
                        <button
                          onClick={() => {
                            setTool("off");
                            setMenu(false);
                          }}
                        >
                          Desactivar herramientas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {all
        .filter(
          (v) => v.track.kind === Track.Kind.Audio && !v.participant.isLocal,
        )
        .map((v) => (
          <AudioElement key={v.publication.trackSid} track={v.track} />
        ))}
      {state !== ConnectionState.Disconnected && (
        <>
          <div className="media-controls">
            <button
              className={`control ${room.localParticipant.isMicrophoneEnabled ? "on" : ""}`}
              onClick={() =>
                void change(() =>
                  room.localParticipant.setMicrophoneEnabled(
                    !room.localParticipant.isMicrophoneEnabled,
                  ),
                )
              }
              aria-label={
                room.localParticipant.isMicrophoneEnabled
                  ? "Silenciar micrófono"
                  : "Activar micrófono"
              }
            >
              {room.localParticipant.isMicrophoneEnabled ? (
                <Mic size={20} />
              ) : (
                <MicOff size={20} />
              )}
              <span>Micrófono</span>
            </button>
            <button
              className={`control ${room.localParticipant.isCameraEnabled ? "on" : ""}`}
              onClick={() =>
                void change(() =>
                  room.localParticipant.setCameraEnabled(
                    !room.localParticipant.isCameraEnabled,
                  ),
                )
              }
              aria-label={
                room.localParticipant.isCameraEnabled
                  ? "Apagar cámara"
                  : "Activar cámara"
              }
            >
              {room.localParticipant.isCameraEnabled ? (
                <Camera size={20} />
              ) : (
                <CameraOff size={20} />
              )}
              <span>Cámara</span>
            </button>
            <button
              className={`control ${room.localParticipant.isScreenShareEnabled ? "on" : ""}`}
              onClick={() =>
                void change(() =>
                  room.localParticipant.setScreenShareEnabled(
                    !room.localParticipant.isScreenShareEnabled,
                    {
                      resolution: { width: 1280, height: 720, frameRate: 15 },
                      audio: true,
                    },
                  ),
                )
              }
              aria-label={
                room.localParticipant.isScreenShareEnabled
                  ? "Dejar de compartir pantalla"
                  : "Compartir pantalla"
              }
            >
              <MonitorUp size={20} />
              <span>Pantalla</span>
            </button>
            <button
              className="control"
              aria-pressed={audioOnly}
              onClick={() =>
                void change(async () => {
                  const next = !audioOnly;
                  if (next) await room.localParticipant.setCameraEnabled(false);
                  for (const p of room.remoteParticipants.values())
                    for (const pub of p.videoTrackPublications.values())
                      pub.setSubscribed(!next);
                  setAudioOnly(next);
                })
              }
            >
              <Volume2 size={20} />
              <span>{audioOnly ? "Ver videos" : "Solo audio"}</span>
            </button>
            <button
              className="control"
              onClick={() => setDevicesOpen(!devicesOpen)}
              aria-expanded={devicesOpen}
            >
              <Settings2 size={20} />
              <span>Dispositivos</span>
            </button>
          </div>
          {!room.canPlaybackAudio && (
            <button
              className="button secondary"
              onClick={() => void room.startAudio()}
            >
              Permitir reproducción de audio
            </button>
          )}
          {devicesOpen && (
            <div className="device-settings">
              {(["audioinput", "videoinput", "audiooutput"] as const).map(
                (kind) => (
                  <label key={kind}>
                    {kind === "audioinput"
                      ? "Micrófono"
                      : kind === "videoinput"
                        ? "Cámara"
                        : "Altavoz"}
                    <select
                      aria-label={kind}
                      onChange={(e) =>
                        void change(() =>
                          room.switchActiveDevice(kind, e.target.value),
                        )
                      }
                      defaultValue={room.getActiveDevice(kind)}
                    >
                      {devices
                        .filter((d) => d.kind === kind)
                        .map((d, i) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Dispositivo ${i + 1}`}
                          </option>
                        ))}
                    </select>
                  </label>
                ),
              )}
              <button className="text-button" onClick={exportStats}>
                <Download size={15} />
                Descargar mediciones de esta llamada
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
