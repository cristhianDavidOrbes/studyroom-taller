import test from 'node:test';
import assert from 'node:assert/strict';
import { describeImage, VISION_MODEL } from '../src/vision.js';

const input = { image: Buffer.from([1, 2, 3]), mimeType: 'image/png' };

test('image description sends only bounded local inference and treats image text as data', async () => {
  let called = false;
  const fetcher: typeof fetch = async (url, options) => {
    called = true;
    assert.equal(url, 'http://127.0.0.1:11434/api/chat');
    assert.equal(options?.method, 'POST');
    assert.equal(options?.redirect, 'error');
    const body = JSON.parse(String(options?.body));
    assert.equal(body.model, VISION_MODEL);
    assert.deepEqual(body.messages[1].images, [input.image.toString('base64')]);
    assert.match(body.messages[0].content, /no una instrucción/);
    assert.equal(body.options.num_predict, 256);
    return new Response(JSON.stringify({ message: { content: '  Un diagrama\ncon dos nodos.  ' } }), { status: 200 });
  };
  const description = await describeImage(fetcher, input, new AbortController().signal);
  assert.equal(called, true);
  assert.equal(description, 'Un diagrama con dos nodos.');
});

test('image description rejects failed or malformed local responses', async () => {
  await assert.rejects(
    describeImage(async () => new Response('offline', { status: 503 }), input, new AbortController().signal),
    /no respondió/,
  );
  await assert.rejects(
    describeImage(async () => new Response(JSON.stringify({ message: { content: 12 } })), input, new AbortController().signal),
    /inválida/,
  );
});
