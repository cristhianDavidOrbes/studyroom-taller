import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  VideoPresets,
  ConnectionState,
} from "livekit-client";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MonitorUp,
  Settings2,
  Video,
  Volume2,
  Download,
  Wifi,
} from "lucide-react";
import { api, errorText, json } from "./api";
import { TrackElement, AudioElement, type TrackView } from "./media-elements";
import { ErrorBox, initials } from "./ui";
export function MediaStage({
  roomId,
  onMicrophone,
}: {
  roomId: string;
  onMicrophone?: (track: MediaStreamTrack | null) => void;
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
    [devicesOpen, setDevicesOpen] = useState(false),
    [devices, setDevices] = useState<MediaDeviceInfo[]>([]),
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
      RoomEvent.ActiveDeviceChanged,
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
  const localMicrophone = all.find((source) => source.participant.isLocal && source.publication.source === Track.Source.Microphone)?.track.mediaStreamTrack;
  useEffect(() => {
    onMicrophone?.(state === ConnectionState.Connected ? localMicrophone || null : null);
    return () => onMicrophone?.(null);
  }, [localMicrophone, state, onMicrophone]);
  useEffect(() => {
    if (!audioOnly) return;
    for (const participant of room.remoteParticipants.values()) {
      for (const publication of participant.videoTrackPublications.values()) {
        if (publication.isSubscribed) publication.setSubscribed(false);
      }
    }
  }, [audioOnly, room, version]);
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
            onChange={(e) => setSelectedScreen(e.target.value)}
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
      {screen && <div className="shared-screen"><TrackElement track={screen.track} screen muted={screen.participant.isLocal} /></div>}
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
