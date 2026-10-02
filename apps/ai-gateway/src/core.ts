import { createHash, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTEXT_TOKENS, MAX_OUTPUT_TOKENS, TEMPLATE_TOKEN_RESERVE, type GatewayConfig } from './config.js';

export class GatewayError extends Error {
  constructor(public status: number, public code: string, message: string, public retryAfter?: number) {
    super(message);
  }
}

export function authorized(header: string | undefined, secret: string) {
  // Hash to fixed length before comparing, including malformed/missing credentials.
  const candidate = header?.startsWith('Bearer ') ? header.slice(7) : '';
  return timingSafeEqual(createHash('sha256').update(candidate).digest(), createHash('sha256').update(secret).digest());
}

export type Priority = 'interactive' | 'background';
export interface GenerateInput { prompt: string; system: string; maxTokens: number; stream: boolean; priority: Priority }

export function parseInput(value: unknown): GenerateInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new GatewayError(400, 'INVALID_INPUT', 'Se requiere un objeto JSON.');
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !['prompt', 'system', 'maxTokens', 'stream', 'priority'].includes(key))) {
    throw new GatewayError(400, 'INVALID_INPUT', 'La petición contiene campos no permitidos. El modelo se configura únicamente en este PC.');
  }
  if (typeof data.prompt !== 'string' || !data.prompt.trim() || (data.system !== undefined && typeof data.system !== 'string')) {
    throw new GatewayError(400, 'INVALID_INPUT', 'prompt debe tener texto y system debe ser texto.');
  }
  const maxTokens = data.maxTokens ?? 512;
  if (!Number.isInteger(maxTokens) || Number(maxTokens) < 1 || Number(maxTokens) > MAX_OUTPUT_TOKENS) {
    throw new GatewayError(400, 'INVALID_INPUT', `maxTokens debe estar entre 1 y ${MAX_OUTPUT_TOKENS}.`);
  }
  if (data.stream !== undefined && typeof data.stream !== 'boolean') throw new GatewayError(400, 'INVALID_INPUT', 'stream debe ser booleano.');
  if (data.priority !== undefined && !['interactive', 'background'].includes(String(data.priority))) throw new GatewayError(400, 'INVALID_INPUT', 'Prioridad no válida.');
  const system = (data.system as string | undefined) ?? 'Eres un tutor de StudyRoom. Responde en español. Usa únicamente el contexto autorizado recibido y distingue los hechos de las inferencias. Si falta información, dilo.';
  // UTF-8 bytes provide a deliberately conservative upper bound for byte-level tokenization.
  // Reject, never silently truncate an authorized source. Caller can split long documents.
  if (Buffer.byteLength(data.prompt + system, 'utf8') + Number(maxTokens) + TEMPLATE_TOKEN_RESERVE > CONTEXT_TOKENS) {
    throw new GatewayError(413, 'CONTEXT_TOO_LONG', `Divide el contexto: prompt + system deben ocupar como máximo ${CONTEXT_TOKENS - Number(maxTokens) - TEMPLATE_TOKEN_RESERVE} bytes UTF-8.`);
  }
  return { prompt: data.prompt, system, maxTokens: Number(maxTokens), stream: data.stream === true, priority: data.priority === 'background' ? 'background' : 'interactive' };
}

interface Entry<T = unknown> { priority: Priority; run: () => Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void; signal: AbortSignal; abort: () => void }

export class SingleQueue {
  private pending: Entry<any>[] = [];
  private active = false;
  private interactiveStreak = 0;
  constructor(private limit: number) {}
  get state() { return { active: this.active ? 1 : 0, waiting: this.pending.length, capacity: this.limit }; }
  add<T>(priority: Priority, signal: AbortSignal, run: () => Promise<T>): Promise<T> {
    if (signal.aborted) return Promise.reject(new GatewayError(499, 'CANCELLED', 'Solicitud cancelada.'));
    if (this.active && this.pending.length >= this.limit) return Promise.reject(new GatewayError(429, 'QUEUE_FULL', 'La IA está ocupada. Reintenta en unos segundos.', 10));
    return new Promise<T>((resolve, reject) => {
      const entry: Entry<T> = { priority, run, resolve, reject, signal, abort: () => {
        const index = this.pending.indexOf(entry);
        if (index >= 0) {
          this.pending.splice(index, 1);
          reject(new GatewayError(499, 'CANCELLED', 'Solicitud cancelada antes de ejecutarse.'));
        }
      } };
      signal.addEventListener('abort', entry.abort, { once: true });
      this.pending.push(entry);
      this.drain();
    });
  }
  private drain() {
    if (this.active || !this.pending.length) return;
    // Prefer interactive work, with one background slot after three interactive requests.
    const background = this.pending.findIndex((entry) => entry.priority === 'background');
    const interactive = this.pending.findIndex((entry) => entry.priority === 'interactive');
    const index = this.interactiveStreak >= 3 && background >= 0 ? background : interactive >= 0 ? interactive : 0;
    const entry = this.pending.splice(index, 1)[0]!;
    entry.signal.removeEventListener('abort', entry.abort);
    if (entry.signal.aborted) { entry.reject(new GatewayError(499, 'CANCELLED', 'Solicitud cancelada.')); this.drain(); return; }
    this.active = true;
    this.interactiveStreak = entry.priority === 'interactive' ? this.interactiveStreak + 1 : 0;
    Promise.resolve().then(entry.run).then(entry.resolve, entry.reject).finally(() => { this.active = false; this.drain(); });
  }
}

