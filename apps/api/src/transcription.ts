import { Injectable, BadRequestException, ConflictException, ForbiddenException, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { createHash } from "node:crypto";
import { z } from "zod";
import { Db, Identity, parse, RateLimiter, CAPS, denyQuota, monthKey } from "./core";
import { Rooms } from "./rooms";

export const AUDIO_MAX_BYTES = 960044;
export const TRANSCRIPTION_GRACE_MS = 60000;
const fieldsSchema = z.object({
  clientId: z.string().uuid(), sessionId: z.string().uuid(),
  startMs: z.coerce.number().int().min(0).max(86400000),
  endMs: z.coerce.number().int().min(1).max(86400000),
}).strict().refine(v => v.endMs > v.startMs && v.endMs - v.startMs <= 30000, "El audio debe durar entre 1 ms y 30 segundos");
export function wavDuration(buffer: Buffer) {
  if (buffer.length < 46 || buffer.length > AUDIO_MAX_BYTES ||
      buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE" ||
      buffer.readUInt32LE(4) !== buffer.length - 8 || buffer.toString("ascii", 12, 16) !== "fmt " ||
      buffer.readUInt32LE(16) !== 16 || buffer.readUInt16LE(20) !== 1 ||
      buffer.readUInt16LE(22) !== 1 || buffer.readUInt32LE(24) !== 16000 ||
      buffer.readUInt32LE(28) !== 32000 || buffer.readUInt16LE(32) !== 2 || buffer.readUInt16LE(34) !== 16 ||
      buffer.toString("ascii", 36, 40) !== "data" || buffer.readUInt32LE(40) !== buffer.length - 44 ||
      (buffer.length - 44) % 2 !== 0)
    throw new BadRequestException("Se requiere audio WAV PCM16 mono a 16 kHz de hasta 30 segundos");
  return (buffer.length - 44) / 32;
}
const wordSchema = z.object({ word: z.string().min(1).max(500), startMs: z.number().int().min(0).max(32000), endMs: z.number().int().min(0).max(32000), probability: z.number().min(0).max(1).optional() }).strict();
const gatewayResultSchema = z.object({
  text: z.string().max(20000), language: z.string().max(30), durationMs: z.number().min(0).max(32000), model: z.string().max(120),
  segments: z.array(z.object({ startMs: z.number().int().min(0).max(32000), endMs: z.number().int().min(0).max(32000), text: z.string().max(20000), words: z.array(wordSchema).max(1500) }).strict()).max(300),
}).strict();

// Audio never enters PostgreSQL or storage. Only consent, transcription and missing intervals persist.
@Injectable()
export class Transcription implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  constructor(private db: Db, private rooms: Rooms, private rate: RateLimiter) {}
  onModuleInit() { this.timer = setInterval(() => void this.failStale(), 15000); this.timer.unref(); }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async failStale() {
    await this.db.transcriptionBatch.updateMany({ where: { status: "pending", createdAt: { lt: new Date(Date.now() - 180000) } }, data: { status: "failed", error: "El procesamiento se interrumpió. Este intervalo no se pudo transcribir." } }).catch(() => {});
  }
  async consent(roomId: string, i: Identity, body: unknown) {
    const { enabled } = parse(z.object({ enabled: z.boolean() }).strict(), body);
    const member = await this.rooms.member(roomId, i.uid);
    if (member.room.status !== "open") throw new ConflictException("La sesión ya terminó");
    const result = await this.db.serial(async tx => {
      const m = await tx.membership.findUnique({ where: { roomId_userId: { roomId, userId: i.uid } }, include: { room: true } });
      if (!m?.active || m.banned || m.room.status !== "open") throw new ForbiddenException("Ya no tienes acceso activo");
      const session = await tx.session.findFirst({ where: { roomId, endedAt: null } });
      if (!session) throw new ConflictException("No hay sesión activa");
      const old = await tx.transcriptionConsent.findUnique({ where: { sessionId_userId: { sessionId: session.id, userId: i.uid } } });
      return tx.transcriptionConsent.upsert({ where: { sessionId_userId: { sessionId: session.id, userId: i.uid } },
        create: { sessionId: session.id, userId: i.uid, enabled, enabledSince: enabled ? new Date() : null },
        update: { enabled, enabledSince: enabled ? (old?.enabled ? old.enabledSince : new Date()) : null },
      });
    });
    this.rooms.events.emit(roomId, "transcription:updated", { roomId, sessionId: result.sessionId });
    return { sessionId: result.sessionId, userId: i.uid, enabled: result.enabled, updatedAt: result.updatedAt };
  }
  async room(roomId: string, i: Identity, query: unknown = {}) {
    await this.rooms.member(roomId, i.uid, undefined, true);
    const session = await this.db.session.findFirst({ where: { roomId }, orderBy: { startedAt: "desc" } });
    if (!session) throw new ConflictException("No hay sesión");
    const pagination = parse(z.object({ cursor: z.string().uuid().optional(), limit: z.coerce.number().int().min(1).max(1000).default(200) }).strict(), query);
    return this.view(session, pagination);
  }
  async view(session: { id: string; startedAt: Date; endedAt?: Date | null; participantIds: string[] }, page?: { cursor?: string; limit: number }) {
    const cursor = page?.cursor ? await this.db.transcriptSegment.findUnique({ where: { id: page.cursor }, select: { sessionId: true, createdAt: true, id: true } }) : null;
    if (page?.cursor && (!cursor || cursor.sessionId !== session.id)) throw new ForbiddenException("El cursor no pertenece a esta transcripción");
    const [segments, batches, consents, people] = await Promise.all([
      this.db.transcriptSegment.findMany({ where: { sessionId: session.id, ...(cursor ? { OR: [{ createdAt: { gt: cursor.createdAt } }, { createdAt: cursor.createdAt, id: { gt: cursor.id } }] } : {}) }, orderBy: [{ [page ? "createdAt" : "startMs"]: "asc" }, { id: "asc" }], ...(page ? { take: page.limit + 1 } : {}), select: { id: true, speakerId: true, speakerName: true, text: true, startMs: true, endMs: true, words: true } }),
      this.db.transcriptionBatch.findMany({ where: { sessionId: session.id }, orderBy: [{ startMs: "asc" }, { id: "asc" }], select: { id: true, clientId: true, userId: true, status: true, startMs: true, endMs: true, error: true } }),
      this.db.transcriptionConsent.findMany({ where: { sessionId: session.id } }),
      this.db.user.findMany({ where: { id: { in: session.participantIds } }, select: { id: true, displayName: true } }),
    ]);
    const participants = people.map(p => { const c = consents.find(c => c.userId === p.id); return { userId: p.id, displayName: p.displayName, enabled: c?.enabled ?? false, enabledSince: c?.enabledSince ?? null, updatedAt: c?.updatedAt ?? null }; });
    const pendingBatches = batches.filter(b => b.status === "pending").length;
    const failedBatches = batches.filter(b => b.status === "failed").length;
    const completedBatches = batches.filter(b => ["succeeded", "silent"].includes(b.status)).length;
    const consentingParticipants = participants.filter(p => p.enabled).length;
    const duration = (session.endedAt?.getTime() ?? Date.now()) - session.startedAt.getTime();
    const uncoveredParticipants = participants.filter(p => {
      const own = batches.filter(b => b.userId === p.userId && ["succeeded", "silent"].includes(b.status)).sort((a, b) => a.startMs - b.startMs);
      let through = 0; for (const b of own) { if (b.startMs > through + 1000) return true; through = Math.max(through, b.endMs); }
      return through < duration - 2000;
    }).length;
    const visible = page ? segments.slice(0, page.limit) : segments;
    return { sessionId: session.id, startedAt: session.startedAt, serverTime: new Date(), segments: visible,
      ...(page ? { nextCursor: segments.length > page.limit ? visible[visible.length - 1]?.id ?? null : null } : {}),
      batches: batches.map(({ userId, ...b }) => ({ ...b, speakerId: userId })), participants,
      coverage: { status: pendingBatches ? "pending" : failedBatches || (completedBatches && uncoveredParticipants) ? "partial" : completedBatches ? "available" : "none", pendingBatches, failedBatches, completedBatches, consentingParticipants, totalParticipants: participants.length, uncoveredParticipants,
        notice: "Se transcribe el micrófono encendido de cada participante mientras su transcripción está activa. No se reconstruye el audio previo ni el de micrófonos apagados o capturas pausadas. El reconocimiento puede contener errores." },
    };
  }
  async audio(roomId: string, i: Identity, body: unknown, file: Express.Multer.File | undefined) {
    if (!file?.buffer) throw new BadRequestException("Falta el campo audio");
    const d = parse(fieldsSchema, body);
    const duration = wavDuration(file.buffer);
    if (Math.abs(duration - (d.endMs - d.startMs)) > 1000) throw new BadRequestException("El intervalo no coincide con la duración del audio");
    await this.rooms.member(roomId, i.uid, undefined, true);
    const audioHash = createHash("sha256").update(file.buffer).update(`${d.startMs}:${d.endMs}`).digest("hex");
    const batch = await this.db.serial(async tx => {
      const s = await tx.session.findUnique({ where: { id: d.sessionId } });
      const m = await tx.membership.findUnique({ where: { roomId_userId: { roomId, userId: i.uid } }, include: { room: true, user: true } });
      if (!s || s.roomId !== roomId || !s.participantIds.includes(i.uid) || !m || m.banned || (!s.endedAt && !m.active)) throw new ForbiddenException("No tienes acceso a este audio de sesión");
      const old = await tx.transcriptionBatch.findUnique({ where: { sessionId_userId_clientId: { sessionId: s.id, userId: i.uid, clientId: d.clientId } } });
      if (old) { if (old.audioHash !== audioHash) throw new ConflictException("Ese identificador ya se usó para otro audio"); return { batch: old, duplicate: true }; }
      if (m.room.status === "cancelled" || (s.endedAt && Date.now() > s.endedAt.getTime() + TRANSCRIPTION_GRACE_MS)) throw new ConflictException("La ventana para enviar el último audio terminó");
      const consent = await tx.transcriptionConsent.findUnique({ where: { sessionId_userId: { sessionId: s.id, userId: i.uid } } });
      if (!consent?.enabled || !consent.enabledSince) throw new ForbiddenException("Habilita tu consentimiento antes de enviar audio");
      const minimum = Math.max(0, Math.max(consent.enabledSince.getTime(), m.joinedAt.getTime()) - s.startedAt.getTime() - 250);
      const maximum = (s.endedAt?.getTime() ?? Date.now()) - s.startedAt.getTime();
      if (d.startMs < minimum || d.endMs > maximum + 2000 || d.startMs >= maximum) throw new BadRequestException("El audio está fuera del intervalo autorizado de la sesión");
      this.rate.check(`transcribe:${i.uid}`, 10);
      if (await tx.transcriptionBatch.count({ where: { status: "pending", userId: i.uid } }) >= 2 || await tx.transcriptionBatch.count({ where: { status: "pending" } }) >= 8) denyQuota("La transcripción está ocupada; este audio no se envió");
      return { batch: await tx.transcriptionBatch.create({ data: { sessionId: s.id, userId: i.uid, clientId: d.clientId, speakerName: m.user.displayName, startMs: d.startMs, endMs: Math.min(d.endMs, maximum), audioHash } }), duplicate: false };
    });
    if (!batch.duplicate) {
      try {
        const result = parse(gatewayResultSchema, await this.gateway(file.buffer));
        await this.db.serial(async tx => {
          const current = await tx.transcriptionBatch.findUniqueOrThrow({ where: { id: batch.batch.id } });
          if (current.status !== "pending") return;
          // Do not manufacture word timings or speech from a plain-text fallback.
          if (result.text.trim() && (!result.segments.length || result.segments.some(s => s.text.trim() && !s.words.length))) throw new BadRequestException("La transcripción no contiene tiempos por palabra");
          for (const segment of result.segments) {
            if (segment.endMs < segment.startMs || segment.endMs > duration + 1000 || segment.words.some(w => w.endMs < w.startMs || w.endMs > duration + 1000)) throw new BadRequestException("Tiempos inválidos del transcriptor");
            const startMs = Math.min(current.endMs, current.startMs + segment.startMs);
            const endMs = Math.min(current.endMs, current.startMs + segment.endMs);
            if (!segment.text.trim() || endMs <= startMs) continue;
            await tx.transcriptSegment.create({ data: { sessionId: current.sessionId, batchId: current.id, speakerId: current.userId, speakerName: current.speakerName, text: segment.text, startMs, endMs,
              words: segment.words.filter(w => current.startMs + w.startMs < current.endMs).map(w => ({ ...w, startMs: current.startMs + w.startMs, endMs: Math.min(current.endMs, current.startMs + w.endMs) })),
            } });
          }
          await tx.transcriptionBatch.update({ where: { id: current.id }, data: { status: result.text.trim() ? "succeeded" : "silent", model: result.model, error: null } });
        });
      } catch {
        await this.db.transcriptionBatch.updateMany({ where: { id: batch.batch.id, status: "pending" }, data: { status: "failed", error: "La IA local o la cuota no permitió transcribir este intervalo. El audio no se conservó y no se puede reconstruir." } });
      }
      this.rooms.events.emit(roomId, "transcription:updated", { roomId, sessionId: d.sessionId });
    }
    const result = await this.db.transcriptionBatch.findUniqueOrThrow({ where: { id: batch.batch.id }, include: { segments: { orderBy: { startMs: "asc" } } } });
    const { audioHash: _, userId, speakerName, model, createdAt, updatedAt, ...safe } = result;
    return { ...safe, speakerId: userId };
  }
  async gap(roomId: string, i: Identity, body: unknown) {
    const d = parse(z.object({ clientId: z.string().uuid(), sessionId: z.string().uuid(), startMs: z.number().int().min(0).max(86400000), endMs: z.number().int().min(1).max(86400000), reason: z.enum(["capture_failed", "queue_overflow", "upload_failed"]) }).strict().refine(d => d.endMs > d.startMs && d.endMs - d.startMs <= 30000), body);
    await this.rooms.member(roomId, i.uid, undefined, true);
    const result = await this.db.serial(async tx => {
      const session = await tx.session.findUnique({ where: { id: d.sessionId } });
      const m = await tx.membership.findUnique({ where: { roomId_userId: { roomId, userId: i.uid } }, include: { room: true, user: true } });
      if (!session || session.roomId !== roomId || !session.participantIds.includes(i.uid) || !m || m.banned || (!session.endedAt && !m.active)) throw new ForbiddenException("No tienes acceso a esta sesión");
      const old = await tx.transcriptionBatch.findUnique({ where: { sessionId_userId_clientId: { sessionId: session.id, userId: i.uid, clientId: d.clientId } } });
      if (old) return old; // A lost HTTP response must not overwrite an accepted, still-running STT request.
      const consent = await tx.transcriptionConsent.findUnique({ where: { sessionId_userId: { sessionId: session.id, userId: i.uid } } });
      if (!consent?.enabled || !consent.enabledSince) throw new ForbiddenException("No habilitaste transcripción en esta sesión");
      const maximum = (session.endedAt?.getTime() ?? Date.now()) - session.startedAt.getTime();
      if (m.room.status === "cancelled" || (session.endedAt && Date.now() > session.endedAt.getTime() + TRANSCRIPTION_GRACE_MS) || d.startMs < Math.max(0, Math.max(consent.enabledSince.getTime(), m.joinedAt.getTime()) - session.startedAt.getTime() - 250) || d.endMs > maximum + 2000 || d.startMs >= maximum) throw new ConflictException("El intervalo está fuera de la sesión autorizada");
      this.rate.check(`gap:${i.uid}`, 10);
      const error = { capture_failed: "No se pudo capturar el micrófono durante este intervalo.", queue_overflow: "Este intervalo se perdió porque la cola local de transcripción estaba llena.", upload_failed: "No fue posible entregar este intervalo al transcriptor. El audio no se conservó." }[d.reason];
      return tx.transcriptionBatch.create({ data: { sessionId: session.id, userId: i.uid, clientId: d.clientId, speakerName: m.user.displayName, startMs: d.startMs, endMs: Math.min(d.endMs, maximum), audioHash: `gap:${d.reason}`, status: "failed", error } });
    });
    this.rooms.events.emit(roomId, "transcription:updated", { roomId, sessionId: d.sessionId });
    return { id: result.id, clientId: result.clientId, sessionId: result.sessionId, speakerId: result.userId, startMs: result.startMs, endMs: result.endMs, status: result.status, error: result.error };
  }
  async gateway(audio: Buffer) {
    if (!process.env.AI_GATEWAY_URL || !process.env.AI_GATEWAY_TOKEN) throw new Error("STT unavailable");
    const url = new URL(process.env.AI_GATEWAY_URL);
    if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["127.0.0.1", "localhost"].includes(url.hostname))) throw new Error("Insecure STT endpoint");
    const body = JSON.stringify({ audioBase64: audio.toString("base64"), mimeType: "audio/wav", language: "es" });
    const reservation = Buffer.byteLength(body) + 504096;
    const month = monthKey();
    await this.db.serial(async tx => {
      const u = await tx.usage.upsert({ where: { id: month }, create: { id: month }, update: {} });
      if (u.ngrokRequests + 1 > CAPS.ngrokRequests || u.ngrokBytes + BigInt(reservation) > BigInt(CAPS.ngrokBytes)) denyQuota();
      await tx.usage.update({ where: { id: month }, data: { ngrokRequests: { increment: 1 }, ngrokBytes: { increment: reservation } } });
    });
    const response = await fetch(new URL("/v1/transcribe", url), { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_GATEWAY_TOKEN}` }, body, signal: AbortSignal.timeout(120000) });
    if (!response.ok || !response.body) throw new Error("STT unavailable");
    const chunks: Buffer[] = []; let received = 0;
    for await (const chunk of response.body as any) { received += chunk.byteLength; if (received > 500000) throw new Error("STT response too large"); chunks.push(Buffer.from(chunk)); }
    await this.db.usage.update({ where: { id: month }, data: { ngrokBytes: { increment: Buffer.byteLength(body) + received + 4096 - reservation } } });
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  }
}
