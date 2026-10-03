import { describe, expect, it, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { LandingPage } from "./landing";
import { DesktopSetup } from "./desktop-setup";

afterEach(() => vi.unstubAllGlobals());
describe("portada y preparación de escritorio", () => {
  it("ofrece registro directo y explica reporte con preguntas sin ofrecer cuestionarios", () => {
    const html = renderToStaticMarkup(<MemoryRouter><LandingPage /></MemoryRouter>);
    expect(html).toContain('href="/acceso?mode=register"');
    expect(html).toContain("Conserva cada idea.");
    expect(html).toContain("Pregunta sobre tu reporte");
    expect(html).toContain("Transcripción automática con el micrófono encendido.");
    expect(html).not.toMatch(/cuestionario|quiz|8790|Instalar-StudyRoom.exe/i);
  });
  it("exige abrir el instalador y muestra salida sin omitir la comprobación real", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" });
    const html = renderToStaticMarkup(<DesktopSetup onReady={() => {}} onLogout={() => {}} />);
    expect(html).toContain('href="/desktop/Instalar-StudyRoom.exe"');
    expect(html).toContain("Guardar el archivo no lo instala.");
    expect(html).toContain("Cerrar sesión");
    expect(html).toContain('href="studyroom-tools://open"');
    expect(html).not.toMatch(/entrar sin|omitir|ya lo descargué/i);
  });
  it("no autoriza ni ofrece un instalador inservible en otros sistemas", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)" });
    const html = renderToStaticMarkup(<DesktopSetup onReady={() => {}} onLogout={() => {}} />);
    expect(html).toContain("Necesitas un equipo con Windows");
    expect(html).not.toContain('href="/desktop/Instalar-StudyRoom.exe"');
    expect(html).not.toContain("Entrando…");
  });
});
