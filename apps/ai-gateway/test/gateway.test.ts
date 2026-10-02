import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { readConfig, type GatewayConfig } from '../src/config.js';
import { parseInput, persistLedger, SingleQueue, UsageMeter, GatewayError } from '../src/core.js';
import { createGateway } from '../src/server.js';

const secret = '1234567890abcdef'.repeat(4);
function config(overrides: Partial<GatewayConfig> = {}): GatewayConfig {
  return { ...readConfig({ AI_GATEWAY_SECRET: secret }), stateDir: mkdtempSync(join(tmpdir(), 'studyroom-ai-')), ...overrides };
}
function ollama(text = 'Respuesta en español.') {
  return new Response(JSON.stringify({ message: { content: text }, done: false }) + '\n' + JSON.stringify({ done: true, message: { content: '' }, prompt_eval_count: 12, eval_count: 8, eval_duration: 500_000_000 }) + '\n', { status: 200 });
}
async function harness(fetcher: typeof fetch, overrides: Partial<GatewayConfig> = {}) {
  const settings = config(overrides);
  const instance = createGateway(settings, { fetch: fetcher, freeMemory: () => 8 * 1024 ** 3, log: () => {} });
  instance.server.listen(0, '127.0.0.1');
  await once(instance.server, 'listening');
  const address = instance.server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  return {
    ...instance, settings, base,
    request(body: unknown = { prompt: 'Explica la fotosíntesis.' }, auth = secret) {
      return fetch(`${base}/v1/generate`, { method: 'POST', headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    },
    async close() { await instance.shutdown(); rmSync(settings.stateDir, { recursive: true, force: true }); },
  };
}

test('configuration fails closed for missing secret and paid-scale quotas', () => {
  assert.throws(() => readConfig({}));
  assert.throws(() => readConfig({ AI_GATEWAY_SECRET: secret, AI_MONTHLY_REQUEST_LIMIT: '20001' }));
  assert.throws(() => readConfig({ AI_GATEWAY_SECRET: secret, AI_CPU_THREADS: '20' }));
});

test('input rejects foreign/cloud model, token overflow and unbounded UTF8 context', () => {
  assert.throws(() => parseInput({ prompt: 'Hola', model: 'qwen-cloud' }));
  assert.throws(() => parseInput({ prompt: 'Hola', maxTokens: 1025 }));
  assert.throws(() => parseInput({ prompt: '🌎'.repeat(1000), system: '', maxTokens: 1 }));
  assert.equal(parseInput({ prompt: 'Hola', system: '', maxTokens: 20 }).stream, false);
});

test('requests require Bearer and route allowlist; public health reveals no model/secret', async () => {
  let calls = 0;
  const app = await harness(async () => { calls++; return ollama(); });
  try {
    const health = await fetch(`${app.base}/health`);
    assert.deepEqual(await health.json(), { status: 'ok' });
    assert.equal((await app.request(undefined, 'wrong')).status, 401);
    assert.equal((await fetch(`${app.base}/api/pull`, { headers: { Authorization: `Bearer ${secret}` } })).status, 404);
    assert.equal(calls, 0);
  } finally { await app.close(); }
});

test('generation only contacts local chat with fixed model and resource limits', async () => {
  let sent: any;
  const app = await harness(async (url, init) => {
    assert.equal(url, 'http://127.0.0.1:11434/api/chat');
    sent = JSON.parse(init!.body as string);
    return ollama();
  });
  try {
    const res = await app.request();
    assert.equal(res.status, 200);
    const output = await res.json();
    assert.equal(output.text, 'Respuesta en español.');
    assert.equal(output.usage.outputTokens, 8);
    assert.equal(sent.model, 'qwen3:4b-instruct');
    assert.equal(sent.options.num_ctx, 4096);
    assert.equal(sent.options.num_thread, 2);
    assert.equal(sent.think, false);
    assert.equal(sent.stream, true);
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  } finally { await app.close(); }
});

test('NDJSON streams deltas once, includes final usage and records bytes', async () => {
  const app = await harness(async () => ollama('Sí, estudiar juntos ayuda.'));
  try {
    const res = await app.request({ prompt: 'Hola', stream: true });
    assert.equal(res.status, 200);
    const events = (await res.text()).trim().split('\n').map(line => JSON.parse(line));
    assert.deepEqual(events.map(e => e.type), ['delta', 'done']);
    assert.equal(events[0].text, 'Sí, estudiar juntos ayuda.');
    assert.ok(events[1].usage.firstTokenMs !== null);
    assert.ok(app.meter.snapshot().sentBytes > 0);
  } finally { await app.close(); }
});

test('offline, missing model, malformed upstream and timeout become explicit errors', async () => {
  const cases = [
    { fetcher: async () => { throw new Error('connect refused'); }, code: 'AI_OFFLINE', status: 503 },
    { fetcher: async () => new Response('', { status: 404 }), code: 'MODEL_NOT_READY', status: 503 },
    { fetcher: async () => new Response('broken\n'), code: 'INVALID_UPSTREAM', status: 502 },
    { fetcher: async (_url: unknown, init: any) => { await delay(500, undefined, { signal: init.signal }); return ollama(); }, code: 'AI_TIMEOUT', status: 504 },
  ];
  for (const sample of cases) {
    const app = await harness(sample.fetcher as typeof fetch, { timeoutMs: 30 });
    try {
      const res = await app.request();
      assert.equal(res.status, sample.status);
      assert.equal((await res.json()).code, sample.code);
      assert.equal(app.queue.state.active, 0);
    } finally { await app.close(); }
  }
});

test('rate limit and paused background work prevent model calls', async () => {
  let calls = 0;
  const app = await harness(async () => { calls++; return ollama(); }, { requestsPerMinute: 2 });
  try {
    writeFileSync(join(app.settings.stateDir, 'pause'), 'background');
    const paused = await app.request({ prompt: 'Resumen', priority: 'background' });
    assert.equal((await paused.json()).code, 'AI_PAUSED');
    assert.equal((await app.request()).status, 200);
    const rate = await app.request();
    assert.equal((await rate.json()).code, 'RATE_LIMIT');
    assert.equal(calls, 1);
  } finally { await app.close(); }
});

test('durable quota survives restart and reservations prevent oversubscription', () => {
  const settings = config({ monthlyByteLimit: 500_000, monthlyRequestLimit: 2 });
  try {
    const first = new UsageMeter(settings);
    first.recordRequest(); first.recordRequest();
    first.reserve(300_000);
    assert.throws(() => first.reserve(300_000), GatewayError);
    const restarted = new UsageMeter(settings);
    assert.equal(restarted.snapshot().sentBytes, 300_000);
    restarted.recordRequest();
    assert.throws(() => restarted.assertQuota(), GatewayError);
  } finally { rmSync(settings.stateDir, { recursive: true, force: true }); }
});

test('single queue runs only one generation, prioritizes questions and removes cancelled work', async () => {
  const queue = new SingleQueue(3);
  const order: string[] = [];
  let unlock!: () => void;
  const lock = new Promise<void>(resolve => { unlock = resolve; });
  const signal = new AbortController().signal;
  const first = queue.add('background', signal, async () => { order.push('first'); await lock; });
  const background = queue.add('background', signal, async () => { order.push('background'); });
  const cancelledController = new AbortController();
  const cancelled = queue.add('interactive', cancelledController.signal, async () => { order.push('cancelled'); });
  const rejected = assert.rejects(cancelled, /cancelada/);
  cancelledController.abort();
  const interactive = queue.add('interactive', signal, async () => { order.push('question'); });
  assert.equal(queue.state.active, 1);
  assert.equal(queue.state.waiting, 2);
  unlock();
  await Promise.all([first, background, interactive, rejected]);
  assert.deepEqual(order, ['first', 'question', 'background']);
});

test('client cancellation aborts local inference and frees the queue', async () => {
  let upstreamAborted = false;
  const app = await harness(async (_url, init) => {
    try { await delay(2000, undefined, { signal: init!.signal as AbortSignal }); } catch { upstreamAborted = true; throw new Error('aborted'); }
    return ollama();
  });
  try {
    const controller = new AbortController();
    const request = fetch(`${app.base}/v1/generate`, { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'Explica' }), signal: controller.signal });
    await delay(30);
    controller.abort();
    await assert.rejects(request);
    await delay(30);
    assert.equal(upstreamAborted, true);
    assert.equal(app.queue.state.active, 0);
  } finally { await app.close(); }
});

