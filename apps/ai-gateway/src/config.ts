import { resolve } from 'node:path';

export const MODEL = 'qwen3:4b-instruct';
export const BASE_MODEL = 'qwen3:4b-instruct';
export const CONTEXT_TOKENS = 4096;
export const MAX_OUTPUT_TOKENS = 1024;
export const TEMPLATE_TOKEN_RESERVE = 256;
export const MAX_BODY_BYTES = 16_384;
export const MAX_RESPONSE_BYTES = 131_072;

export interface GatewayConfig {
  secret: string;
  port: number;
  stateDir: string;
  timeoutMs: number;
  requestsPerMinute: number;
  monthlyRequestLimit: number;
  monthlyByteLimit: number;
  queueLimit: number;
  minFreeMemoryMb: number;
  cpuThreads: number;
}

function integer(env: NodeJS.ProcessEnv, key: string, fallback: number, min: number, max: number) {
  const value = env[key] === undefined ? fallback : Number(env[key]);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${key} debe ser un entero entre ${min} y ${max}.`);
  }
  return value;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  const secret = env.AI_GATEWAY_SECRET ?? '';
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(secret) || /replace|example|change|secret/i.test(secret)) {
    throw new Error('AI_GATEWAY_SECRET debe ser un secreto aleatorio de al menos 256 bits. Ejecuta setup.ps1.');
  }
  return {
    secret,
    port: integer(env, 'AI_GATEWAY_PORT', 8787, 1024, 65535),
    stateDir: resolve(env.AI_STATE_DIR ?? '.local'),
    timeoutMs: integer(env, 'AI_REQUEST_TIMEOUT_MS', 120_000, 1000, 180_000),
    requestsPerMinute: integer(env, 'AI_REQUESTS_PER_MINUTE', 12, 1, 60),
    monthlyRequestLimit: integer(env, 'AI_MONTHLY_REQUEST_LIMIT', 18_000, 1, 18_000),
    monthlyByteLimit: integer(env, 'AI_MONTHLY_BYTE_LIMIT', 900_000_000, 16_384, 900_000_000),
    queueLimit: integer(env, 'AI_QUEUE_LIMIT', 8, 0, 16),
    minFreeMemoryMb: integer(env, 'AI_MIN_FREE_MEMORY_MB', 2048, 512, 16_384),
    cpuThreads: integer(env, 'AI_CPU_THREADS', 2, 1, 4),
  };
}
