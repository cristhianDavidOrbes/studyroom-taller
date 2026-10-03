export type DesktopSetupStatus = "connecting" | "unavailable" | "ready";
export const desktopInstallerURL = "/desktop/Instalar-StudyRoom.exe";
export const desktopHelperVersion = "1.1.0";
export const desktopProbeWindowMs = 30_000;

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
  let announceChecking = true;
  let windowEndsAt = Date.now() + desktopProbeWindowMs;
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
    if (stopped || inFlight || !surface.isVisible() || Date.now() >= windowEndsAt) return;
    clearTimer();
    const controller = new AbortController();
    inFlight = controller;
    const timeout = setTimeout(() => {
      controller.abort();
      if (!stopped && surface.isVisible()) onStatus("unavailable");
    }, firstAttempt ? 10_000 : 2_000);
    firstAttempt = false;
    if (announceChecking) {
      onStatus("connecting");
      announceChecking = false;
    }
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
      const remaining = windowEndsAt - Date.now();
      if (!stopped && surface.isVisible() && remaining > 0) {
        timer = setTimeout(() => void check(), retryRequested ? 0 : Math.min(2_000, remaining));
        retryRequested = false;
      }
    }
  }
  function wake() {
    clearTimer();
    if (!surface.isVisible()) inFlight?.abort();
    else {
      windowEndsAt = Date.now() + desktopProbeWindowMs;
      if (!inFlight) {
        firstAttempt = true;
        announceChecking = true;
        void check();
      }
    }
  }
  function retry() {
    if (stopped) return;
    firstAttempt = true;
    announceChecking = true;
    windowEndsAt = Date.now() + desktopProbeWindowMs;
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
