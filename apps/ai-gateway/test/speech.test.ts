import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { readConfig } from '../src/config.js';
import { createGateway } from '../src/server.js';
import { ASR_MODEL, MAX_AUDIO_BODY_BYTES, parseSpeechInput, parseSpeechResult, validateWave } from '../src/speech.js';

function wave(seconds = 1) {
  const bytes = Math.round(seconds * 32000), data = Buffer.alloc(44 + bytes);
  data.write('RIFF'); data.writeUInt32LE(data.length - 8, 4); data.write('WAVE', 8); data.write('fmt ', 12); data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22); data.writeUInt32LE(16000, 24); data.writeUInt32LE(32000, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(bytes, 40);
  return data;
}
const secret = '1234567890abcdef'.repeat(4);
const payload = () => ({ audioBase64: wave().toString('base64'), mimeType: 'audio/wav' });
const recognized = { text: 'Hola', language: 'es', durationMs: 1000, model: ASR_MODEL, segments: [{ startMs: 0, endMs: 400, text: 'Hola', words: [{ startMs: 0, endMs: 400, word: ' Hola', probability: .98 }] }] };
async function harness(fetcher: typeof fetch, timeoutMs = 1000) {
  const settings = { ...readConfig({ AI_GATEWAY_SECRET: secret }), timeoutMs, stateDir: mkdtempSync(join(tmpdir(), 'studyroom-speech-')) };
  const app = createGateway(settings, { fetch: fetcher, freeMemory: () => 8 * 1024 ** 3, log: () => {} });
  app.server.listen(0, '127.0.0.1'); await once(app.server, 'listening');
  const address = app.server.address(); assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  return { ...app, settings, request(body: unknown = payload(), auth = secret) { return fetch(`${base}/v1/transcribe`, { method: 'POST', headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }, async close() { await app.shutdown(); rmSync(settings.stateDir, {recursive:true,force:true}); } };
}

test('speech rejects invalid formats, durations, canonical base64 and foreign fields', () => {
  assert.equal(validateWave(wave(30)), 30000);
  for (const audio of [wave(.05), wave(30.1), Buffer.from('not audio'), Buffer.concat([wave(), Buffer.alloc(1)])]) assert.throws(() => validateWave(audio));
  const stereo = wave(); stereo.writeUInt16LE(2,22); assert.throws(() => validateWave(stereo));
  assert.throws(() => parseSpeechInput({ ...payload(), url: 'https://external/audio' }));
  assert.throws(() => parseSpeechInput({ ...payload(), mimeType: 'audio/webm' }));
  assert.throws(() => parseSpeechInput({ ...payload(), audioBase64: payload().audioBase64 + '\n' }));
  assert.equal(parseSpeechInput(payload()).language, 'es');
});

test('speech result preserves actual words/timestamps and rejects malformed or invented substitutes', () => {
  assert.deepEqual(parseSpeechResult(recognized), recognized);
  assert.deepEqual(parseSpeechResult({ ...recognized, text: '', segments: [] }).segments, []);
  for (const invalid of [{ ...recognized, model: 'gemini' }, { ...recognized, segments: [] }, { ...recognized, durationMs: 30001 }, { ...recognized, segments: [{ ...recognized.segments[0], words:[{...recognized.segments[0].words[0], probability:2}] }] }]) assert.throws(() => parseSpeechResult(invalid));
});

test('speech is authenticated, server-to-server, fixed local worker and quota metered', async () => {
  let calls=0;
  const app = await harness(async (url, init) => { calls++; assert.equal(url, 'http://127.0.0.1:8788/v1/transcribe'); assert.equal((init!.headers as Record<string,string>).Authorization, `Bearer ${secret}`); assert.equal(JSON.parse(init!.body as string).language,'es'); return Response.json(recognized); });
  try {
    assert.equal((await app.request(undefined,'wrong')).status,401); assert.equal(calls,0);
    const response = await app.request(); assert.equal(response.status,200); assert.deepEqual(await response.json(),recognized); assert.equal(response.headers.get('access-control-allow-origin'),null);
    assert.ok(app.meter.snapshot().receivedBytes>32000); assert.equal(calls,1);
  } finally { await app.close(); }
});

test('speech failures return explicit unavailable/timeout/result errors, never fake words', async () => {
  for (const item of [
    { fetcher: async () => {throw new Error('private path');}, code:'ASR_OFFLINE',status:503 },
    { fetcher: async () => new Response('',{status:429}), code:'ASR_BUSY',status:503 },
    { fetcher: async () => Response.json({text:'fake'}),code:'INVALID_ASR_RESULT',status:502 },
    { fetcher: async (_url:unknown,init:any) => {await delay(300,undefined,{signal:init.signal});return Response.json(recognized);},code:'ASR_TIMEOUT',status:504 },
  ]) {
    const app=await harness(item.fetcher as typeof fetch,30);
    try {const response=await app.request(); const result=await response.json();assert.equal(response.status,item.status);assert.equal(result.code,item.code);assert.equal('text' in result,false);assert.equal(app.queue.state.active,0);} finally{await app.close();}
  }
});

test('speech admits all four room participants, bounds excess input and serializes inference', async () => {
  let active=0,max=0,calls=0,releaseFirst=()=>{};
  const first=new Promise<void>(resolve=>{releaseFirst=resolve;});
  const app=await harness(async()=>{active++;max=Math.max(max,active);if(++calls===1)await first;active--;return Response.json(recognized);});
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    assert.equal((await app.request({audioBase64:'x'.repeat(MAX_AUDIO_BODY_BYTES)})).status,413);
    const requests=Array.from({length:5},()=>app.request());
    const admitted=await Promise.race([Promise.race(requests),new Promise<Response>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Expected bounded admission')),1000);})]);
    assert.equal(admitted.status,429);
    releaseFirst();
    const results=await Promise.all(requests);
    assert.equal(max,1); assert.equal(results.filter(response=>response.status===200).length,4);assert.equal(results.filter(response=>response.status===429).length,1);
  } finally{if(timer)clearTimeout(timer);releaseFirst();await app.close();}
});

test('authenticated readiness checks the private speech worker and stays available during background-only pause', async () => {
  const app=await harness(async(url,init)=>{
    if(String(url).endsWith('/api/tags'))return Response.json({models:[{name:'qwen3:4b-instruct',digest:'local'}]});
    assert.equal(url,'http://127.0.0.1:8788/health');assert.equal((init!.headers as Record<string,string>).Authorization,`Bearer ${secret}`);return Response.json({status:'ready'});
  });
  try {
    writeFileSync(join(app.settings.stateDir,'pause'),'background');
    const address=app.server.address();assert.ok(address&&typeof address!=='string');
    const health=await (await fetch(`http://127.0.0.1:${address.port}/v1/health`,{headers:{Authorization:`Bearer ${secret}`}})).json();
    assert.equal(health.speech.ready,true);assert.equal(health.speech.model,ASR_MODEL);assert.equal(health.speech.maxDurationMs,30000);assert.equal(JSON.stringify(health).includes(secret),false);
  } finally{await app.close();}
});
