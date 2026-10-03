import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { desktopHealthFixture, windowsUserAgent } from "./desktop-health-fixture.mjs";
const baseURL = process.env.WEB_BASE_URL || "http://localhost:5173/";
const output = process.env.TEST_OUTPUT_DIR
  ? pathToFileURL(`${resolve(process.env.TEST_OUTPUT_DIR)}/`)
  : new URL("../test-results/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  userAgent: windowsUserAgent,
});
context.setDefaultTimeout(90_000);
const desktopHealth = await desktopHealthFixture(context, "offline");
await context.route("**/desktop/Instalar-StudyRoom.exe", (route) =>
  route.fulfill({
    contentType: "application/octet-stream",
    headers: { "Content-Disposition": 'attachment; filename="Instalar-StudyRoom.exe"' },
    body: "StudyRoom test-only download fixture; never executable or installed.",
  }),
);
const page = await context.newPage();
const errors = [];
const expectedErrors = [];
let expectChunkFailure = false;
page.on("pageerror", (e) => {
  if (
    expectChunkFailure &&
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      e.message,
    )
  ) {
    expectedErrors.push(e.message);
  } else errors.push(e.message);
});
const email = `ui-${Date.now()}@example.test`,
  password = "StudyRoom-Test-2026";
let createdAccount;
let createdRoom;
const cleanup = {};
const responseTasks = [];
page.on("response", (response) => {
  if (!response.ok()) return;
  if (/accounts:signUp(?:\?|$)/.test(response.url())) {
    responseTasks.push(
      (async () => {
        const data = await response.json();
        if (data.email === email)
          createdAccount = {
            token: data.idToken,
            endpoint: response
              .url()
              .replace("accounts:signUp", "accounts:delete"),
          };
      })().catch(() => {}),
    );
  }
  if (
    response.request().method() === "POST" &&
    /\/api\/rooms$/.test(response.url())
  ) {
    responseTasks.push(
      (async () => {
        const data = await response.json();
        if (data.id)
          createdRoom = {
            id: data.id,
            base: response.url().replace(/\/rooms$/, ""),
          };
      })().catch(() => {}),
    );
  }
});
const results = [];
const accessibility = [];
async function auditAccessibility(name) {
  if (!process.env.AXE_SCRIPT_PATH) return;
  await page.addScriptTag({ path: resolve(process.env.AXE_SCRIPT_PATH) });
  const report = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return {
      version: result.testEngine.version,
      violations: result.violations.map(
        ({ id, impact, description, helpUrl, nodes }) => ({
          id,
          impact,
          description,
          helpUrl,
          nodes: nodes.map(({ target, failureSummary }) => ({
            target,
            failureSummary,
          })),
        }),
      ),
      passedRules: result.passes.length,
      incompleteRules: result.incomplete.map(({ id }) => id),
    };
  });
  accessibility.push({ name, ...report });
  console.log(`A11Y ${name}: ${report.violations.length} violations`);
}
async function step(name, fn) {
  await fn();
  results.push({ name, status: "passed" });
  console.log(`PASS ${name}`);
}
try {
  await step("Landing pública con acceso, registro y reporte sin cuestionarios", async () => {
    await page.goto(baseURL);
    await page.getByRole("heading", { name: "Aprende en compañía. Conserva cada idea.", exact: true }).waitFor();
    assert(await page.getByRole("link", { name: "Crear mi cuenta", exact: true }).first().isVisible());
    assert(await page.getByRole("link", { name: "Iniciar sesión", exact: true }).first().isVisible());
    assert.equal(await page.getByRole("heading", { name: /cuestionario|quiz/i }).count(), 0);
    assert.equal(await page.getByRole("button", { name: /cuestionario|quiz/i }).count(), 0);
    assert.equal(desktopHealth.requests.length, 0, "Guests can view the landing without a local installation check");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await auditAccessibility("landing-desktop");
    await page.screenshot({ path: new URL("landing-desktop.png", output).pathname.replace(/^\/([A-Z]:)/, "$1"), fullPage: true, animations: "disabled" });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await auditAccessibility("landing-mobile");
    await page.screenshot({ path: new URL("landing-mobile.png", output).pathname.replace(/^\/([A-Z]:)/, "$1"), fullPage: true, animations: "disabled" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole("link", { name: "Iniciar sesión", exact: true }).first().click();
  });
  await step(
    "Acceso accesible sin desbordamiento y error de credenciales",
    async () => {
      await page
        .getByRole("heading", { name: "Qué bueno verte de nuevo" })
        .waitFor();
      await auditAccessibility("access");
      await page.screenshot({
        path: new URL("access-desktop.png", output).pathname.replace(
          /^\/([A-Z]:)/,
          "$1",
        ),
        fullPage: true,
        animations: "disabled",
      });
      await page.getByLabel("Correo electrónico").fill("missing@example.test");
      await page
        .getByLabel("Contraseña", { exact: true })
        .fill("invalid-password");
      await page
        .getByRole("button", { name: "Iniciar sesión", exact: true })
        .click();
      await page
        .getByRole("alert")
        .filter({ hasText: "El correo o la contraseña no son correctos." })
        .waitFor();
    },
  );
  await step(
    "Registro de cuenta temporal y onboarding persistido",
    async () => {
      await page
        .getByRole("button", { name: "Regístrate", exact: true })
        .click();
      await page.getByLabel("Tu nombre").fill("Lucía Estudiante");
      await page.getByLabel("Correo electrónico").fill(email);
      await page.getByLabel("Contraseña", { exact: true }).fill(password);
      await page
        .getByRole("button", { name: "Crear cuenta", exact: true })
        .click();
      await step("Herramienta desconectada bloquea el acceso tras registrarse", async () => {
        await page.getByRole("heading", { name: "Prepara tus herramientas", exact: true }).waitFor();
        await page.getByText(/Todavía no detectamos la herramienta/).waitFor();
        assert.equal(await page.getByRole("heading", { name: "Hagamos este espacio tuyo", exact: true }).count(), 0);
        assert(desktopHealth.requests.some((request) => request.method === "GET" && request.mode === "offline"));
        await auditAccessibility("desktop-entry-gate");
        await page.screenshot({ path: new URL("desktop-entry-gate.png", output).pathname.replace(/^\/([A-Z]:)/, "$1"), fullPage: true, animations: "disabled" });
        desktopHealth.mode = "ready";
        await page.getByRole("button", { name: "Comprobar otra vez", exact: true }).click();
      });
      await page
        .getByRole("heading", { name: "Hagamos este espacio tuyo" })
        .waitFor();
      await page
        .getByLabel("Intereses de estudio")
        .fill("Matemáticas, Programación");
      await page
        .getByLabel("Sobre mí")
        .fill("Aprendo con ejemplos y trabajo en equipo.");
      await page.getByRole("button", { name: "Guardar perfil" }).click();
      await page.getByRole("heading", { name: /Hola, Lucía/ }).waitFor();
      await auditAccessibility("explore-desktop");
      await page
        .getByLabel("Buscar salas")
        .fill(`sin-resultados-${Date.now()}`);
      await page
        .getByRole("heading", { name: "Tu próxima sala puede empezar contigo" })
        .waitFor();
      await page
        .getByText("Prueba con otros filtros o busca un tema más general.", {
          exact: true,
        })
        .waitFor();
      await auditAccessibility("explore-empty");
      await page.getByLabel("Buscar salas").fill("");
    },
  );
  await step("Crear sala, entrar y persistir chat y notas", async () => {
    await page
      .getByRole("button", { name: "Crear sala", exact: true })
      .first()
      .click();
    await page.getByLabel("Nombre de la sala").fill("Cálculo en compañía");
    await page
      .getByLabel("¿Qué van a estudiar?")
      .fill("Vamos a resolver derivadas y compartir ejemplos paso a paso.");
    await page.getByLabel("Materia", { exact: true }).fill("Matemáticas");
    await page
      .getByRole("button", { name: "Crear sala", exact: true })
      .last()
      .click();
    if (process.env.CHECK_CHUNK_RECOVERY === "true") {
      await step(
        "Recuperación explícita tras fallo al descargar la vista de sala",
        async () => {
          const roomModule =
            /\/(?:src\/room\.tsx(?:\?.*)?|assets\/room-[^/]+\.js)$/;
          await page.route(roomModule, (route) => route.abort("failed"));
          expectChunkFailure = true;
          await page.getByRole("button", { name: "Volver a la sala" }).click();
          await page
            .getByRole("heading", { name: "No pudimos cargar esta vista" })
            .waitFor();
          await page.screenshot({
            path: new URL("chunk-recovery.png", output).pathname.replace(
              /^\/([A-Z]:)/,
              "$1",
            ),
            fullPage: true,
          });
          await page.unroute(roomModule);
          await page.getByRole("button", { name: "Reintentar carga" }).click();
          await page
            .getByRole("heading", { name: "Cálculo en compañía", level: 1 })
            .waitFor();
          expectChunkFailure = false;
        },
      );
    } else await page.getByRole("button", { name: "Volver a la sala" }).click();
    await page
      .getByRole("heading", { name: "Cálculo en compañía", level: 1 })
      .waitFor();
    await step("Descargar no habilita acceso; solo salud válida conserva el enlace original", async () => {
      desktopHealth.mode = "offline";
      const originalURL = new URL(page.url());
      originalURL.searchParams.set("gate", "check");
      await page.goto(originalURL.href);
      await page.getByRole("heading", { name: "Prepara tus herramientas", exact: true }).waitFor();
      await page.getByText(/Todavía no detectamos la herramienta/).waitFor();
      const downloadLink = page.getByRole("link", { name: "Descargar para Windows", exact: true });
      assert.equal(await downloadLink.getAttribute("href"), "/desktop/Instalar-StudyRoom.exe");
      assert.equal(await page.getByRole("link", { name: "Abrir herramientas instaladas", exact: true }).getAttribute("href"), "studyroom-tools://open");
      const downloadPromise = page.waitForEvent("download");
      await downloadLink.click();
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(), "Instalar-StudyRoom.exe");
      await download.delete();
      assert(await page.getByRole("heading", { name: "Prepara tus herramientas", exact: true }).isVisible());
      assert.equal(await page.getByRole("heading", { name: "Cálculo en compañía", level: 1 }).count(), 0);
      for (const mode of ["wrong-app", "old-version", "not-ready"]) {
        desktopHealth.mode = mode;
        const requestsBefore = desktopHealth.requests.length;
        const healthResponse = page.waitForResponse((response) => response.url() === "http://127.0.0.1:8790/v1/health" && response.request().method() === "GET");
        await page.getByRole("button", { name: "Comprobar otra vez", exact: true }).click();
        await healthResponse;
        await page.getByText(/Todavía no detectamos la herramienta/).waitFor();
        assert(desktopHealth.requests.slice(requestsBefore).some((request) => request.method === "GET" && request.mode === mode), `Health check made for ${mode}`);
        assert(await page.getByRole("heading", { name: "Prepara tus herramientas", exact: true }).isVisible());
      }
      desktopHealth.mode = "ready";
      await page.getByRole("button", { name: "Comprobar otra vez", exact: true }).click();
      await page.getByRole("heading", { name: "Cálculo en compañía", level: 1 }).waitFor();
      assert.equal(page.url(), originalURL.href, "Original room URL and query are retained after companion approval");
    });
    await page
      .getByLabel("Mensaje al grupo")
      .fill("Hola, hoy estudiaremos la regla de la cadena.");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await page
      .getByText("Hola, hoy estudiaremos la regla de la cadena.", {
        exact: true,
      })
      .waitFor();
    await page.getByRole("tab", { name: "Notas" }).click();
    await page
      .getByLabel("Mis notas privadas")
      .fill("Mi recordatorio privado de estudio.");
    await page.getByRole("button", { name: "Guardar notas" }).click();
    await page.getByText("Guardado", { exact: true }).waitFor();
    await page.reload();
    await page.getByRole("tab", { name: "Notas" }).click();
    await page.getByLabel("Mis notas privadas").waitFor();
    await page.waitForFunction(
      () =>
        document.querySelector('textarea[aria-label="Mis notas privadas"]')
          ?.value === "Mi recordatorio privado de estudio.",
    );
  });
  await step("Timer sincronizado y menú de personas", async () => {
    await page
      .getByRole("button", { name: "Iniciar temporizador", exact: true })
      .click();
    await page.getByRole("button", { name: "Pausar temporizador" }).waitFor();
    await page.getByRole("button", { name: "Pausar temporizador" }).click();
    await page.getByRole("tab", { name: /Personas/ }).click();
    await page.getByText("Lucía Estudiante (tú)", { exact: true }).waitFor();
    await auditAccessibility("room-people");
    await page.screenshot({
      path: new URL("room-desktop.png", output).pathname.replace(
        /^\/([A-Z]:)/,
        "$1",
      ),
      fullPage: true,
      animations: "disabled",
    });
  });
  await step("Historial, interfaz móvil y navegación por teclado", async () => {
    await page
      .getByRole("button", { name: "Finalizar sesión y guardar" })
      .click();
    await page
      .getByRole("button", { name: "Finalizar sesión", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Tu aprendizaje, en perspectiva" })
      .waitFor();
    await page.getByRole("link", { name: /Cálculo en compañía/ }).click();
    await page
      .getByRole("heading", { name: "Cálculo en compañía", level: 1 })
      .waitFor();
    await page
      .getByText("Mi recordatorio privado de estudio.", { exact: true })
      .waitFor();
    await auditAccessibility("session-history");
    await page.goto(baseURL);
    await page.getByRole("heading", { name: /Hola, Lucía/ }).waitFor();
    await page.screenshot({
      path: new URL("explore-desktop.png", output).pathname.replace(
        /^\/([A-Z]:)/,
        "$1",
      ),
      fullPage: true,
      animations: "disabled",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(
      () =>
        document.querySelector(".sidebar").getBoundingClientRect().right <= 1,
    );
    await page.screenshot({
      path: new URL("explore-mobile.png", output).pathname.replace(
        /^\/([A-Z]:)/,
        "$1",
      ),
      fullPage: true,
      animations: "disabled",
    });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "No horizontal overflow",
    );
    await auditAccessibility("explore-mobile");
    await page.getByRole("button", { name: "Abrir navegación" }).click();
    await page
      .getByRole("link", { name: "Mi perfil", exact: true })
      .first()
      .click();
    await page.getByLabel("Nombre visible").waitFor();
    await auditAccessibility("profile-mobile");
    await page.keyboard.press("Tab");
    assert(
      await page.evaluate(() => document.activeElement !== document.body),
      "Keyboard focus active",
    );
  });
  assert.deepEqual(errors, [], "No uncaught browser errors");
  if (accessibility.length)
    assert.equal(
      accessibility.reduce(
        (count, report) => count + report.violations.length,
        0,
      ),
      0,
      "No automated WCAG A/AA violations on inspected views",
    );
  await writeFile(
    new URL("browser-smoke.json", output),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        baseURL,
        results,
        errors,
        expectedErrors,
      },
      null,
      2,
    ),
  );
} catch (e) {
  await page.screenshot({
    path: new URL("failure.png", output).pathname.replace(/^\/([A-Z]:)/, "$1"),
    fullPage: true,
    animations: "disabled",
  });
  await writeFile(
    new URL("browser-smoke.json", output),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        baseURL,
        results,
        error: String(e),
        errors,
      },
      null,
      2,
    ),
  );
  throw e;
} finally {
  if (accessibility.length)
    await writeFile(
      new URL("accessibility.json", output),
      JSON.stringify(
        { at: new Date().toISOString(), baseURL, reports: accessibility },
        null,
        2,
      ),
    );
  await Promise.all(responseTasks);
  if (createdAccount) {
    if (createdRoom) {
      try {
        const response = await fetch(
          `${createdRoom.base}/rooms/${createdRoom.id}/close`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${createdAccount.token}`,
              "Content-Type": "application/json",
            },
            body: "{}",
            signal: AbortSignal.timeout(90_000),
          },
        );
        cleanup.roomClosed = response.ok;
        cleanup.roomStatus = response.status;
      } catch {
        cleanup.roomClosed = false;
      }
    }
    try {
      const response = await fetch(createdAccount.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: createdAccount.token }),
        signal: AbortSignal.timeout(30_000),
      });
      cleanup.accountDeleted = response.ok;
      cleanup.accountStatus = response.status;
    } catch {
      cleanup.accountDeleted = false;
    }
  }
  await writeFile(
    new URL("browser-cleanup.json", output),
    JSON.stringify({ at: new Date().toISOString(), ...cleanup }, null, 2),
  );
  console.log(`Cleanup: ${JSON.stringify(cleanup)}`);
  await browser.close();
}
