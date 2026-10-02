import type { Annotation } from "./types";
export type DrawingTool = Exclude<Annotation["action"], "clear"> | "off";
export interface Point {
  x: number;
  y: number;
}
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Apply the same event safely whether received through HTTP or the socket. */
export function applyAnnotation(
  current: Annotation[],
  event: Annotation,
): Annotation[] {
  if (event.action === "clear")
    return current.filter((a) => a.screenId !== event.screenId);
  if (event.action === "erase") {
    const ids = new Set(event.targetIds || []);
    return current.filter(
      (a) => a.screenId !== event.screenId || !a.id || !ids.has(a.id),
    );
  }
  if (event.id && current.some((a) => a.id === event.id)) return current;
  return [
    ...current.filter(
      (a) =>
        event.action !== "point" ||
        a.action !== "point" ||
        a.screenId !== event.screenId,
    ),
    event,
  ].slice(-40);
}

/** Drawing sizes are relative to a 1000-unit-wide screen, preserving its aspect. */
export function drawingHeight(width: number, height: number) {
  return width > 0 && height > 0 ? (1000 * height) / width : 562.5;
}
export function arrowHead(
  start: Point,
  end: Point,
  strokeWidth: number,
): Point[] {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const size = Math.max(14, strokeWidth * 4);
  return [
    {
      x: end.x - size * Math.cos(angle - Math.PI / 6),
      y: end.y - size * Math.sin(angle - Math.PI / 6),
    },
    end,
    {
      x: end.x - size * Math.cos(angle + Math.PI / 6),
      y: end.y - size * Math.sin(angle + Math.PI / 6),
    },
  ];
}
function segmentDistance(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t =
    dx || dy
      ? Math.max(
          0,
          Math.min(
            1,
            ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy),
          ),
        )
      : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
/** Hit testing erases a complete mark, never an unrelated screen's mark. */
export function hitAnnotation(
  a: Annotation,
  point: Point,
  height: number,
  tolerance = 12,
): boolean {
  const p = { x: point.x * 1000, y: point.y * height };
  const project = (v: Point) => ({ x: v.x * 1000, y: v.y * height });
  const radius = tolerance + (a.strokeWidth || 3) / 2;
  if (a.action === "point")
    return (
      Math.hypot(p.x - (a.x || 0) * 1000, p.y - (a.y || 0) * height) <=
      12 + tolerance
    );
  if (a.action === "text") {
    const size = a.fontSize || 24,
      lines = (a.text || "").split("\n");
    const x = (a.x || 0) * 1000,
      y = (a.y || 0) * height;
    return (
      p.x >= x - tolerance &&
      p.x <=
        x +
          Math.max(...lines.map((line) => line.length), 1) * size * 0.65 +
          tolerance &&
      p.y >= y - tolerance &&
      p.y <= y + lines.length * size * 1.25 + tolerance
    );
  }
  const points = (a.points || []).map(project);
  if (points.length < 2) return false;
  const [start, end] = points;
  if (a.action === "rectangle") {
    const corners = [
      start,
      { x: end.x, y: start.y },
      end,
      { x: start.x, y: end.y },
      start,
    ];
    return corners
      .slice(1)
      .some((b, i) => segmentDistance(p, corners[i], b) <= radius);
  }
  if (a.action === "ellipse") {
    const rx = Math.abs(end.x - start.x) / 2,
      ry = Math.abs(end.y - start.y) / 2;
    if (!rx || !ry) return segmentDistance(p, start, end) <= radius;
    const cx = (start.x + end.x) / 2,
      cy = (start.y + end.y) / 2;
    const distance =
      Math.abs(Math.hypot((p.x - cx) / rx, (p.y - cy) / ry) - 1) *
      Math.min(rx, ry);
    return distance <= radius;
  }
  if (a.action === "arrow") {
    const head = arrowHead(start, end, a.strokeWidth || 3);
    if (head.slice(1).some((b, i) => segmentDistance(p, head[i], b) <= radius))
      return true;
  }
  return points
    .slice(1)
    .some((b, i) => segmentDistance(p, points[i], b) <= radius);
}

export function topAnnotationAt(
  annotations: Annotation[],
  screenId: string,
  point: Point,
  height: number,
  tolerance?: number,
): Annotation | undefined {
  for (let i = annotations.length - 1; i >= 0; i--) {
    const a = annotations[i];
    if (
      a.screenId === screenId &&
      a.id &&
      hitAnnotation(a, point, height, tolerance)
    )
      return a;
  }
}
/** Position relative to the video content, excluding object-fit:contain letterboxing. */
export function contentBox(
  container: Box,
  videoWidth: number,
  videoHeight: number,
): Box {
  if (!videoWidth || !videoHeight || !container.width || !container.height)
    return container;
  const scale = Math.min(
      container.width / videoWidth,
      container.height / videoHeight,
    ),
    width = videoWidth * scale,
    height = videoHeight * scale;
  return {
    left: container.left + (container.width - width) / 2,
    top: container.top + (container.height - height) / 2,
    width,
    height,
  };
}
export function normalizedPoint(
  x: number,
  y: number,
  box: Box,
): { x: number; y: number } | null {
  if (
    box.width <= 0 ||
    box.height <= 0 ||
    x < box.left ||
    x > box.left + box.width ||
    y < box.top ||
    y > box.top + box.height
  )
    return null;
  return { x: (x - box.left) / box.width, y: (y - box.top) / box.height };
}
