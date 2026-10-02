import { GatewayError } from './core.js';

export const ASR_URL = 'http://127.0.0.1:8788';
export const ASR_MODEL = 'faster-whisper-small';
export const MAX_AUDIO_BYTES = 960_256;
export const MAX_AUDIO_BODY_BYTES = 1_281_000;
export const MAX_TRANSCRIPT_BYTES = 262_144;
export interface SpeechInput { audioBase64: string; mimeType: 'audio/wav'; language: 'es' | 'en' | 'auto' }
export interface TranscriptWord { startMs: number; endMs: number; word: string; probability: number }
export interface TranscriptSegment { startMs: number; endMs: number; text: string; words: TranscriptWord[] }
export interface SpeechResult { text: string; language: string; durationMs: number; model: typeof ASR_MODEL; segments: TranscriptSegment[] }

export function validateWave(audio: Buffer) {
  const invalid = () => { throw new GatewayError(400, 'INVALID_AUDIO', 'Usa WAV PCM de 16 bits, mono, 16000 Hz y entre 0,1 y 30 segundos.'); };
  if (audio.length < 44 || audio.length > MAX_AUDIO_BYTES || audio.toString('ascii', 0, 4) !== 'RIFF' || audio.toString('ascii', 8, 12) !== 'WAVE' || audio.readUInt32LE(4) + 8 !== audio.length) invalid();
  let format = false, dataBytes = 0, offset = 12;
  while (offset + 8 <= audio.length) {
    const kind = audio.toString('ascii', offset, offset + 4);
    const size = audio.readUInt32LE(offset + 4);
    const start = offset + 8, end = start + size;
    if (end > audio.length) invalid();
    if (kind === 'fmt ') {
      if (format || size < 16 || audio.readUInt16LE(start) !== 1 || audio.readUInt16LE(start + 2) !== 1 || audio.readUInt32LE(start + 4) !== 16000 || audio.readUInt32LE(start + 8) !== 32000 || audio.readUInt16LE(start + 12) !== 2 || audio.readUInt16LE(start + 14) !== 16) invalid();
      format = true;
    }
    if (kind === 'data') { if (dataBytes || size % 2) invalid(); dataBytes = size; }
    offset = end + (size % 2);
  }
  if (!format || dataBytes < 3200 || dataBytes > 960000 || offset !== audio.length) invalid();
  return dataBytes / 32;
}

export function parseSpeechInput(value: unknown): SpeechInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new GatewayError(400, 'INVALID_INPUT', 'Se requiere un objeto JSON.');
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !['audioBase64', 'mimeType', 'language'].includes(key)) || data.mimeType !== 'audio/wav' || typeof data.audioBase64 !== 'string' || !data.audioBase64 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data.audioBase64) || !['es', 'en', 'auto'].includes(String(data.language ?? 'es'))) throw new GatewayError(400, 'INVALID_INPUT', 'Se requiere audioBase64 WAV y un idioma es, en o auto.');
  if (data.audioBase64.length > Math.ceil(MAX_AUDIO_BYTES / 3) * 4) throw new GatewayError(413, 'BODY_TOO_LARGE', 'El fragmento de audio es demasiado grande.');
  const audio = Buffer.from(data.audioBase64, 'base64');
  if (audio.toString('base64') !== data.audioBase64) throw new GatewayError(400, 'INVALID_AUDIO', 'El audio base64 no es válido.');
  validateWave(audio);
  return { audioBase64: data.audioBase64, mimeType: 'audio/wav', language: (data.language ?? 'es') as SpeechInput['language'] };
}

export function parseSpeechResult(value: unknown): SpeechResult {
  const invalid = () => { throw new GatewayError(502, 'INVALID_ASR_RESULT', 'El transcriptor local devolvió un resultado inválido.'); };
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  const data = value as SpeechResult;
  if (data.model !== ASR_MODEL || typeof data.text !== 'string' || data.text.length > 16000 || typeof data.language !== 'string' || !/^[a-z]{2,3}$/.test(data.language) || !Number.isFinite(data.durationMs) || data.durationMs < 100 || data.durationMs > 30000 || !Array.isArray(data.segments) || data.segments.length > 200) invalid();
  let lastStart = 0, words = 0;
  const timing = (item: {startMs: number; endMs: number}) => Number.isFinite(item.startMs) && Number.isFinite(item.endMs) && item.startMs >= 0 && item.endMs >= item.startMs && item.endMs <= data.durationMs + 100;
  for (const segment of data.segments) {
    if (!segment || !timing(segment) || segment.startMs < lastStart || typeof segment.text !== 'string' || segment.text.length > 4000 || !Array.isArray(segment.words)) invalid();
    lastStart = segment.startMs;
    for (const word of segment.words) {
      words++;
      if (!word || !timing(word) || typeof word.word !== 'string' || word.word.length > 200 || !Number.isFinite(word.probability) || word.probability < 0 || word.probability > 1) invalid();
    }
  }
  if (words > 1000 || (!data.text.trim() && data.segments.length) || (data.text.trim() && !words)) invalid();
  return { text: data.text, language: data.language, durationMs: data.durationMs, model: ASR_MODEL, segments: data.segments.map(segment => ({ startMs: segment.startMs, endMs: segment.endMs, text: segment.text, words: segment.words.map(word => ({ startMs: word.startMs, endMs: word.endMs, word: word.word, probability: word.probability })) })) };
}

export async function transcribe(fetcher: typeof fetch, input: SpeechInput, secret: string, signal: AbortSignal): Promise<SpeechResult> {
  let response: Response;
  try { response = await fetcher(`${ASR_URL}/v1/transcribe`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` }, body: JSON.stringify(input), signal, redirect: 'error' }); }
  catch { throw new GatewayError(503, 'ASR_OFFLINE', 'La transcripción local está desconectada. Enciende la IA del PC.', 30); }
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    if (response.status === 429) throw new GatewayError(503, 'ASR_BUSY', 'El transcriptor local está ocupado. Reintenta después.', 10);
    throw new GatewayError(503, 'ASR_OFFLINE', 'La transcripción local todavía no está disponible.', 30);
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) { const item = await reader.read(); if (item.done) break; bytes += item.value.length; if (bytes > MAX_TRANSCRIPT_BYTES) throw new GatewayError(502, 'INVALID_ASR_RESULT', 'La transcripción local excedió el límite permitido.'); chunks.push(item.value); }
    let result: unknown;
    try { result = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new GatewayError(502, 'INVALID_ASR_RESULT', 'El transcriptor local devolvió un resultado incompleto.'); }
    return parseSpeechResult(result);
  } finally { await reader.cancel().catch(() => {}); }
}
