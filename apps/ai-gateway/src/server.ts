import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { freemem } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { BASE_MODEL, CONTEXT_TOKENS, MAX_BODY_BYTES, MAX_RESPONSE_BYTES, MODEL, type GatewayConfig } from './config.js';
import { authorized, GatewayError, parseInput, SingleQueue, UsageMeter, type GenerateInput } from './core.js';

export interface Usage { inputTokens: number; outputTokens: number; totalDurationMs: number; tokensPerSecond: number; firstTokenMs: number | null }
interface OllamaPart { error?: string; done?: boolean; done_reason?: string; message?: { content?: string }; prompt_eval_count?: number; eval_count?: number; total_duration?: number; eval_duration?: number; }
interface Dependencies { fetch?: typeof fetch; freeMemory?: () => number; now?: () => Date; log?: (event: Record<string, unknown>) => void; }

async function readBody(req: IncomingMessage, meter: UsageMeter): Promise<unknown> {
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) throw new GatewayError(415, 'INVALID_CONTENT_TYPE', 'Usa application/json.');
  const declared = Number(req.headers['content-length'] ?? 0);
  if (!Number.isFinite(declared) || declared > MAX_BODY_BYTES) throw new GatewayError(413, 'BODY_TOO_LARGE', 'La petición es demasiado grande.');
  const chunks: Buffer[] = [];
  let count = 0;
  for await (const part of req) {
    const bytes = Buffer.isBuffer(part) ? part : Buffer.from(part);
    count += bytes.length;
    meter.received(bytes.length);
    if (count > MAX_BODY_BYTES) throw new GatewayError(413, 'BODY_TOO_LARGE', 'La petición es demasiado grande.');
    chunks.push(bytes);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new GatewayError(400, 'INVALID_JSON', 'JSON inválido.'); }
}