test('token truncation emits stream error, never a successful final answer', async () => {
  const app = await harness(async () => new Response(JSON.stringify({message:{content:'Respuesta incompleta'},done:false})+'\n'+JSON.stringify({done:true,done_reason:'length'})+'\n'));
  try {
    const response = await app.request({prompt:'Hola',stream:true});
    const events = (await response.text()).trim().split('\n').map(line=>JSON.parse(line));
    assert.equal(events.at(-1).type,'error');
    assert.equal(events.at(-1).code,'OUTPUT_LIMIT');
    assert.equal(events.some(event=>event.type==='done'),false);
  } finally { await app.close(); }
});

test('readiness requires installed selected model; secrets are absent from health data', async () => {
  const app = await harness(async (url) => {
    assert.equal(url,'http://127.0.0.1:11434/api/tags');
    return Response.json({models:[{name:'qwen3:4b-instruct',digest:'sha256:model-version'}]});
  });
  try {
    const result=await fetch(`${app.base}/v1/health`,{headers:{Authorization:`Bearer ${secret}`}});
    const health=await result.json();
    assert.equal(health.status,'ready');
    assert.equal(health.modelDigest,'sha256:model-version');
    assert.equal(JSON.stringify(health).includes(secret),false);
  } finally { await app.close(); }
});

