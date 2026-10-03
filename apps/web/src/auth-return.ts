/** Keep the invited room/report while rejecting browser URL normalisation tricks. */
export function safeReturnPath(value: string | null, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  const base = "https://studyroom.invalid";
  try {
    const url = new URL(value, base);
    const destination = decodeURI(url.pathname).replace(/\/+$/, "").toLowerCase();
    if (url.origin !== base || destination === "/acceso") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
