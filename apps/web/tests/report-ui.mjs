import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const base = process.env.WEB_BASE_URL || "http://localhost:5173";
const output = resolve(process.env.TEST_OUTPUT_DIR || "apps/web/test-results/report-ui");
await mkdir(output, { recursive: true });
const evidence = { at: new Date().toISOString(), kind: "Headless Chromium UI with real Firebase emulator login and test-only report/job/resource HTTP fixtures", limits: "Does not certify AI generation, stored document access or speech recognition. Those have separate real-service evidence.", checks: [] };
const nonce = Date.now(), email = `report-ui-${nonce}@example.test`, password = "StudyRoom-Test-2026";
let browser, token;
const sid = "598a7ddb-a6ec-497b-b4c7-5ca7fc822c1b", sid2 = "246ac906-c48c-4ef8-bd42-4d04302e105c";
const errors = [];
async function check(name, fn) { await fn(); evidence.checks.push({ name, status: "passed" }); console.log(`PASS ${name}`); }
try {
  const response = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
  const account = await response.json(); assert(response.ok); token = account.idToken;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  await fetch("http://127.0.0.1:3000/api/me", { headers });
  assert((await fetch("http://127.0.0.1:3000/api/me", { method: "PATCH", headers, body: JSON.stringify({ displayName: "Prueba Reporte UI", onboarded: true }) })).ok);
  const now = new Date().toISOString();
  const report = { id: sid, roomId: "fixture-room", title: "Fundamentos compartidos de geometría", startedAt: now, endedAt: now, jobs: [], attempts: [], messages: [{ id: "message", userId: "speaker", displayName: "Ana", text: "El área se obtiene multiplicando base por altura.", kind: "user", createdAt: now }], documents: [{ id: "image", name: "Informe de StudyRoom.png", mimeType: "image/png", size: 6363, createdAt: now, uploadedBy: "speaker", available: true, extractedText: "Informe de StudyRoom\nEl area es base por altura.", extractionStatus: "partial", extractionError: "Solo se pudo reconocer parte del recurso." }, { id: "document", name: "Apuntes de la sesión.txt", mimeType: "text/plain", size: 100, createdAt: now, uploadedBy: "speaker", available: false, extractedText: "Texto reconocido: base por altura.", extractionStatus: "available" }], transcription: { sessionId: sid, startedAt: now, segments: [{ id: "segment-1", speakerId: "speaker", speakerName: "Ana", text: "La base del rectángulo mide cinco centímetros.", startMs: 12000, endMs: 17000, words: [] }, { id: "segment-2", speakerId: "speaker-two", speakerName: "Luis", text: "Multiplicamos la base por la altura para encontrar el área.", startMs: 20000, endMs: 25000, words: [] }, { id: "segment-3", speakerId: "speaker", speakerName: "Ana", text: "<img src=x onerror=alert(1)> es texto de prueba, no HTML.", startMs: 30000, endMs: 35000, words: [] }], batches: [], participants: [{ userId: "speaker", displayName: "Ana", enabled: false }, { userId: "speaker-two", displayName: "Luis", enabled: false }], coverage: { status: "partial", pendingBatches: 0, failedBatches: 1, completedBatches: 2, consentingParticipants: 0, totalParticipants: 2 } } };
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage(); page.setDefaultTimeout(60000); page.on("pageerror", (error) => errors.push(error.message));
  await context.route(`**/api/sessions/${sid}/report`, (route) => route.fulfill({ json: report }));
  await context.route(`**/api/sessions/${sid2}/report`, (route) => route.fulfill({ json: { ...report, id: sid2, title: "Otro reporte independiente", messages: [], documents: [], transcription: { ...report.transcription, sessionId: sid2, segments: [] } } }));
  await context.route("**/api/rooms/fixture-room/notes", (route) => route.fulfill({ json: { text: "" } }));
  await context.route(`**/api/sessions/${sid}/documents/image/url`, (route) => { assert(route.request().headers().authorization?.startsWith("Bearer ")); return route.fulfill({ json: { url: `${base}/fixture-report-image.png` } }); });
  const image = await readFile(resolve(".local/ocr-fixture.png"));
  await context.route("**/fixture-report-image.png", (route) => route.fulfill({ contentType: "image/png", body: image }));
  const jobId = "77a9b7c7-1603-4ca9-837b-1b32ff0b70f5";
  await context.route(`**/api/sessions/${sid}/questions`, (route) => { const body = route.request().postDataJSON(); assert.deepEqual(Object.keys(body).sort(), ["clientId", "question"]); assert(route.request().headers().authorization?.startsWith("Bearer ")); return route.fulfill({ json: { id: jobId, kind: "answer", status: "queued", question: body.question, createdAt: now } }); });
  await context.route(`**/api/ai/jobs/${jobId}`, (route) => route.fulfill({ json: { id: jobId, kind: "answer", status: "completed", question: "¿Cómo se calculó el área?", result: { text: "Según el registro de Luis, se multiplicó base por altura. [voz 00:20]" }, createdAt: now } }));
  await page.goto(`${base}/acceso`); await page.getByLabel("Correo electrónico").fill(email); await page.getByLabel("Contraseña", { exact: true }).fill(password); await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click(); await page.getByRole("heading", { name: /Hola, Prueba/ }).waitFor();
  await page.goto(`${base}/sesiones/${sid}`);
  await check("Original voice search, speaker filtering, chat and safe escaped transcript", async () => {
    await page.getByRole("heading", { name: "Lo que se habló" }).waitFor();
    await page.getByLabel("Buscar en la transcripción").fill("altura"); assert.equal(await page.locator("#report-voice .transcript-list li").count(), 1);
    await page.getByLabel("Buscar en la transcripción").fill(""); await page.getByLabel("Filtrar transcripción por participante").selectOption("speaker-two"); assert.equal(await page.locator("#report-voice .transcript-list li").count(), 1);
    await page.getByLabel("Filtrar transcripción por participante").selectOption(""); assert.equal(await page.locator("#report-voice .transcript-list img").count(), 0);
    assert(await page.getByText("El área se obtiene multiplicando base por altura.", { exact: true }).isVisible());
  });
  await check("Authenticated image preview and honest partial/unavailable resource status", async () => {
    await page.getByRole("button", { name: "Ver imagen", exact: true }).click(); await page.getByRole("dialog").waitFor();
    assert(await page.locator(".report-image-expanded").evaluate((element) => element.naturalWidth > 0)); await page.getByRole("button", { name: "Cerrar ventana" }).click();
    assert(await page.getByText(/Solo se reconoció parte del texto de este recurso/).isVisible()); assert(await page.getByText("Ya no disponible", { exact: true }).isVisible());
  });
  await check("Report question progress/result stays private and is cleared on session navigation", async () => {
    await page.getByLabel("¿Qué te gustaría entender?").fill("¿Cómo se calculó el área?"); await page.getByRole("button", { name: "Consultar este reporte", exact: true }).click(); await page.locator("#report-questions .job-completed").waitFor();
    await page.screenshot({ path: resolve(output, "report-desktop.png"), fullPage: true, animations: "disabled" });
    await page.evaluate((next) => { history.pushState({}, "", `/sesiones/${next}`); window.dispatchEvent(new PopStateEvent("popstate")); }, sid2);
    await page.getByRole("heading", { name: "Otro reporte independiente", exact: true }).waitFor(); assert.equal(await page.locator("#report-questions .job-card").count(), 0); assert.equal(await page.getByLabel("¿Qué te gustaría entender?").inputValue(), "");
  });
  await check("Mobile report stays inside viewport with all sections accessible", async () => {
    await page.goto(`${base}/sesiones/${sid}`); await page.getByRole("heading", { name: "Lo que se habló" }).waitFor(); await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)); await page.screenshot({ path: resolve(output, "report-mobile.png"), fullPage: true, animations: "disabled" });
  });
  assert.deepEqual(errors, []); evidence.status = "passed";
} catch (error) { evidence.status = "failed"; evidence.error = String(error); throw error; }
finally {
  await browser?.close(); if (token) await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:delete?key=demo-api-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }) }).catch(() => {});
  await writeFile(resolve(output, "report-ui.json"), JSON.stringify(evidence, null, 2));
}
