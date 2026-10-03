/**
 * Browser-only fixture for the Windows companion readiness boundary.
 * It never launches, installs or inspects a native application. No browser
 * storage flag bypasses the gate: the app still requests its HTTP health URL.
 */
export const windowsUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

export async function desktopHealthFixture(context, initialMode = "ready") {
  const fixture = { mode: initialMode, requests: [] };
  await context.route("http://127.0.0.1:8790/v1/health", async (route) => {
    const request = route.request();
    fixture.requests.push({ method: request.method(), mode: fixture.mode });
    if (fixture.mode === "offline") return route.abort("connectionrefused");
    const headers = {
      "Access-Control-Allow-Origin": request.headers().origin || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Private-Network": "true",
      "Cache-Control": "no-store",
    };
    if (request.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers });
    if (request.method() !== "GET")
      throw new Error("The entry gate must use GET for companion health");
    return route.fulfill({
      status: 200,
      headers,
      json: {
        app: fixture.mode === "wrong-app" ? "Unrelated.Tool" : "StudyRoom.Tools",
        version: fixture.mode === "old-version" ? "1.0.0" : "1.1.0",
        ready: fixture.mode !== "not-ready",
      },
    });
  });
  return fixture;
}