export interface Ledger { month: string; requests: number; receivedBytes: number; sentBytes: number; reservedBytes: number; generations: number; inputTokens: number; outputTokens: number; updatedAt: string }

export function persistLedger(path: string, content: string, io = { writeFileSync, renameSync }, pause = (ms: number) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }) {
  const tmp = `${path}.tmp`;
  io.writeFileSync(tmp, content, { mode: 0o600 });
  // Windows readers/antivirus can briefly hold the destination without delete sharing.
  // Preserve the old atomic file and retry; never unlink it or fall back to a torn write.
  for (let attempt = 0; ; attempt++) {
    try { io.renameSync(tmp, path); return; }
    catch (error) {
      if (attempt >= 4 || !['EPERM', 'EBUSY', 'EACCES'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
      pause((attempt + 1) * 10);
    }
  }
}

export class UsageMeter {
  private data: Ledger;
  private path: string;
  private timestamps: number[] = [];
  private persistenceHealthy = true;
  constructor(private config: GatewayConfig, private now: () => Date = () => new Date(), private persist: (path: string, content: string) => void = persistLedger) {
    mkdirSync(config.stateDir, { recursive: true, mode: 0o700 });
    this.path = join(config.stateDir, 'usage.json');
    this.data = this.fresh();
    if (existsSync(this.path)) {
      const data: Ledger = JSON.parse(readFileSync(this.path, 'utf8'));
      if (typeof data.month !== 'string' || ['requests', 'receivedBytes', 'sentBytes', 'reservedBytes', 'generations', 'inputTokens', 'outputTokens'].some(key => !Number.isFinite(data[key as keyof Ledger]) || Number(data[key as keyof Ledger]) < 0)) {
        throw new Error('El registro de cuotas local es inválido. Corrígelo contra el panel de ngrok antes de arrancar.');
      }
      this.data = data;
      // Reservations left by an abrupt exit remain charged conservatively.
      this.data.sentBytes += this.data.reservedBytes;
      this.data.reservedBytes = 0;
    }
    this.rollover();
    if (!this.save()) throw new Error('No se puede guardar el registro de cuotas local. Revisa permisos y espacio disponible.');
  }
  private fresh(): Ledger { return { month: this.now().toISOString().slice(0, 7), requests: 0, receivedBytes: 0, sentBytes: 0, reservedBytes: 0, generations: 0, inputTokens: 0, outputTokens: 0, updatedAt: this.now().toISOString() }; }
  private rollover() { if (this.data.month !== this.now().toISOString().slice(0, 7)) this.data = this.fresh(); }
  private save() {
    this.data.updatedAt = this.now().toISOString();
    try {
      this.persist(this.path, JSON.stringify(this.data));
      this.persistenceHealthy = true;
    } catch {
      // Reject new generation when durable accounting is unavailable. Existing durable
      // reservations remain conservatively charged; cleanup must never crash the server.
      this.persistenceHealthy = false;
    }
    return this.persistenceHealthy;
  }
  recordRequest() { this.rollover(); this.data.requests++; this.data.receivedBytes += 1024; this.save(); }
  received(bytes: number) { this.data.receivedBytes += bytes; this.save(); }
  sent(bytes: number) { this.data.sentBytes += bytes; this.save(); }
  assertQuota(reservation = 0) {
    this.rollover();
    if (!this.persistenceHealthy) throw new GatewayError(503, 'QUOTA_STORAGE_UNAVAILABLE', 'No se pueden guardar las cuotas del PC. Revisa permisos y espacio disponible.', 30);
    if (this.data.requests > this.config.monthlyRequestLimit || this.data.receivedBytes + this.data.sentBytes + this.data.reservedBytes + reservation > this.config.monthlyByteLimit) {
      throw new GatewayError(429, 'QUOTA_EXCEEDED', 'Cupo gratuito local agotado. El túnel debe permanecer detenido hasta revisar el panel de ngrok.', 3600);
    }
  }
  assertRate() {
    const now = this.now().getTime();
    this.timestamps = this.timestamps.filter(time => time > now - 60_000);
    if (this.timestamps.length >= this.config.requestsPerMinute) throw new GatewayError(429, 'RATE_LIMIT', 'Espera antes de enviar más consultas.', 60);
    this.timestamps.push(now);
  }
  reserve(bytes: number) { this.assertQuota(bytes); this.data.reservedBytes += bytes; if (!this.save()) this.assertQuota(); return () => { this.data.reservedBytes = Math.max(0, this.data.reservedBytes - bytes); this.save(); }; }
  generation(inputTokens: number, outputTokens: number) { this.data.generations++; this.data.inputTokens += inputTokens; this.data.outputTokens += outputTokens; this.save(); }
  snapshot() {
    this.rollover();
    const bytes = this.data.receivedBytes + this.data.sentBytes;
    return { ...this.data, persistenceHealthy: this.persistenceHealthy, limits: { requests: this.config.monthlyRequestLimit, bytes: this.config.monthlyByteLimit }, warning: !this.persistenceHealthy || this.data.requests >= this.config.monthlyRequestLimit * .8 || bytes >= this.config.monthlyByteLimit * .8, exhausted: this.data.requests >= this.config.monthlyRequestLimit || bytes >= this.config.monthlyByteLimit, approximate: true };
  }
}
