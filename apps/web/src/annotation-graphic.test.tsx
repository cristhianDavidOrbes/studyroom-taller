import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AnnotationGraphic } from "./annotation-graphic";

describe("representación de anotaciones", () => {
  it("renderiza texto como contenido seguro, conservando tamaño y color", () => {
    const svg = renderToStaticMarkup(
      <svg>
        <AnnotationGraphic
          height={562.5}
          annotation={{
            action: "text",
            screenId: "screen",
            x: 0.2,
            y: 0.4,
            text: '<img src=x onerror="alert(1)">\nSegunda línea',
            fontSize: 36,
            color: "#123456",
          }}
        />
      </svg>,
    );
    expect(svg).toContain("&lt;img");
    expect(svg).not.toContain("<img");
    expect(svg).toContain('font-size="36"');
    expect(svg).toContain('fill="#123456"');
    expect(svg).toContain('y="225"');
    expect(svg).toContain('dy="1.25em"');
  });
  it("rectángulos invertidos mantienen dimensiones positivas y grosor solicitado", () => {
    const svg = renderToStaticMarkup(
      <svg>
        <AnnotationGraphic
          height={500}
          annotation={{
            action: "rectangle",
            screenId: "screen",
            points: [
              { x: 0.8, y: 0.7 },
              { x: 0.2, y: 0.1 },
            ],
            strokeWidth: 12,
          }}
        />
      </svg>,
    );
    expect(svg).toContain('x="200"');
    expect(svg).toContain('y="50"');
    expect(svg).toContain('width="600"');
    expect(svg).toContain('height="300"');
    expect(svg).toContain('stroke-width="12"');
  });
});
