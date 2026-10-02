import { useMemo, useState } from "react";
import { AudioLines, Mic, Search, Square, Users } from "lucide-react";
import type { TranscriptSegment, TranscriptionState } from "./types";
import { Badge, Empty, ErrorBox, initials } from "./ui";
import { reportSourceAnchor } from "./report-sources";
import { useSourceNavigation } from "./source-text";

export const elapsedTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
};
export function TranscriptList({ segments, searchable = false }: { segments: TranscriptSegment[]; searchable?: boolean }) {
  const [search, setSearch] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [limit, setLimit] = useState(100);
  const ordered = useMemo(() => [...segments].sort((a, b) => a.startMs - b.startMs || a.id.localeCompare(b.id)), [segments]);
  const filtered = useMemo(() => ordered.filter((segment) =>
    (!speaker || segment.speakerId === speaker) &&
    `${segment.speakerName} ${segment.text}`.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es")),
  ), [ordered, speaker, search]);
  useSourceNavigation("transcripcion", ordered.map((segment) => segment.id), (index) => { setSearch(""); setSpeaker(""); setLimit((value) => Math.max(value, index + 1)); });
  const speakers = [...new Map(segments.map((segment) => [segment.speakerId, segment.speakerName])).entries()];
  return <>
    {searchable && <div className="transcript-filters">
      <label className="search-field"><Search size={16} /><input aria-label="Buscar en la transcripción" placeholder="Buscar palabras…" value={search} onChange={(event) => { setSearch(event.target.value); setLimit(100); }} /></label>
      <label><span className="sr-only">Filtrar por participante</span><select aria-label="Filtrar transcripción por participante" value={speaker} onChange={(event) => { setSpeaker(event.target.value); setLimit(100); }}><option value="">Todos los participantes</option>{speakers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
    </div>}
    {filtered.length ? <ol className="transcript-list">{filtered.slice(0, limit).map((segment) => <li key={segment.id} id={reportSourceAnchor("transcripcion", segment.id)} tabIndex={-1}>
      <span className="avatar transcript-avatar">{initials(segment.speakerName)}</span>
      <div><div className="transcript-byline"><strong>{segment.speakerName}</strong><time title={`Desde ${elapsedTime(segment.startMs)} hasta ${elapsedTime(segment.endMs)}`}>{elapsedTime(segment.startMs)}</time></div><p className="preserve-lines">{segment.text}</p></div>
    </li>)}</ol> : <Empty title={search || speaker ? "No hay coincidencias" : "Aún no hay palabras registradas"}>{search || speaker ? "Prueba otra búsqueda o participante." : "Aquí aparecerá la voz que los participantes autoricen a transcribir."}</Empty>}
    {filtered.length > limit && <button className="button secondary" onClick={() => setLimit((value) => value + 100)}>Mostrar más intervenciones ({filtered.length - limit} restantes)</button>}
  </>;
}
export function CoverageNotice({ data }: { data?: TranscriptionState }) {
  const coverage = data?.coverage;
  return <div className="transcription-coverage" role="status">
    <AudioLines size={18} /><div><strong>{coverage?.pendingBatches ? "Hay voz pendiente de transcribir" : coverage?.failedBatches ? "Hay fragmentos que no se pudieron transcribir" : "Registro de voz autorizado"}</strong><p>Se conserva el texto reconocido, separado del resumen de IA. Solo se registra la voz de quien activa su transcripción con el micrófono encendido; los silencios se omiten. El reconocimiento puede contener errores y no recupera conversaciones anteriores.</p>
    {coverage && <small>{new Set(data?.segments.map((segment) => segment.speakerId)).size} de {coverage.totalParticipants} participantes tienen voz registrada{coverage.pendingBatches ? ` · ${coverage.pendingBatches} fragmentos pendientes` : ""}{coverage.failedBatches ? ` · ${coverage.failedBatches} fragmentos no disponibles` : ""}</small>}</div>
  </div>;
}
export function TranscriptionPanel({ data, enabled, recording, busy, busyLabel, pending, error, toggle }: {
  data?: TranscriptionState; enabled: boolean; recording: boolean; busy: boolean; busyLabel: string; pending: number; error: string; toggle: () => Promise<void>;
}) {
  return <div className="transcription-panel">
    <div className="panel-intro"><span className="assistant-icon"><AudioLines size={25} /></span><h3>Las ideas también se escuchan</h3><p>Guarda lo que dices para volver a ello en el reporte de esta sesión.</p></div>
    <button className={`button ${enabled ? "secondary" : "primary"}`} onClick={() => void toggle()} disabled={busy} aria-pressed={enabled}>{enabled ? <Square size={16} /> : <Mic size={17} />}{busy ? busyLabel : enabled ? "Dejar de transcribir mi voz" : "Transcribir mi voz"}</button>
    <p className="transcription-status" role="status"><span className={`live-dot ${recording ? "recording" : ""}`} />{recording ? "Escuchando tu micrófono" : enabled ? "Conecta la llamada y enciende tu micrófono para comenzar" : "Tu voz no se está capturando"}{pending > 0 && ` · ${pending} fragmentos en proceso`}</p>
    <ErrorBox message={error} />
    <CoverageNotice data={data} />
    {!!data?.participants?.length && <details className="context-settings"><summary><Users size={16} /> Voz de los participantes</summary><ul className="transcription-participants">{data.participants.map((person) => <li key={person.userId}><span>{person.displayName}</span><Badge tone={person.enabled ? "green" : ""}>{person.enabled ? "Autorizada" : "Sin autorizar"}</Badge></li>)}</ul></details>}
    <TranscriptList segments={data?.segments || []} />
  </div>;
}
