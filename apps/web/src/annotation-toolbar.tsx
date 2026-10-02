import {
  MousePointer2,
  Pencil,
  Eraser,
  RectangleHorizontal,
  Circle,
  Minus,
  MoveUpRight,
  Type,
  Trash2,
} from "lucide-react";
import type { DrawingTool } from "./annotations";
const choices = [
  { tool: "point", label: "Puntero", Icon: MousePointer2 },
  { tool: "stroke", label: "Lápiz", Icon: Pencil },
  { tool: "erase", label: "Borrador", Icon: Eraser },
  { tool: "line", label: "Línea", Icon: Minus },
  { tool: "arrow", label: "Flecha", Icon: MoveUpRight },
  { tool: "rectangle", label: "Rectángulo", Icon: RectangleHorizontal },
  { tool: "ellipse", label: "Óvalo", Icon: Circle },
  { tool: "text", label: "Texto", Icon: Type },
] as const;

export function AnnotationToolbar({
  hasScreen,
  enabled,
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  fontSize,
  setFontSize,
  text,
  setText,
  clear,
  close,
}: {
  hasScreen: boolean;
  enabled: boolean;
  tool: DrawingTool;
  setTool: (value: DrawingTool) => void;
  color: string;
  setColor: (value: string) => void;
  strokeWidth: number;
  setStrokeWidth: (value: number) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  text: string;
  setText: (value: string) => void;
  clear: () => void;
  close: () => void;
}) {
  return (
    <div
      className="camera-tools"
      aria-label="Herramientas sobre esta vista"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <strong>Sobre esta vista</strong>
      <p>
        {!hasScreen
          ? "Comparte pantalla para activar las herramientas."
          : enabled
            ? "Las marcas se comparten dentro de StudyRoom."
            : "Puede dibujar quien comparte y quien modera."}
      </p>
      <div
        className="annotation-tool-grid"
        role="group"
        aria-label="Tipo de herramienta"
      >
        {choices.map(({ tool: value, label, Icon }) => (
          <button
            key={value}
            disabled={!enabled}
            aria-pressed={tool === value}
            onClick={() => {
              setTool(tool === value ? "off" : value);
              if (value !== "text") close();
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
      <label>
        Color
        <input
          type="color"
          aria-label="Color del señalamiento"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
      </label>
      <label>
        Grosor del trazo
        <select
          aria-label="Grosor del trazo"
          value={strokeWidth}
          onChange={(event) => setStrokeWidth(Number(event.target.value))}
        >
          {[1, 3, 6, 12, 24].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      {tool === "text" && (
        <div className="annotation-text-settings">
          <label>
            Texto para colocar
            <textarea
              aria-label="Texto para colocar"
              rows={2}
              maxLength={300}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Escribe y toca la pantalla para colocarlo"
            />
          </label>
          <label>
            Tamaño de letra
            <select
              aria-label="Tamaño de letra"
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
            >
              {[8, 12, 18, 24, 36, 48, 72, 96].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {tool === "text" && (
        <button disabled={!enabled || !text.trim()} onClick={close}>
          <Type size={16} />
          Colocar texto
        </button>
      )}
      <button disabled={!enabled} onClick={clear}>
        <Trash2 size={16} />
        Borrar señales
      </button>
      <button
        onClick={() => {
          setTool("off");
          close();
        }}
      >
        Desactivar herramientas
      </button>
    </div>
  );
}
