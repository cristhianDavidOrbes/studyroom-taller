import { afterEach, describe, expect, it, vi } from "vitest";
import { startDesktopSharing } from "./desktop-bridge";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("menú de escritorio ligado exclusivamente a compartir", () => {
  it("renueva la sesión y libera una sola vez sin enviar identidad ni credenciales", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const status = vi.fn(),
      id = "d41d8cd9-8f00-4204-a980-0998ecf8427e";
    const stop = startDesktopSharing(id, status);
    await vi.advanceTimersByTimeAsync(4000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(status).toHaveBeenLastCalledWith("ready");
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://127.0.0.1:8790/v1/sharing");
    expect(JSON.parse(options.body)).toEqual({ sessionId: id, active: true });
    expect(options.credentials).toBe("omit");
    expect(options.targetAddressSpace).toBe("loopback");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    stop();
    stop();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const stoppedRequest = fetchMock.mock.calls[3][1];
    expect(JSON.parse(stoppedRequest.body)).toEqual({
      sessionId: id,
      active: false,
    });
    expect(stoppedRequest.keepalive).toBe(true);
  });
  it("una herramienta que no responde nunca bloquea el inicio; aborta y reintenta sin solapar", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) =>
            options.signal.addEventListener("abort", () =>
              reject(new Error("timeout")),
            ),
          ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const status = vi.fn();
    const stop = startDesktopSharing(
      "f5bb9491-9f67-43a3-a1c8-17c64edac105",
      status,
    );
    expect(typeof stop).toBe("function");
    await vi.advanceTimersByTimeAsync(9000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1751);
    expect(status).toHaveBeenCalledWith("unavailable");
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(true);
    stop();
    await vi.advanceTimersByTimeAsync(751);
  });
  it("se recupera cuando la aplicación local vuelve a abrirse", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("connection refused"))
      .mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const status = vi.fn();
    const stop = startDesktopSharing(
      "ccbc5cd5-e4c3-408a-8d91-c1351bc7e740",
      status,
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(status).toHaveBeenLastCalledWith("unavailable");
    await vi.advanceTimersByTimeAsync(2000);
    expect(status).toHaveBeenLastCalledWith("ready");
    stop();
  });
});
