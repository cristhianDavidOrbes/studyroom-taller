import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { desktopHealthFixture, windowsUserAgent } from "./desktop-health-fixture.mjs";
import { activateMicrophone } from "./media-actions.mjs";

const base = process.env.WEB_BASE_URL || "http://localhost:5173";
const output = resolve(process.env.TEST_OUTPUT_DIR || "apps/web/test-results/session-report");
const speech = resolve(process.env.TEST_SPEECH_WAV || "apps/ai-gateway/.local/speech/synthetic-verification.wav");
await mkdir(output, { recursive: true });
const evidence = { at: new Date().toISOString(), kind: "Two isolated Chromium contexts; real local API/Auth emulator, LiveKit SFU, Spanish SAPI synthetic microphone and canvas screen, local Whisper STT, authorized stored synthetic PNG/text and real local report AI", limits: "Only synthetic audio/video/documents; no physical microphone, desktop or long-duration network stability certified. Desktop bridge lifecycle uses HTTP204 fixture exclusively; STT/report/resources/AI are real services.", checks: [] };
let browser, room;
const clients = [];
const errors = [], uploaded = [];
const nonce = Date.now();
async function request(token, path, body, method = body === undefined ? "GET" : "POST") {
  const response = await fetch(`http://127.0.0.1:3000/api${path}`, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${data.message}`);
  return data;
}
async function account(index) {
  const email = `report-${nonce}-${index}@example.test`, password = "StudyRoom-Test-2026";
  const response = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
  const user = await response.json(); assert(response.ok);
  await request(user.idToken, "/me"); await request(user.idToken, "/me", { displayName: `Prueba Reporte ${index}`, onboarded: true }, "PATCH");
  return { email, password, token: user.idToken, uid: user.localId };
}
async function check(name, task) { await task(); evidence.checks.push({ name, status: "passed" }); console.log(`PASS ${name}`); }
try {
  console.log("Preparing isolated test accounts and room");
  const host = await account(1), guest = await account(2); clients.push(host, guest);
  assert((await request(host.token, "/usage")).configured.media, "Configured LiveKit required");
  room = await request(host.token, "/rooms", { title: `Reporte sintético ${nonce}`, description: "Prueba sintética de transcripción automática de participantes y consulta del reporte.", subject: "Aprendizaje", privacy: "public", capacity: 2, durationMinutes: 15 });
  await request(guest.token, `/rooms/${room.id}/join`, {});
  browser = await chromium.launch({ headless: true, args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${speech}`, "--autoplay-policy=no-user-gesture-required"] });
  for (const client of clients) {
    console.log(`Preparing browser ${client.email.endsWith("-1@example.test") ? "host" : "guest"}`);
    client.context = await browser.newContext({ viewport: { width: 1400, height: 1000 }, permissions: ["camera", "microphone"], userAgent: windowsUserAgent });
    await desktopHealthFixture(client.context);
    client.page = await client.context.newPage(); client.page.setDefaultTimeout(90000);
    client.page.on("pageerror", (error) => errors.push(error.message));
    await client.context.route("http://127.0.0.1:8790/v1/sharing", (route) => route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" } }));
    await client.page.addInitScript(() => {
      window.testMicrophoneRequests = 0;
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async (options) => { if (options.audio) window.testMicrophoneRequests++; return original(options); };
      navigator.mediaDevices.getDisplayMedia = async () => {
        const canvas = document.createElement("canvas"); canvas.width = 1280; canvas.height = 720;
        const context = canvas.getContext("2d"); let frame = 0;
        const timer = setInterval(() => { context.fillStyle = "#173d35"; context.fillRect(0, 0, 1280, 720); context.fillStyle = "#fff"; context.font = "36px sans-serif"; context.fillText("Reporte de sesión — pantalla sintética", 60, 160); context.fillStyle = "#d1e8a9"; context.fillRect(50 + frame++ % 1100, 330, 60, 60); }, 66);
        const stream = canvas.captureStream(15); stream.getVideoTracks()[0].addEventListener("ended", () => clearInterval(timer)); return stream;
      };
    });
    await client.page.goto(`${base}/acceso`); await client.page.getByLabel("Correo electrónico").fill(client.email); await client.page.getByLabel("Contraseña", { exact: true }).fill(client.password); await client.page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await client.page.getByRole("heading", { name: "La aplicación ya está instalada", exact: true }).waitFor();
    await client.page.getByRole("button", { name: "Continuar", exact: true }).click();
    await client.page.getByRole("heading", { name: /Hola, Prueba/ }).waitFor();
    await client.page.goto(`${base}/salas/${room.id}`);
    await client.page.getByRole("heading", { name: "La aplicación ya está instalada", exact: true }).waitFor();
    await client.page.getByRole("button", { name: "Continuar", exact: true }).click();
    let connected = false;
    for (let attempt = 0; attempt < 3 && !connected; attempt++) {
      console.log(`Connecting real media, attempt ${attempt + 1}/3`);
      await client.page.getByRole("button", { name: "Conectar videollamada" }).click();
      await Promise.race([client.page.locator(".connection-pill.connected").waitFor({ timeout: 30000 }).catch(() => {}), client.page.locator(".media-stage .notice.error").waitFor({ timeout: 30000 }).catch(() => {})]);
      connected = await client.page.locator(".connection-pill.connected").isVisible();
    }
    if (!connected) throw new Error(await client.page.locator(".media-stage .notice.error").textContent({ timeout: 1000 }).catch(() => "Media connection unavailable"));
    console.log("Real media connected");
    await client.page.getByRole("button", { name: "Activar cámara", exact: true }).click();
    await client.page.getByRole("tab", { name: "Voz", exact: true }).click();
  }
  await check("Automatic transcription never captures a microphone that has not been published", async () => {
    const state = await request(host.token, `/rooms/${room.id}/transcription`); assert.equal(state.segments.length, 0);
    for (const client of clients) assert.equal(await client.page.evaluate(() => window.testMicrophoneRequests), 0);
  });
  await host.page.getByRole("button", { name: "Compartir pantalla", exact: true }).click();
  await guest.page.waitForFunction(() => document.querySelector("video.screen-video")?.videoWidth === 1280);
  const before = await guest.page.locator("video.screen-video").evaluate((video) => video.currentTime);
  for (const client of clients) {
    await activateMicrophone(client.page);
    await client.page.getByText("Escuchando tu micrófono", { exact: false }).waitFor();
    assert.equal(await client.page.getByRole("heading", { name: "Tu voz en el reporte compartido", exact: true }).count(), 0);
  }
  await check("Both published microphones transcribe automatically and literal words reach every participant", async () => {
    await host.page.getByText(/El reporte contiene la transcripci[oó]n/).first().waitFor({ timeout: 180000 });
    await guest.page.getByText(/El reporte contiene la transcripci[oó]n/).first().waitFor({ timeout: 30000 });
    let state;
    for (let attempt = 0; attempt < 40; attempt++) {
      state = await request(host.token, `/rooms/${room.id}/transcription`);
      if (clients.every((client) => state.segments.some((segment) => segment.speakerId === client.uid))) break;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    assert(state.segments.some((segment) => /estudiando juntos/i.test(segment.text)));
    assert(state.segments.every((segment) => clients.some((client) => client.uid === segment.speakerId)));
    for (const client of clients) assert(state.segments.some((segment) => segment.speakerId === client.uid), "Each participant's published microphone is represented");
    assert(state.segments.some((segment) => segment.words?.length));
    evidence.recognizedWords = state.segments.flatMap((segment) => segment.words || []).length;
    evidence.recognizedText = state.segments.map((segment) => segment.text).join(" ");
    evidence.automaticTranscription = { participants: clients.length, speakers: new Set(state.segments.map(segment => segment.speakerId)).size, microphoneConfirmationDialogs: 0, manualStart: false };
  });
  await check("STT uses only the existing microphone; screen/camera keep moving while it runs", async () => {
    for (const client of clients) assert.equal(await client.page.evaluate(() => window.testMicrophoneRequests), 1);
    const after = await guest.page.locator("video.screen-video").evaluate((video) => video.currentTime); assert(after - before > 5);
    const cameras = await guest.page.locator("video.camera-video").evaluateAll((videos) => videos.filter((video) => video.readyState >= 2 && video.videoWidth > 0).length); assert.equal(cameras, 2);
    assert(await host.page.getByRole("button", { name: "Silenciar micrófono", exact: true }).isVisible());
  });
  await check("Revoking consent from another tab stops capture/uploads and preserves the call", async () => {
    await request(host.token, `/rooms/${room.id}/transcription/consent`, { enabled: false });
    await host.page.getByText("Tu voz no se está capturando", { exact: false }).waitFor({ timeout: 12000 });
    await host.page.getByRole("button", { name: "Transcribir mi voz", exact: true }).click();
    await host.page.getByText("Escuchando tu micrófono", { exact: false }).waitFor();
    assert.equal(await host.page.evaluate(() => window.testMicrophoneRequests), 1);
    assert(await guest.page.getByRole("button", { name: "Silenciar micrófono", exact: true }).isVisible());
  });
  await check("Pausing one voice flushes its final chunk while the other participant keeps transcribing", async () => {
    const beforePause = await request(host.token, `/rooms/${room.id}/transcription`);
    const guestSegmentsBefore = beforePause.segments.filter((segment) => segment.speakerId === guest.uid).length;
    await host.page.getByRole("button", { name: "Dejar de transcribir mi voz", exact: true }).click();
    await host.page.getByText("Tu voz no se está capturando", { exact: false }).waitFor();
    await host.page.getByRole("button", { name: "Transcribir mi voz", exact: true }).waitFor({ timeout: 90000 });
    assert(await host.page.getByRole("button", { name: "Silenciar micrófono", exact: true }).isVisible());
    let state;
    for (let attempt = 0; attempt < 30; attempt++) {
      state = await request(host.token, `/rooms/${room.id}/transcription`);
      if (state.segments.filter((segment) => segment.speakerId === guest.uid).length > guestSegmentsBefore) break;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    assert.equal(state.participants.find((person) => person.userId === host.uid).enabled, false);
    assert.equal(state.participants.find((person) => person.userId === guest.uid).enabled, true);
    assert(state.segments.filter((segment) => segment.speakerId === guest.uid).length > guestSegmentsBefore, "Other voice continues producing new transcript fragments");
  });
  await guest.page.getByRole("button", { name: "Dejar de transcribir mi voz", exact: true }).click();
  await guest.page.getByRole("button", { name: "Transcribir mi voz", exact: true }).waitFor({ timeout: 90000 });
  await host.page.getByRole("button", { name: "Dejar de compartir pantalla", exact: true }).click();
  for (const [name, type, bytes] of [["Informe de StudyRoom.png", "image/png", await readFile(resolve(".local/ocr-fixture.png"))], ["Apuntes de la sesión.txt", "text/plain", Buffer.from("El área de un rectángulo se calcula multiplicando base por altura.")]]) {
    const form = new FormData(); form.append("file", new Blob([bytes], { type }), name);
    const response = await fetch(`http://127.0.0.1:3000/api/rooms/${room.id}/documents`, { method: "POST", headers: { Authorization: `Bearer ${host.token}` }, body: form });
    const document = await response.json(); assert(response.ok, document.message || "Synthetic upload failed"); uploaded.push(document.id);
  }
  await request(host.token, `/rooms/${room.id}/messages`, { text: "Mensaje escrito sintético conservado en el reporte.", clientId: crypto.randomUUID() });
  await request(host.token, `/rooms/${room.id}/close`, {});
  const state = await request(host.token, `/sessions/${room.sessionId}/report`);
  assert(state.messages.some((message) => message.text.includes("Mensaje escrito sintético")));
  await check("Historical report preserves both participants' voices and chat with speaker search", async () => {
    await host.page.goto(`${base}/sesiones/${room.sessionId}`);
    await host.page.getByRole("heading", { name: "La aplicación ya está instalada", exact: true }).waitFor();
    await host.page.getByRole("button", { name: "Continuar", exact: true }).click();
    await host.page.getByRole("heading", { name: "Lo que se habló" }).waitFor();
    await host.page.getByLabel("Buscar en la transcripción").fill("estudiando juntos");
    assert(await host.page.locator("#report-voice .transcript-list li").count() > 0);
    await host.page.getByLabel("Buscar en la transcripción").fill("palabra-imposible-xyz");
    await host.page.getByRole("heading", { name: "No hay coincidencias" }).waitFor();
    await host.page.getByLabel("Buscar en la transcripción").fill("");
    await host.page.getByText("Mensaje escrito sintético conservado en el reporte.", { exact: true }).waitFor();
    const history = await request(host.token, `/sessions/${room.sessionId}/report`);
    for (const client of clients) assert(history.transcription.segments.some((segment) => segment.speakerId === client.uid));
  });
  await check("Private questions use this report route and show durable progress/result", async () => {
    await host.page.getByLabel("¿Qué te gustaría entender?").fill("¿Qué dijo la voz registrada sobre el reporte?");
    await host.page.getByRole("button", { name: "Consultar este reporte", exact: true }).click();
    await host.page.locator("#report-questions .job-card").first().waitFor();
    await host.page.locator("#report-questions .job-completed").first().waitFor({ timeout: 240000 });
    const guestReport = await request(guest.token, `/sessions/${room.sessionId}/report`);
    assert(!guestReport.jobs.some((job) => job.kind === "answer"));
  });
  await check("Real authorized stored image/document previews and OCR appear in desktop/mobile report", async () => {
    const current = await request(host.token, `/sessions/${room.sessionId}/report`);
    assert.equal(current.documents.length, 2); assert(current.documents.some((document) => /base por altura/i.test(document.extractedText || "")));
    await host.page.getByRole("button", { name: "Ver imagen", exact: true }).waitFor(); await host.page.getByRole("button", { name: "Ver imagen", exact: true }).click(); await host.page.getByRole("dialog").waitFor();
    await host.page.waitForFunction(() => document.querySelector(".report-image-expanded")?.naturalWidth > 0); await host.page.getByRole("button", { name: "Cerrar ventana" }).click();
    await host.page.screenshot({ path: resolve(output, "session-report-desktop.png"), fullPage: true, animations: "disabled" });
    await host.page.setViewportSize({ width: 390, height: 844 });
    assert(await host.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await host.page.screenshot({ path: resolve(output, "session-report-mobile.png"), fullPage: true, animations: "disabled" });
  });
  assert.deepEqual(errors, []); evidence.status = "passed";
} catch (error) {
  evidence.status = "failed"; evidence.error = String(error);
  if (clients[0]?.page) await clients[0].page.screenshot({ path: resolve(output, "session-report-failure.png"), fullPage: true }).catch(() => {});
  throw error;
} finally {
  if (room && clients[0]) await request(clients[0].token, `/rooms/${room.id}/close`, {}).catch(() => {});
  if (room && clients[0]) for (const id of uploaded) await request(clients[0].token, `/rooms/${room.id}/documents/${id}`, undefined, "DELETE").catch(() => {});
  await browser?.close();
  for (const client of clients) await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:delete?key=demo-api-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: client.token }) }).catch(() => {});
  await writeFile(resolve(output, "session-report.json"), JSON.stringify(evidence, null, 2));
}