export function createGateway(config: GatewayConfig, dependencies: Dependencies = {}) {
  const fetcher = dependencies.fetch ?? fetch;
  const freeMemory = dependencies.freeMemory ?? freemem;
  const log = dependencies.log ?? (event => console.info(JSON.stringify(event)));
  const meter = new UsageMeter(config, dependencies.now);
  const queue = new SingleQueue(config.queueLimit);
  const controllers = new Set<AbortController>();
  let stopped = false;

  function pauseMode() {
    const path = join(config.stateDir, 'pause');
    if (!existsSync(path)) return null;
    return readFileSync(path, 'utf8').trim() === 'background' ? 'background' : 'all';
  }
  function ensureResources(input: GenerateInput) {
    if (stopped) throw new GatewayError(503, 'AI_OFFLINE', 'La IA se está apagando.', 30);
    const pause = pauseMode();
    if (pause === 'all' || (pause === 'background' && input.priority === 'background')) throw new GatewayError(503, 'AI_PAUSED', 'La IA está en pausa para reservar recursos a la llamada.', 60);
    if (freeMemory() < config.minFreeMemoryMb * 1024 * 1024) throw new GatewayError(503, 'LOW_MEMORY', 'La IA espera a que el PC tenga memoria disponible.', 30);
  }
  function json(res: ServerResponse, status: number, body: unknown) {
    if (res.destroyed || res.writableEnded) return;
    const text = JSON.stringify(body);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    meter.sent(Buffer.byteLength(text) + 256);
    res.end(text);
  }

  async function generate(input: GenerateInput, signal: AbortSignal, emit: (text: string) => Promise<void>): Promise<{text: string; model: string; usage: Usage}> {
    ensureResources(input);
    const started = performance.now();
    const response = await fetcher('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: input.system }, { role: 'user', content: input.prompt }], stream: true, think: false, keep_alive: '60s', options: { num_ctx: CONTEXT_TOKENS, num_predict: input.maxTokens, num_thread: config.cpuThreads, temperature: .3 } }),
      signal,
      redirect: 'error',
    });
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      if (response.status === 404) throw new GatewayError(503, 'MODEL_NOT_READY', 'El modelo local todavía no está instalado.', 60);
      if (response.status === 429 || response.status === 503) throw new GatewayError(503, 'AI_BUSY', 'El motor local está ocupado. Reintenta después.', 10);
      throw new GatewayError(503, 'AI_OFFLINE', 'El motor local no está disponible.', 30);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let answer = '';
    let totalBytes = 0;
    let final: OllamaPart | undefined;
    let firstTokenMs: number | null = null;
    async function part(line: string) {
      if (!line.trim()) return;
      let event: OllamaPart;
      try { event = JSON.parse(line); } catch { throw new GatewayError(502, 'INVALID_UPSTREAM', 'El motor local devolvió una respuesta incompleta.'); }
      if (event.error) throw new GatewayError(503, 'AI_OFFLINE', 'El motor local no pudo completar la consulta.', 30);
      if (typeof event.message?.content === 'string' && event.message.content) {
        firstTokenMs ??= Math.round(performance.now() - started);
        answer += event.message.content;
        if (Buffer.byteLength(answer, 'utf8') > MAX_RESPONSE_BYTES) throw new GatewayError(502, 'OUTPUT_LIMIT', 'La respuesta excedió el límite permitido.');
        await emit(event.message.content);
      }
      if (event.done) final = event;
    }
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.length;
        if (totalBytes > 4 * 1024 * 1024) throw new GatewayError(502, 'OUTPUT_LIMIT', 'Respuesta local demasiado grande.');
        buffer += decoder.decode(value, { stream: true });
        let end: number;
        while ((end = buffer.indexOf('\n')) >= 0) { await part(buffer.slice(0, end)); buffer = buffer.slice(end + 1); }
        if (buffer.length > 262_144) throw new GatewayError(502, 'INVALID_UPSTREAM', 'Fragmento local demasiado grande.');
      }
      buffer += decoder.decode();
      if (buffer.trim()) await part(buffer);
      if (!final || !answer.trim()) throw new GatewayError(502, 'INVALID_UPSTREAM', 'La IA no produjo una respuesta completa.');
      if (final.done_reason === 'length') throw new GatewayError(502, 'OUTPUT_LIMIT', 'La respuesta alcanzó el límite de salida. Reduce el alcance de la consulta antes de reintentar.');
      const inputTokens = final.prompt_eval_count ?? 0;
      const outputTokens = final.eval_count ?? 0;
      const duration = (final.eval_duration ?? 0) / 1e9;
      const usage: Usage = { inputTokens, outputTokens, totalDurationMs: Math.round(performance.now() - started), firstTokenMs, tokensPerSecond: duration > 0 ? Math.round(outputTokens / duration * 100) / 100 : 0 };
      meter.generation(inputTokens, outputTokens);
      log({ event: 'generation', model: MODEL, priority: input.priority, ...usage });
      return { text: answer, model: MODEL, usage };
    } finally { await reader.cancel().catch(() => {}); }
  }

  const server = createServer({ maxHeaderSize: 8192, requestTimeout: 15_000, headersTimeout: 10_000 }, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    res.setHeader('Connection', 'close');
    // No CORS: this endpoint is server-to-server and never called by browser clients.
    const controller = new AbortController();
    controllers.add(controller);
    let timedOut = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let release: (() => void) | undefined;
    let streamOpened = false;
    let streamedBytes = 0;
    const disconnected = () => { if (!res.writableEnded) controller.abort(); };
    req.on('aborted', disconnected);
    res.on('close', disconnected);
    try {
      meter.recordRequest();
      if (req.method === 'GET' && req.url === '/health') { json(res, 200, { status: stopped ? 'stopping' : 'ok' }); return; }
      if (!authorized(req.headers.authorization, config.secret)) throw new GatewayError(401, 'UNAUTHORIZED', 'Credencial no válida.');
      if (req.method === 'GET' && req.url === '/v1/health') {
        let ready = false;
        let modelDigest: string | null = null;
        try {
          const tags = await fetcher('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(3000), redirect: 'error' });
          if (tags.ok) {
            const data = await tags.json() as { models?: {name: string; digest: string}[] };
            const model = data.models?.find(item => item.name === MODEL);
            ready = !!model;
            modelDigest = model?.digest ?? null;
          }
        } catch { /* Report readiness without leaking local network errors. */ }
        const usage = meter.snapshot();
        json(res, 200, { status: ready && !pauseMode() && !usage.exhausted && usage.persistenceHealthy ? 'ready' : 'unavailable', model: MODEL, baseModel: BASE_MODEL, modelDigest, ollamaReady: ready, pause: pauseMode(), queue: queue.state, usage, freeMemoryMb: Math.floor(freeMemory() / 1024 / 1024), contextTokens: CONTEXT_TOKENS, localOnly: true });
        return;
      }
      meter.assertQuota();
      if (req.method !== 'POST' || req.url !== '/v1/generate') throw new GatewayError(404, 'NOT_FOUND', 'Ruta no disponible.');
      meter.assertRate();
      const input = parseInput(await readBody(req, meter));
      ensureResources(input);
      // Reserve worst-case response + NDJSON overhead before allowing generation.
      release = meter.reserve(MAX_RESPONSE_BYTES * 2);
      timeout = setTimeout(() => { timedOut = true; controller.abort(); }, config.timeoutMs);
      const result = await queue.add(input.priority, controller.signal, () => generate(input, controller.signal, async text => {
        if (!input.stream || controller.signal.aborted || res.destroyed) return;
        if (!streamOpened) { streamOpened = true; res.statusCode = 200; res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8'); }
        const line = JSON.stringify({ type: 'delta', text }) + '\n';
        streamedBytes += Buffer.byteLength(line);
        if (streamedBytes > MAX_RESPONSE_BYTES * 2 - 2048) throw new GatewayError(502, 'OUTPUT_LIMIT', 'La respuesta excedió el límite de transferencia.');
        meter.sent(Buffer.byteLength(line));
        if (!res.write(line)) await once(res, 'drain', { signal: controller.signal });
      }));
      if (input.stream) {
        if (res.destroyed) return;
        if (!res.headersSent) res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        const line = JSON.stringify({ type: 'done', model: result.model, usage: result.usage }) + '\n';
        meter.sent(Buffer.byteLength(line) + 256);
        res.end(line);
      } else json(res, 200, result);
    } catch (error) {
      let safe = error instanceof GatewayError ? error : new GatewayError(503, 'AI_OFFLINE', 'El PC o el motor de IA no está disponible.', 30);
      if (timedOut) safe = new GatewayError(504, 'AI_TIMEOUT', 'La consulta excedió el tiempo máximo. Puedes volver a intentarlo.', 10);
      else if (controller.signal.aborted) safe = new GatewayError(499, 'CANCELLED', 'La consulta fue cancelada.');
      log({ event: 'request_error', code: safe.code, status: safe.status });
      if (res.destroyed || res.writableEnded) return;
      if (streamOpened) {
        const line = JSON.stringify({ type: 'error', code: safe.code, message: safe.message, retryAfter: safe.retryAfter }) + '\n';
        meter.sent(Buffer.byteLength(line));
        res.end(line);
      } else {
        if (safe.retryAfter) res.setHeader('Retry-After', safe.retryAfter);
        if (safe.status === 401) res.setHeader('WWW-Authenticate', 'Bearer');
        json(res, safe.status, { code: safe.code, message: safe.message, retryAfter: safe.retryAfter });
      }
    } finally {
      if (timeout) clearTimeout(timeout);
      release?.();
      controllers.delete(controller);
      req.off('aborted', disconnected);
      res.off('close', disconnected);
    }
  });
  server.maxConnections = 32;
  server.on('clientError', (_error, socket) => { socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'); });
  return {
    server,
    meter,
    queue,
    async shutdown() {
      stopped = true;
      controllers.forEach(controller => controller.abort());
      server.closeAllConnections();
      await new Promise<void>(resolve => server.close(() => resolve()));
    },
  };
}
