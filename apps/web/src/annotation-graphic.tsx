import { arrowHead } from "./annotations";
import type { Annotation } from "./types";

export function AnnotationGraphic({
  annotation: a,
  height,
}: {
  annotation: Annotation;
  height: number;
}) {
  const color = a.color || "#f6bf4f",
    strokeWidth = a.strokeWidth || 3;
  const points = (a.points || []).map((p) => ({
    x: p.x * 1000,
    y: p.y * height,
  }));
  const [start, end] = points;
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  const pointString = (list: typeof points) =>
    list.map((p) => `${p.x},${p.y}`).join(" ");
  let mark;
  if (a.action === "point")
    mark = (
      <circle
        cx={(a.x || 0) * 1000}
        cy={(a.y || 0) * height}
        r={12}
        fill={color}
        stroke="white"
        strokeWidth={3}
      />
    );
  else if (a.action === "text")
    mark = (
      <text
        x={(a.x || 0) * 1000}
        y={(a.y || 0) * height}
        fontSize={a.fontSize || 24}
        fill={color}
        dominantBaseline="hanging"
        fontFamily="Arial, sans-serif"
      >
        {(a.text || "").split("\n").map((line, index) => (
          <tspan key={index} x={(a.x || 0) * 1000} dy={index ? "1.25em" : 0}>
            {line || " "}
          </tspan>
        ))}
      </text>
    );
  else if (start && end) {
    if (a.action === "rectangle")
      mark = (
        <rect
          x={Math.min(start.x, end.x)}
          y={Math.min(start.y, end.y)}
          width={Math.abs(end.x - start.x)}
          height={Math.abs(end.y - start.y)}
          {...stroke}
        />
      );
    else if (a.action === "ellipse")
      mark = (
        <ellipse
          cx={(start.x + end.x) / 2}
          cy={(start.y + end.y) / 2}
          rx={Math.abs(end.x - start.x) / 2}
          ry={Math.abs(end.y - start.y) / 2}
          {...stroke}
        />
      );
    else if (a.action === "arrow")
      mark = (
        <>
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} {...stroke} />
          <polyline
            points={pointString(arrowHead(start, end, strokeWidth))}
            {...stroke}
          />
        </>
      );
    else if (a.action === "line")
      mark = (
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} {...stroke} />
      );
    else if (a.action === "stroke")
      mark = <polyline points={pointString(points)} {...stroke} />;
  }
  return (
    <g data-annotation-id={a.id} data-annotation-action={a.action}>
      {mark}
    </g>
  );
}
