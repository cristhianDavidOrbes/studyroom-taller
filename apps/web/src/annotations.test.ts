import { describe, it, expect } from "vitest";
import {
  applyAnnotation,
  arrowHead,
  contentBox,
  drawingHeight,
  hitAnnotation,
  normalizedPoint,
  topAnnotationAt,
} from "./annotations";
import type { Annotation } from "./types";
describe("señalamiento compartido normalizado", () => {
  it("excluye las franjas laterales en pantallas verticales", () => {
    const box = contentBox(
      { left: 10, top: 20, width: 1600, height: 900 },
      900,
      1600,
    );
    expect(box.width).toBeCloseTo(506.25);
    expect(normalizedPoint(20, 450, box)).toBeNull();
    expect(normalizedPoint(810, 470, box)).toEqual({ x: 0.5, y: 0.5 });
  });
  it("preserva la misma posición en dos tamaños de receptor", () => {
    const a = contentBox(
        { left: 0, top: 0, width: 1280, height: 720 },
        1920,
        1080,
      ),
      b = contentBox({ left: 0, top: 0, width: 400, height: 400 }, 1920, 1080);
    expect(normalizedPoint(320, 360, a)).toEqual(
      normalizedPoint(b.left + b.width * 0.25, b.top + b.height * 0.5, b),
    );
  });
  it("no transmite coordenadas fuera del contenido ni divisiones por cero", () => {
    expect(
      normalizedPoint(-1, 50, { left: 0, top: 0, width: 100, height: 100 }),
    ).toBeNull();
    expect(
      normalizedPoint(0, 0, { left: 0, top: 0, width: 0, height: 0 }),
    ).toBeNull();
  });
});

describe("herramientas completas y eventos compartidos", () => {
  const rectangle: Annotation = {
    id: "rectangle-id",
    action: "rectangle",
    screenId: "screen-a",
    points: [
      { x: 0.7, y: 0.8 },
      { x: 0.2, y: 0.3 },
    ],
    strokeWidth: 3,
  };
  it("conserva la proporción del texto y formas entre receptores", () => {
    expect(drawingHeight(1600, 900)).toBe(drawingHeight(400, 225));
    expect(drawingHeight(900, 1600)).toBeCloseTo(1777.7777);
  });
  it("borra bordes de formas arrastradas en sentido inverso y no su interior", () => {
    expect(hitAnnotation(rectangle, { x: 0.2, y: 0.5 }, 562.5)).toBe(true);
    expect(hitAnnotation(rectangle, { x: 0.45, y: 0.5 }, 562.5)).toBe(false);
    const ellipse = { ...rectangle, action: "ellipse" as const };
    expect(hitAnnotation(ellipse, { x: 0.2, y: 0.55 }, 562.5)).toBe(true);
    expect(hitAnnotation(ellipse, { x: 0.45, y: 0.55 }, 562.5)).toBe(false);
  });
  it("elige la marca superior solo en la pantalla indicada", () => {
    const under = { ...rectangle, id: "under" },
      otherScreen = { ...rectangle, id: "elsewhere", screenId: "screen-b" };
    expect(
      topAnnotationAt(
        [under, rectangle, otherScreen],
        "screen-a",
        { x: 0.2, y: 0.5 },
        562.5,
      )?.id,
    ).toBe("rectangle-id");
    expect(
      topAnnotationAt([otherScreen], "screen-a", { x: 0.2, y: 0.5 }, 562.5),
    ).toBeUndefined();
  });
  it("aplica borrado y limpiar sin tocar otras pantallas; deduplica HTTP/socket", () => {
    const other = { ...rectangle, id: "other", screenId: "screen-b" };
    expect(
      applyAnnotation([rectangle, other], {
        action: "erase",
        screenId: "screen-a",
        targetIds: [rectangle.id!, other.id!],
      }),
    ).toEqual([other]);
    expect(
      applyAnnotation([rectangle, other], {
        action: "clear",
        screenId: "screen-a",
      }),
    ).toEqual([other]);
    expect(applyAnnotation([rectangle], rectangle)).toEqual([rectangle]);
  });
  it("permite borrar trazos, flechas y texto por posición", () => {
    const line: Annotation = {
      action: "stroke",
      screenId: "a",
      points: [
        { x: 0.1, y: 0.1 },
        { x: 0.3, y: 0.3 },
        { x: 0.6, y: 0.3 },
      ],
    };
    expect(hitAnnotation(line, { x: 0.5, y: 0.3 }, 562.5)).toBe(true);
    expect(hitAnnotation(line, { x: 0.5, y: 0.5 }, 562.5)).toBe(false);
    expect(arrowHead({ x: 0, y: 0 }, { x: 100, y: 100 }, 3)[1]).toEqual({
      x: 100,
      y: 100,
    });
    expect(
      hitAnnotation(
        {
          action: "text",
          screenId: "a",
          x: 0.2,
          y: 0.2,
          text: "Nota\nDos líneas",
          fontSize: 24,
        },
        { x: 0.25, y: 0.26 },
        562.5,
      ),
    ).toBe(true);
  });
});
