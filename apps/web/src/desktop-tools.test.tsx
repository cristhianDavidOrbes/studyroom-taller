import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DesktopTools } from "./desktop-tools";

describe("herramientas Windows para cada participante", () => {
  it("ofrece apertura incluso antes de compartir, sin identidad ni secretos en URI", () => {
    const html = renderToStaticMarkup(<DesktopTools sharing={false} />);
    expect(html).toContain('href="studyroom-tools://open"');
    expect(html).toContain("Cada participante");
    expect(html).toContain("Primera vez / instalar");
  });
  it("no identifica erróneamente una ventana cuando Firefox omite displaySurface", () => {
    const html = renderToStaticMarkup(<DesktopTools sharing />);
    expect(html).toContain("Comprueba que seleccionaste");
    expect(html).not.toContain("Deja de compartir");
    expect(html).not.toContain("Estás compartiendo una pestaña");
  });
  it("pide cambiar la selección solo si se conoce una captura parcial", () => {
    expect(
      renderToStaticMarkup(<DesktopTools sharing displaySurface="window" />),
    ).toContain("Deja de compartir");
    expect(
      renderToStaticMarkup(<DesktopTools sharing displaySurface="monitor" />),
    ).toContain("Compartes la pantalla completa");
  });
});
