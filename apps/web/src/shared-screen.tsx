import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { MonitorUp } from "lucide-react";
import {
  contentBox,
  drawingHeight,
  normalizedPoint,
  topAnnotationAt,
  type Box,
  type DrawingTool,
  type Point,
} from "./annotations";
import { AnnotationGraphic } from "./annotation-graphic";
import { TrackElement, type TrackView } from "./media-elements";
import type { Annotation } from "./types";
import { ErrorBox } from "./ui";
import { errorText } from "./api";

export function SharedScreen({
  view,
  annotations,
  tool,
  color,
  strokeWidth,
  fontSize,
  text,
  onAnnotation,
}: {
  view: TrackView;
  annotations: Annotation[];
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  text: string;
  onAnnotation: (a: Annotation) => Promise<void>;
}) {
  const container = useRef<HTMLDivElement>(null),
    video = useRef<HTMLVideoElement | null>(null),
    points = useRef<Point[]>([]);
  const latestSend = useRef(0);
  const [box, setBox] = useState<Box>({ left: 0, top: 0, width: 0, height: 0 });
  const [draft, setDraft] = useState<Annotation | null>(null),
    [cursor, setCursor] = useState<Point>({ x: 0.5, y: 0.5 });
  const [erasing, setErasing] = useState<string[]>([]),
    [error, setError] = useState("");
  const screenId = view.publication.trackSid,
    height = drawingHeight(box.width, box.height);
  useEffect(() => {
    points.current = [];
    setDraft(null);
    setError("");
  }, [screenId, tool]);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    function measure() {
      const rect = el!.getBoundingClientRect();
      setBox(
        contentBox(
          { left: 0, top: 0, width: rect.width, height: rect.height },
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
  }, [screenId]);

  function makeDrawing(list: Point[]): Annotation {
    return {
      action: tool === "off" ? "stroke" : tool,
      screenId,
      points: [...list],
      color,
      strokeWidth,
    };
  }
  async function send(a: Annotation) {
    const request = ++latestSend.current;
    try {
      setError("");
      await onAnnotation(a);
    } catch (e) {
      setError(errorText(e));
    } finally {
      if (request === latestSend.current) setDraft(null);
    }
  }
  async function eraseAt(p: Point) {
    const target = topAnnotationAt(
      annotations.filter((a) => !erasing.includes(a.id || "")),
      screenId,
      p,
      height,
      box.width ? 12000 / box.width : 12,
    );
    if (!target?.id) return;
    const id = target.id;
    setErasing((old) => [...old, id]);
    try {
      setError("");
      await onAnnotation({ action: "erase", screenId, targetIds: [id] });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setErasing((old) => old.filter((value) => value !== id));
    }
  }
  function place(p: Point) {
    if (tool === "erase") {
      void eraseAt(p);
      return;
    }
    if (tool === "point" || tool === "text") {
      if (tool === "text" && !text.trim()) {
        setError(
          "Escribe el texto en el menú de herramientas y después elige dónde colocarlo.",
        );
        return;
      }
      const a: Annotation = {
        action: tool,
        screenId,
        ...p,
        color,
        ...(tool === "text" ? { text: text.trim(), fontSize } : {}),
      };
      setDraft(a);
      void send(a);
    }
  }
  function point(event: ReactPointerEvent) {
    const rect = container.current!.getBoundingClientRect();
    return normalizedPoint(
      event.clientX - rect.left,
      event.clientY - rect.top,
      box,
    );
  }
  function down(event: ReactPointerEvent<HTMLDivElement>) {
    if (tool === "off" || event.button !== 0) return;
    const p = point(event);
    if (!p) return;
    event.preventDefault();
    event.currentTarget.focus();
    setCursor(p);
    if (["point", "text", "erase"].includes(tool)) {
      place(p);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    points.current = [p];
    setDraft(makeDrawing([p, p]));
  }
  function updateEnd(p: Point) {
    if (!points.current.length) return;
    if (tool === "stroke") {
      if (points.current.length < 200) points.current.push(p);
      else points.current[199] = p;
    } else points.current = [points.current[0], p];
    setDraft(makeDrawing(points.current));
  }
  function up(event?: ReactPointerEvent) {
    if (!points.current.length) return;
    if (event) {
      const p = point(event);
      if (p) updateEnd(p);
    }
    if (points.current.length > 1) void send(makeDrawing(points.current));
    else setDraft(null);
    points.current = [];
  }
  function cancel() {
    points.current = [];
    setDraft(null);
  }
  return (
    <div className="shared-screen-wrap">
      <div className="screen-label">
        <MonitorUp size={15} />
        {view.participant.name || view.participant.identity} está compartiendo
        pantalla
      </div>
      <div
        className={`shared-screen ${tool !== "off" ? "annotating" : ""} ${tool === "erase" ? "erasing" : ""}`}
        ref={container}
        onPointerDown={down}
        onPointerMove={(event) => {
          const p = point(event);
          if (p) updateEnd(p);
        }}
        onPointerUp={up}
        onPointerCancel={cancel}
        tabIndex={tool === "off" ? -1 : 0}
        role={tool === "off" ? undefined : "application"}
        aria-label={
          tool === "off"
            ? "Pantalla compartida"
            : "Señalar pantalla: usa flechas para mover el cursor y Enter para compartir la señal"
        }
        onKeyDown={(event) => {
          if (tool === "off") return;
          const delta = event.shiftKey ? 0.1 : 0.02;
          if (
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
              event.key,
            )
          ) {
            event.preventDefault();
            const next = {
              x: Math.min(
                1,
                Math.max(
                  0,
                  cursor.x +
                    (event.key === "ArrowRight"
                      ? delta
                      : event.key === "ArrowLeft"
                        ? -delta
                        : 0),
                ),
              ),
              y: Math.min(
                1,
                Math.max(
                  0,
                  cursor.y +
                    (event.key === "ArrowDown"
                      ? delta
                      : event.key === "ArrowUp"
                        ? -delta
                        : 0),
                ),
              ),
            };
            setCursor(next);
            updateEnd(next);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (["point", "text", "erase"].includes(tool)) place(cursor);
            else if (points.current.length) up();
            else {
              points.current = [cursor];
              setDraft(makeDrawing([cursor, cursor]));
            }
          } else if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }
        }}
      >
        <TrackElement
          track={view.track}
          screen
          muted={view.participant.isLocal}
          onVideo={(element) => {
            video.current = element;
          }}
        />
        <svg
          aria-hidden="true"
          className="annotation-overlay"
          viewBox={`0 0 1000 ${height}`}
          preserveAspectRatio="none"
          style={{
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
          }}
        >
          {annotations
            .filter(
              (a) => a.screenId === screenId && !erasing.includes(a.id || ""),
            )
            .map((a, index) => (
              <AnnotationGraphic
                key={a.id || index}
                annotation={a}
                height={height}
              />
            ))}
          {draft && <AnnotationGraphic annotation={draft} height={height} />}
          {tool !== "off" && (
            <circle
              className="keyboard-cursor"
              cx={cursor.x * 1000}
              cy={cursor.y * height}
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
          Sobre esta vista: las marcas se comparten con la sala.{" "}
          {tool === "erase"
            ? "Toca una marca para borrarla completa."
            : tool === "text"
              ? "Escribe en el menú y toca para colocar el texto."
              : "Arrastra para dibujar."}{" "}
          Con teclado: flechas para mover; Enter coloca o fija inicio y fin;
          Escape cancela.
        </small>
      )}
      <ErrorBox message={error} />
    </div>
  );
}
