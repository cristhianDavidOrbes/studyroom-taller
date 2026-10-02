import { useEffect, useRef, useState } from "react";
import { canonicalSource, citationParts, reportSourceAnchor, type ReportSourceKind, type ReportSourceMap } from "./report-sources";

const navigationEvent = "studyroom:report-source";

export function SourceText({ text, result, sourceMap, pending = false }: { text: string; result?: unknown; sourceMap?: ReportSourceMap; pending?: boolean }) {
  return <>{citationParts(text, result, sourceMap, pending).map((part, index) => "text" in part ? part.text : "source" in part ? <a key={index} className="ai-source" href={`#${part.source.anchorId}`} title="Ver origen en este reporte" onClick={() => window.dispatchEvent(new CustomEvent(navigationEvent, { detail: { key: part.source.key } }))}>{part.source.label}</a> : "label" in part ? <span key={index} className="ai-source">{part.label}</span> : <span key={index} className="ai-source unavailable" title={part.unavailable === "pending" ? "El origen estará disponible al terminar la respuesta." : "El origen no forma parte de las fuentes disponibles de este reporte."}>{part.unavailable === "pending" ? "Referencia en preparación" : "Referencia no disponible"}</span>)}</>;
}

export function useSourceNavigation(kind: ReportSourceKind, ids: string[], reveal: (index: number) => void) {
  const revealCurrent = useRef(reveal);
  revealCurrent.current = reveal;
  const [target, setTarget] = useState<{ id: string } | null>(null);
  useEffect(() => {
    const navigate = (event: Event) => {
      const key = (event as CustomEvent<{ key?: unknown }>).detail?.key;
      const canonical = typeof key === "string" ? canonicalSource(key) : null;
      if (!canonical?.startsWith(`${kind}:`)) return;
      const id = canonical.slice(kind.length + 1), index = ids.indexOf(id);
      if (index < 0) return;
      revealCurrent.current(index);
      setTarget({ id });
    };
    window.addEventListener(navigationEvent, navigate);
    return () => window.removeEventListener(navigationEvent, navigate);
  }, [kind, ids]);
  useEffect(() => {
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      const anchorId = reportSourceAnchor(kind, target.id), element = anchorId ? window.document.getElementById(anchorId) : null;
      element?.scrollIntoView({ block: "center", behavior: "smooth" });
      element?.focus({ preventScroll: true });
      setTarget(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [kind, target]);
}
