import { afterEach, describe, expect, it, vi } from "vitest";
import { desktopProbeWindowMs, isDesktopHelperReady, isWindowsUserAgent, monitorDesktopHelper } from "./desktop-setup-probe";
import { safeReturnPath } from "./auth-return";

afterEach(() => vi.useRealTimers());
const health = { app: "StudyRoom.Tools", version: "1.1.0", ready: true };
function visibleSurface() {
  let visible = true;
  let notify = () => {};
  const unsubscribe = vi.fn();
  return {
    surface: { isVisible: () => visible, subscribe: (listener: () => void) => { notify = listener; return unsubscribe; } },
    visibility: (next: boolean) => { visible = next; notify(); },
    unsubscribe,
  };
}

describe("entrada obligatoria con herramienta real", () => {
  it("solo admite la identidad, versión y disponibilidad esperadas del ayudante", () => {
    expect(isDesktopHelperReady(health)).toBe(true);
    for (const invalid of [null, true, {}, { ...health, app: "otra-app" }, { ...health, version: "1.0.0" }, { ...health, ready: false }, { ...health, ready: "true" }]) expect(isDesktopHelperReady(invalid)).toBe(false);
    expect(isWindowsUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(true);
    expect(isWindowsUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X)" )).toBe(false);
    expect(isWindowsUserAgent("Mozilla/5.0 (Windows Phone 10.0; Windows NT 10.0)" )).toBe(false);
    expect(isWindowsUserAgent("Mozilla/5.0 (X11; Linux x86_64)" )).toBe(false);
  });
  it("no aprueba un helper antiguo, usa GET sin credenciales y termina el sondeo al conectar", async () => {
    vi.useFakeTimers();
    const scope = visibleSurface();
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ ...health, version: "1.0.0" }))).mockResolvedValue(new Response(JSON.stringify(health)));
    const status = vi.fn();
    const monitor = monitorDesktopHelper(status, scope.surface, fetcher as typeof fetch);
    await vi.advanceTimersByTimeAsync(0);
    expect(status).toHaveBeenLastCalledWith("unavailable");
    await vi.advanceTimersByTimeAsync(2000);
    expect(status).toHaveBeenLastCalledWith("ready");
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe("http://127.0.0.1:8790/v1/health");
    expect(options.method).toBe("GET");
    expect(options.credentials).toBe("omit");
    expect(options.targetAddressSpace).toBe("loopback");
    expect(options.body).toBeUndefined();
    expect(options.headers).toBeUndefined();
    expect(scope.unsubscribe).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(60000);
    expect(fetcher).toHaveBeenCalledTimes(2);
    monitor.stop();
    expect(scope.unsubscribe).toHaveBeenCalledOnce();
  });
  it("limita la primera espera y no solapa peticiones con una herramienta que no responde", async () => {
    vi.useFakeTimers();
    const scope = visibleSurface();
    const fetcher = vi.fn().mockImplementation((_url, options: RequestInit) => new Promise((_resolve, reject) => options.signal?.addEventListener("abort", () => reject(new Error("abort")))));
    const status = vi.fn();
    const monitor = monitorDesktopHelper(status, scope.surface, fetcher as typeof fetch);
    await vi.advanceTimersByTimeAsync(9999);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalledWith("ready");
    await vi.advanceTimersByTimeAsync(2001);
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
    monitor.stop();
    await vi.advanceTimersByTimeAsync(60000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("suspende solicitudes al ocultarse y se recupera al volver; una descarga no interviene", async () => {
    vi.useFakeTimers();
    const scope = visibleSurface();
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(new Response(JSON.stringify(health)));
    const status = vi.fn();
    monitorDesktopHelper(status, scope.surface, fetcher as typeof fetch);
    await vi.advanceTimersByTimeAsync(0);
    scope.visibility(false);
    await vi.advanceTimersByTimeAsync(60000);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalledWith("ready");
    scope.visibility(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(status).toHaveBeenLastCalledWith("ready");
  });
  it("no acepta una respuesta tardía después de salir de la pantalla de instalación", async () => {
    vi.useFakeTimers();
    const scope = visibleSurface();
    let finish: (response: Response) => void = () => {};
    const fetcher = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { finish = resolve; }));
    const status = vi.fn();
    const monitor = monitorDesktopHelper(status, scope.surface, fetcher as typeof fetch);
    monitor.stop();
    finish(new Response(JSON.stringify(health)));
    await vi.advanceTimersByTimeAsync(0);
    expect(status).not.toHaveBeenCalledWith("ready");
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
  });
  it("deja una indicación estable después del primer fallo y termina los intentos automáticos", async () => {
    vi.useFakeTimers();
    const scope = visibleSurface();
    const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
    const status = vi.fn();
    const monitor = monitorDesktopHelper(status, scope.surface, fetcher as typeof fetch);
    await vi.advanceTimersByTimeAsync(desktopProbeWindowMs);
    const requestsAtEnd = fetcher.mock.calls.length;
    expect(requestsAtEnd).toBeGreaterThan(1);
    expect(requestsAtEnd).toBeLessThanOrEqual(15);
    expect(status.mock.calls.filter(([value]) => value === "connecting")).toHaveLength(1);
    expect(status).toHaveBeenLastCalledWith("unavailable");
    await vi.advanceTimersByTimeAsync(60000);
    expect(fetcher).toHaveBeenCalledTimes(requestsAtEnd);
    monitor.retry();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetcher).toHaveBeenCalledTimes(requestsAtEnd + 1);
    expect(status.mock.calls.filter(([value]) => value === "connecting")).toHaveLength(2);
    monitor.stop();
  });
  it("volver a la página permite comprobar de nuevo después de terminar la espera", async () => {
    vi.useFakeTimers();
    const scope = visibleSurface();
    const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
    const status = vi.fn();
    const monitor = monitorDesktopHelper(status, scope.surface, fetcher as typeof fetch);
    await vi.advanceTimersByTimeAsync(desktopProbeWindowMs + 1000);
    const requestsAtEnd = fetcher.mock.calls.length;
    fetcher.mockResolvedValue(new Response(JSON.stringify(health)));
    scope.visibility(false);
    scope.visibility(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetcher).toHaveBeenCalledTimes(requestsAtEnd + 1);
    expect(status).toHaveBeenLastCalledWith("ready");
    monitor.stop();
  });
  it("quita el estado comprobando aunque la lectura de una respuesta no termine al abortarse", async () => {
    vi.useFakeTimers();
    const scope = visibleSurface();
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: () => new Promise(() => {}) });
    const status = vi.fn();
    const monitor = monitorDesktopHelper(status, scope.surface, fetcher as typeof fetch);
    await vi.advanceTimersByTimeAsync(10000);
    expect(status).toHaveBeenLastCalledWith("unavailable");
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    monitor.stop();
  });
});

describe("destino después de iniciar sesión", () => {
  it("conserva sala, consulta y ancla, pero rechaza destinos ajenos y accesos recursivos", () => {
    expect(safeReturnPath("/salas/sala?from=invite#chat")).toBe("/salas/sala?from=invite#chat");
    expect(safeReturnPath(null, "/perfil")).toBe("/perfil");
    for (const unsafe of ["https://other.test", "//other.test", "/\\other.test", "/acceso?next=/acceso", "/ACCESO/", "/%61cceso", "/\n/other.test", "javascript:alert(1)"]) expect(safeReturnPath(unsafe)).toBe("/");
  });
});