test('low memory, oversized body and exhausted free quota prevent inference', async () => {
  let calls=0;
  const noCalls=async()=>{calls++;return ollama();};
  const low=await harness(noCalls,{minFreeMemoryMb:16_384});
  try { assert.equal((await (await low.request()).json()).code,'LOW_MEMORY'); } finally { await low.close(); }
  const large=await harness(noCalls);
  try { assert.equal((await large.request({prompt:'x'.repeat(17000)})).status,413); } finally { await large.close(); }
  const quota=await harness(noCalls,{monthlyByteLimit:16_384});
  try { assert.equal((await (await quota.request()).json()).code,'QUOTA_EXCEEDED'); } finally { await quota.close(); }
  assert.equal(calls,0);
});

test('atomic quota replacement retries transient Windows locks without discarding the old ledger', () => {
  let attempts=0, writes=0;
  const pauses:number[]=[];
  persistLedger('quota.json','{}',{
    writeFileSync: (()=>{writes++;}) as typeof writeFileSync,
    renameSync: (()=>{if(++attempts<3)throw Object.assign(new Error('locked'),{code:'EPERM'});}) as typeof import('node:fs').renameSync,
  },ms=>{pauses.push(ms);});
  assert.equal(writes,1);
  assert.equal(attempts,3);
  assert.deepEqual(pauses,[10,20]);
});

test('unavailable quota storage blocks new inference without throwing from reservation cleanup', () => {
  const settings=config();
  let blocked=false;
  const meter=new UsageMeter(settings,()=>new Date('2026-10-02T00:00:00Z'),()=>{if(blocked)throw Object.assign(new Error('locked'),{code:'EPERM'});});
  try {
    const release=meter.reserve(200000);
    blocked=true;
    assert.doesNotThrow(()=>meter.sent(100));
    assert.doesNotThrow(release);
    assert.equal(meter.snapshot().persistenceHealthy,false);
    assert.throws(()=>meter.assertQuota(),(error:unknown)=>error instanceof GatewayError&&error.code==='QUOTA_STORAGE_UNAVAILABLE');
    blocked=false;
    meter.recordRequest();
    assert.equal(meter.snapshot().persistenceHealthy,true);
    assert.equal(meter.snapshot().sentBytes,100);
    assert.doesNotThrow(()=>meter.assertQuota());
  } finally {rmSync(settings.stateDir,{recursive:true,force:true});}
});
