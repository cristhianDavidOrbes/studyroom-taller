export type DesktopSetupStatus = "connecting" | "unavailable" | "ready";
export const desktopInstallerURL = "/desktop/Instalar-StudyRoom.exe";
export const desktopHelperVersion = "1.1.0";

export function isWindowsUserAgent(userAgent: string) {
  return /\bWindows NT\b/i.test(userAgent) && !/Windows Phone/i.test(userAgent);
}

export function isDesktopHelperReady(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const health = value as Record<string, unknown>;
  return health.app === "StudyRoom.Tools" &&
    health.version === desktopHelperVersion && health.ready === true;
}

interface VisibilitySurface {
  isVisible: () => boolean;
  subscribe: (wake: () => void) => () => void;
}

function browserSurface(): VisibilitySurface {
  return {
    isVisible: () => document.visibilityState === "visible",
    subscribe: (wake) => {
      document.addEventListener("visibilitychange", wake);
      window.addEventListener("focus", wake);
      return () => {
        document.removeEventListener("visibilitychange", wake);
        window.removeEventListener("focus", wake);
      };
    },
  };
}

/** This read-only handshake cannot open the drawing menu or accept a download as installation. */
export function monitorDesktopHelper(
  onStatus: (status: DesktopSetupStatus) => void,
  surface: VisibilitySurface = browserSurface(),
  fetcher: typeof fetch = fetch,
) {
  let stopped = false;
  let firstAttempt = true;
  let retryRequested = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let inFlight: AbortController | undefined;
  let unsubscribe = () => {};

  function clearTimer() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }
  function stop() {
    if (stopped) return;
    stopped = true;
    clearTimer();
    inFlight?.abort();
    unsubscribe();
  }
  async function check() {
    if (stopped || inFlight || !surface.isVisible()) return;
    clearTimer();
    const controller = new AbortController();
    inFlight = controller;
    const timeout = setTimeout(() => controller.abort(), firstAttempt ? 10_000 : 2_000);
    firstAttempt = false;
    onStatus("connecting");
    try {
      const options: RequestInit & { targetAddressSpace: "loopback" } = {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
        targetAddressSpace: "loopback",
      };
      const response = await fetcher("http://127.0.0.1:8790/v1/health", options);
      const health: unknown = response.ok ? await response.json() : null;
      if (stopped || controller.signal.aborted || !surface.isVisible()) return;
      if (isDesktopHelperReady(health)) {
        stop();
        onStatus("ready");
      } else onStatus("unavailable");
    } catch {
      if (!stopped && surface.isVisible()) onStatus("unavailable");
    } finally {
      clearTimeout(timeout);
      if (inFlight === controller) inFlight = undefined;
      if (!stopped && surface.isVisible()) {
        timer = setTimeout(() => void check(), retryRequested ? 0 : 2_000);
        retryRequested = false;
      }
    }
  }
  function wake() {
    clearTimer();
    if (!surface.isVisible()) inFlight?.abort();
    else void check();
  }
  function retry() {
    if (stopped) return;
    firstAttempt = true;
    clearTimer();
    if (inFlight) {
      retryRequested = true;
      inFlight.abort();
    } else void check();
  }
  unsubscribe = surface.subscribe(wake);
  void check();
  return { stop, retry };
}
