import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { desktopHealthFixture, windowsUserAgent } from "./desktop-health-fixture.mjs";
import { activateMicrophone } from "./media-actions.mjs";
const output = process.env.TEST_OUTPUT_DIR
  ? pathToFileURL(`${resolve(process.env.TEST_OUTPUT_DIR)}/`)
  : new URL("../test-results/", import.meta.url);
await mkdir(output, { recursive: true });
const evidence = {
  at: new Date().toISOString(),
  kind: "Two isolated browser contexts, synthetic camera/microphone and synthetic canvas screen through configured LiveKit SFU",
  limits:
    "Does not validate physical devices, distinct networks, real microphone intelligibility or four participants over 60 minutes.",
  checks: [],
};
const nonce = Date.now();
let room;
let browser;
const clients = [];
async function request(
  token,
  path,
  body,
  method = body === undefined ? "GET" : "POST",
) {
  const response = await fetch(`http://127.0.0.1:3000/api${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(`${method} ${path}: ${response.status} ${data.message}`);
  return data;
}
async function account(index) {
  const email = `media-${nonce}-${index}@example.test`,
    password = "StudyRoom-Test-2026";
  const response = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const data = await response.json();
  assert(response.ok, JSON.stringify(data));
  await request(data.idToken, "/me");
  await request(
    data.idToken,
    "/me",
    { displayName: `Prueba Media ${index}`, onboarded: true },
    "PATCH",
  );
  return { email, password, token: data.idToken, uid: data.localId };
}
async function check(name, fn) {
  await fn();
  evidence.checks.push({ name, status: "passed" });
  console.log(`PASS ${name}`);
}
async function menu(page) {
  const button = page.getByRole("button", {
    name: "Herramientas de señalamiento",
  });
  if ((await button.getAttribute("aria-expanded")) !== "true")
    await button.click();
}
async function selectTool(page, name) {
  await menu(page);
  await page.getByRole("button", { name, exact: true }).click();
}
async function draw(page, from, to) {
  await page.locator(".shared-screen").scrollIntoViewIfNeeded();
  const box = await page.locator(".shared-screen").boundingBox();
  await page.mouse.move(
    box.x + box.width * from.x,
    box.y + box.height * from.y,
  );
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * to.x, box.y + box.height * to.y, {
    steps: 8,
  });
  await page.mouse.up();
}
try {
  const host = await account(1),
    guest = await account(2);
  clients.push(host, guest);
  const usage = await request(host.token, "/usage");
  assert(
    usage.configured.media,
    "LiveKit must be configured; this test is never reported as a media pass without the SFU",
  );
  room = await request(host.token, "/rooms", {
    title: `Media sintética ${nonce}`,
    description:
      "Prueba automática de transporte audiovisual y señalamientos. Solo contenido sintético.",
    subject: "Calidad",
    privacy: "public",
    capacity: 2,
    durationMinutes: 15,
  });
  await request(guest.token, `/rooms/${room.id}/join`, {});
  browser = await chromium.launch({
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--autoplay-policy=no-user-gesture-required",
    ],
  });
  for (const client of clients) {
    client.context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      permissions: ["camera", "microphone"],
      userAgent: windowsUserAgent,
    });
    await desktopHealthFixture(client.context);
    client.page = await client.context.newPage();
    client.bridgeEvents = [];
    await client.context.route(
      "http://127.0.0.1:8790/v1/sharing",
      async (route) => {
        if (route.request().method() === "POST") {
          const body = route.request().postDataJSON();
          assert.deepEqual(Object.keys(body).sort(), ["active", "sessionId"]);
          client.bridgeEvents.push({ active: body.active, at: Date.now() });
        }
        await route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Headers": "content-type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          },
        });
      },
    );
    await client.page.addInitScript(() => {
      navigator.mediaDevices.getDisplayMedia = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext("2d");
        let frame = 0;
        const timer = setInterval(() => {
          ctx.fillStyle = "#173d35";
          ctx.fillRect(0, 0, 1280, 720);
          ctx.fillStyle = "#d1e8a9";
          ctx.font = "52px sans-serif";
          ctx.fillText("StudyRoom — pantalla sintética de prueba", 70, 170);
          ctx.fillStyle = "#edbe54";
          ctx.fillRect(100 + (frame++ % 900), 330, 70, 70);
          ctx.fillStyle = "#fff";
          ctx.font = "32px sans-serif";
          ctx.fillText(
            "El centro señalado se comparte con los participantes.",
            120,
            560,
          );
        }, 60);
        const stream = canvas.captureStream(15);
        stream
          .getVideoTracks()[0]
          .addEventListener("ended", () => clearInterval(timer));
        return stream;
      };
    });
    await client.page.goto("http://localhost:5173/acceso");
    await client.page.getByLabel("Correo electrónico").fill(client.email);
    await client.page
      .getByLabel("Contraseña", { exact: true })
      .fill(client.password);
    await client.page
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await client.page.getByRole("heading", { name: /Hola, Prueba/ }).waitFor();
    await client.page.goto(`http://localhost:5173/salas/${room.id}`);
    await client.page
      .getByRole("link", { name: "Dibujar en el escritorio", exact: true })
      .waitFor();
    assert.equal(
      await client.page
        .getByRole("link", { name: "Dibujar en el escritorio", exact: true })
        .getAttribute("href"),
      "studyroom-tools://open",
    );
    await client.page
      .getByRole("button", { name: "Primera vez / instalar" })
      .click();
    assert.equal(
      await client.page
        .getByRole("link", { name: "Descargar herramientas para Windows" })
        .getAttribute("href"),
      "/desktop/Instalar-StudyRoom.exe",
    );
    await client.page.getByRole("button", { name: "Cerrar ventana" }).click();
    await client.page
      .getByRole("button", { name: "Conectar videollamada" })
      .click();
    await client.page
      .locator(".connection-pill.connected")
      .waitFor({ timeout: 45000 });
  }
  evidence.checks.push({
    name: "Both participants can open desktop tools and installation help before sharing",
    status: "passed",
  });
  await check(
    "Two real SFU connections with synthetic camera and microphone",
    async () => {
      for (const c of clients) {
        await c.page
          .getByRole("button", { name: "Activar cámara", exact: true })
          .click();
        await activateMicrophone(c.page);
      }
      for (const c of clients) {
        await c.page.waitForFunction(
          () =>
            [...document.querySelectorAll("video.camera-video")].filter(
              (v) => v.videoWidth > 0 && v.readyState >= 2,
            ).length === 2,
          {},
          { timeout: 30000 },
        );
      }
      evidence.cameraVideoCounts = await Promise.all(
        clients.map((c) => c.page.locator("video.camera-video").count()),
      );
      assert.deepEqual(
        clients.map((client) => client.bridgeEvents.length),
        [0, 0],
        "Camera/microphone do not activate the desktop helper",
      );
    },
  );
  await check(
    "Synthetic screen reaches the second browser through LiveKit",
    async () => {
      await host.page
        .getByRole("button", { name: "Compartir pantalla", exact: true })
        .click();
      await guest.page
        .locator("video.screen-video")
        .waitFor({ timeout: 30000 });
      await guest.page.waitForFunction(
        () => document.querySelector("video.screen-video")?.videoWidth === 1280,
      );
      await host.page.getByText(/Menú de escritorio conectado/).waitFor();
      assert(host.bridgeEvents.some((event) => event.active));
      assert.equal(
        guest.bridgeEvents.length,
        0,
        "Remote screen viewing does not activate the desktop helper",
      );
    },
  );
  await check(
    "Compact camera menu shares a normalized point; guest cannot annotate",
    async () => {
      await host.page
        .getByRole("button", { name: "Herramientas de señalamiento" })
        .click();
      await host.page
        .getByRole("button", { name: "Puntero", exact: true })
        .click();
      const box = await host.page.locator(".shared-screen").boundingBox();
      await host.page.mouse.click(
        box.x + box.width * 0.5,
        box.y + box.height * 0.5,
      );
      await guest.page
        .locator('.annotation-overlay circle[fill="#f6bf4f"]')
        .waitFor();
      assert.equal(
        await guest.page
          .locator('.annotation-overlay circle[fill="#f6bf4f"]')
          .getAttribute("cx"),
        "500",
      );
      await guest.page
        .getByRole("button", { name: "Herramientas de señalamiento" })
        .click();
      assert(
        await guest.page
          .getByRole("button", { name: "Puntero", exact: true })
          .isDisabled(),
      );
    },
  );
  await check(
    "Role update permits keyboard annotations at a different receiver size",
    async () => {
      await request(
        host.token,
        `/rooms/${room.id}/members/${guest.uid}`,
        { role: "moderator" },
        "PATCH",
      );
      await guest.page
        .getByRole("button", { name: "Puntero", exact: true })
        .waitFor();
      await guest.page.waitForFunction(() =>
        [...document.querySelectorAll("button")].some(
          (b) => b.textContent === "Puntero" && !b.disabled,
        ),
      );
      await guest.page.setViewportSize({ width: 430, height: 932 });
      await guest.page
        .getByRole("button", { name: "Puntero", exact: true })
        .click();
      await guest.page.locator(".shared-screen").focus();
      await guest.page.keyboard.press("ArrowRight");
      await guest.page.keyboard.press("Enter");
      await host.page.waitForFunction(
        () =>
          document
            .querySelector('.annotation-overlay circle[fill="#f6bf4f"]')
            ?.getAttribute("cx") === "520",
      );
      await guest.page.screenshot({
        path: fileURLToPath(new URL("media-mobile.png", output)),
        fullPage: true,
        animations: "disabled",
      });
      await host.page.screenshot({
        path: fileURLToPath(new URL("media-desktop.png", output)),
        fullPage: true,
        animations: "disabled",
      });
    },
  );
  await check(
    "Full tool set shares geometry, escaped text, color and erases only the selected mark",
    async () => {
      await menu(host.page);
      await host.page
        .getByLabel("Grosor del trazo", { exact: true })
        .selectOption("6");
      await host.page.getByLabel("Color del señalamiento").evaluate((input) => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        ).set.call(input, "#2468ac");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      for (const [name, action, from, to] of [
        ["Rectángulo", "rectangle", { x: 0.12, y: 0.15 }, { x: 0.35, y: 0.38 }],
        ["Óvalo", "ellipse", { x: 0.55, y: 0.1 }, { x: 0.82, y: 0.35 }],
        ["Línea", "line", { x: 0.6, y: 0.6 }, { x: 0.8, y: 0.8 }],
        ["Flecha", "arrow", { x: 0.2, y: 0.7 }, { x: 0.4, y: 0.8 }],
        ["Lápiz", "stroke", { x: 0.1, y: 0.55 }, { x: 0.4, y: 0.55 }],
      ]) {
        await selectTool(host.page, name);
        await draw(host.page, from, to);
        await guest.page
          .locator(`[data-annotation-action="${action}"]`)
          .waitFor({ state: "attached" });
        assert.equal(
          await guest.page
            .locator(`[data-annotation-action="${action}"] [stroke]`)
            .first()
            .getAttribute("stroke"),
          "#2468ac",
        );
        assert.equal(
          await guest.page
            .locator(`[data-annotation-action="${action}"] [stroke]`)
            .first()
            .getAttribute("stroke-width"),
          "6",
        );
      }
      await selectTool(host.page, "Texto");
      await host.page
        .getByLabel("Texto para colocar")
        .fill("Área de estudio <texto>");
      await host.page.getByLabel("Tamaño de letra").selectOption("36");
      await host.page
        .getByRole("button", { name: "Colocar texto", exact: true })
        .click();
      const box = await host.page.locator(".shared-screen").boundingBox();
      await host.page.mouse.click(
        box.x + box.width * 0.5,
        box.y + box.height * 0.42,
      );
      await guest.page
        .locator('[data-annotation-action="text"] text')
        .waitFor();
      assert.equal(
        await guest.page
          .locator('[data-annotation-action="text"] text')
          .getAttribute("font-size"),
        "36",
      );
      assert.equal(
        await guest.page
          .locator('[data-annotation-action="text"] text')
          .textContent(),
        "Área de estudio <texto>",
      );
      assert.equal(
        await host.page.locator('[data-annotation-action="text"] text').count(),
        1,
      );
      await menu(host.page);
      await host.page.screenshot({
        path: fileURLToPath(new URL("full-tools-desktop.png", output)),
        fullPage: true,
        animations: "disabled",
      });
      await guest.page.screenshot({
        path: fileURLToPath(new URL("full-tools-receiver-mobile.png", output)),
        fullPage: true,
        animations: "disabled",
      });
      await selectTool(host.page, "Borrador");
      await host.page.mouse.click(
        box.x + box.width * 0.12,
        box.y + box.height * 0.25,
      );
      await guest.page
        .locator('[data-annotation-action="rectangle"]')
        .waitFor({ state: "detached" });
      assert.equal(
        await guest.page.locator('[data-annotation-action="ellipse"]').count(),
        1,
      );
      assert.equal(
        await guest.page.locator('[data-annotation-action="text"]').count(),
        1,
      );
    },
  );
  await check(
    "Clearing and stopping screen removes shared signals",
    async () => {
      await menu(host.page);
      await host.page
        .getByRole("button", { name: "Borrar señales", exact: true })
        .click();
      await guest.page.waitForFunction(
        () =>
          document.querySelectorAll(
            ".annotation-overlay [data-annotation-action]",
          ).length === 0,
      );
      await host.page
        .getByRole("button", {
          name: "Dejar de compartir pantalla",
          exact: true,
        })
        .click();
      await guest.page.locator(".shared-screen").waitFor({ state: "detached" });
      const deadline = Date.now() + 3000;
      while (
        !host.bridgeEvents.some((event) => event.active === false) &&
        Date.now() < deadline
      )
        await new Promise((resolve) => setTimeout(resolve, 50));
      assert.equal(
        host.bridgeEvents.at(-1)?.active,
        false,
        "Stopping the screen promptly releases the desktop menu",
      );
      evidence.desktopBridge = {
        kind: "Browser lifecycle with test-only HTTP204 bridge stub; native lifecycle verified separately",
        activatesOnlyForLocalScreen: true,
        stopReleased: true,
        cameraTriggered: false,
        requests: host.bridgeEvents.length,
      };
    },
  );
  evidence.status = "passed";
} catch (e) {
  evidence.status = "failed";
  evidence.error = String(e);
  if (clients[0]?.page)
    await clients[0].page
      .screenshot({
        path: fileURLToPath(new URL("media-failure.png", output)),
        fullPage: true,
        animations: "disabled",
      })
      .catch(() => {});
  throw e;
} finally {
  if (room && clients[0])
    await request(clients[0].token, `/rooms/${room.id}/close`, {}).catch(
      () => {},
    );
  await browser?.close();
  await writeFile(
    new URL("media-collaboration.json", output),
    JSON.stringify(evidence, null, 2),
  );
}
