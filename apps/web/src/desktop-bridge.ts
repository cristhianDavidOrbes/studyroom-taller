export type DesktopBridgeStatus = "connecting" | "ready" | "unavailable";
const bridgeURL = "http://127.0.0.1:8790/v1/sharing";

/** Media never awaits the local helper. A short lease also hides it after a crash. */
export function startDesktopSharing(
  sessionId: string,
  onStatus: (status: DesktopBridgeStatus) => void,
) {
  let stopped = false;
  let inFlight: AbortController | undefined;
  let firstAttempt = true;
  async function signal(active: boolean) {
    if (active && (stopped || inFlight)) return;
    const controller = new AbortController();
    if (active) inFlight = controller;
    const timeout = setTimeout(
      () => controller.abort(),
      active && firstAttempt ? 10_000 : 750,
    );
    if (active) firstAttempt = false;
    try {
      const options: RequestInit & { targetAddressSpace: "loopback" } = {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, active }),
        keepalive: !active,
        signal: controller.signal,
        targetAddressSpace: "loopback",
      };
      const response = await fetch(bridgeURL, options);
      if (active && !stopped) onStatus(response.ok ? "ready" : "unavailable");
    } catch {
      if (active && !stopped) onStatus("unavailable");
    } finally {
      clearTimeout(timeout);
      if (inFlight === controller) inFlight = undefined;
    }
  }
  onStatus("connecting");
  void signal(true);
  const heartbeat = setInterval(() => {
    void signal(true);
  }, 2000);
  return () => {
    if (stopped) return;
    stopped = true;
    clearInterval(heartbeat);
    inFlight?.abort();
    void signal(false);
  };
}
