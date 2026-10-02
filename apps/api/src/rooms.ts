import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ServiceUnavailableException,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import {
  Db,
  Identity,
  parse,
  hashCode,
  checkCode,
  sha,
  RateLimiter,
  monthKey,
  CAPS,
  denyQuota,
} from "./core";
import { Events } from "./events";
import {
  roomSchema,
  profileSchema,
  messageSchema,
  timerSchema,
  annotationSchema,
} from "./validation";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { Prisma } from "@prisma/client";

@Injectable()
export class Rooms implements OnModuleInit, OnModuleDestroy {
  private maintenance?: NodeJS.Timeout;
  onModuleInit() {
    this.maintenance = setInterval(() => void this.expireMedia(), 15000);
    this.maintenance.unref();
    void this.expireMedia();
  }
  onModuleDestroy() {
    if (this.maintenance) clearInterval(this.maintenance);
  }
  async expireMedia() {
    if (!process.env.LIVEKIT_URL) return;
    try {
      const expired = await this.db.mediaGrant.findMany({
        orderBy: { expiresAt: "asc" },
        take: 100,
      });
      for (const grant of expired) {
        try {
          const membership = await this.db.membership.findUnique({
            where: {
              roomId_userId: { roomId: grant.roomId, userId: grant.userId },
            },
            include: { room: true },
          });
          const revoked =
            !membership?.active ||
            membership.banned ||
            membership.room.status !== "open";
          if (!revoked && grant.expiresAt > new Date()) continue;
          await this.mediaClient().removeParticipant(
            grant.roomId,
            grant.userId,
          );
          // Keep monitoring through the one-minute join-token lifetime to prevent replay.
          if (grant.expiresAt.getTime() < Date.now() - 60000)
            await this.db.mediaGrant.deleteMany({
              where: {
                id: grant.id,
                expiresAt: { lte: new Date(Date.now() - 60000) },
              },
            });
          this.events.personal(grant.userId, "media:expired", {
            roomId: grant.roomId,
            message:
              "La duración reservada terminó. Solicita acceso otra vez para comprobar la cuota gratuita.",
          });
        } catch {}
      }
    } catch {}
  }
  constructor(
    readonly db: Db,
    readonly events: Events,
    private limiter: RateLimiter,
  ) {}
  async member(roomId: string, uid: string, roles?: string[], history = false) {
    const m = await this.db.membership.findUnique({
      where: { roomId_userId: { roomId, userId: uid } },
      include: { room: true, user: true },
    });
    if (!m || m.banned || (!history && !m.active))
      throw new ForbiddenException("No tienes acceso a esta sala");
    if(m.room.status==='scheduled'&&m.room.scheduledAt&&m.room.scheduledAt<=new Date()){
      await this.db.room.updateMany({where:{id:roomId,status:'scheduled',scheduledAt:{lte:new Date()}},data:{status:'open'}});
      m.room=await this.db.room.findUniqueOrThrow({where:{id:roomId}});
    }
    if (roles && !roles.includes(m.role))
      throw new ForbiddenException("No tienes permiso para esta acción");
    return m;
  }
  async profile(i: Identity, body?: unknown) {
    return body === undefined
      ? this.db.user.findUniqueOrThrow({ where: { id: i.uid } })
      : this.db.user.update({
          where: { id: i.uid },
          data: parse(profileSchema, body),
        });
  }
  async format(room: any, uid: string) {
    const membership =
      room.memberships?.find((m: any) => m.userId === uid) ??
      (await this.db.membership.findUnique({
        where: { roomId_userId: { roomId: room.id, userId: uid } },
      }));
    const session =
      room.sessions?.[0] ??
      (await this.db.session.findFirst({
        where: { roomId: room.id },
        orderBy: { startedAt: "desc" },
      }));
    const { accessHash, timer, annotations, memberships, sessions, ...safe } =
      room;
    return {
      ...safe,
      participantCount:
        room._count?.memberships ??
        (await this.db.membership.count({
          where: { roomId: room.id, active: true },
        })),
      myRole: membership?.active ? membership.role : undefined,
      sessionId: session?.id,
    };
  }
  async list(i: Identity, q: Record<string, string>) {
    await this.db.room.updateMany({where:{status:'scheduled',scheduledAt:{lte:new Date()}},data:{status:'open'}});
    q = parse(
      z
        .object({
          q: z.string().max(120).optional(),
          subject: z.string().max(80).optional(),
          modality: z.string().max(40).optional(),
          level: z.string().max(40).optional(),
          sort: z.enum(["relevance", "activity", "scheduled"]).optional(),
          recommended: z.enum(["true", "false"]).optional(),
        })
        .strict(),
      q,
    ) as Record<string, string>;
    const rows = await this.db.room.findMany({
      where: {
        status: { in: ["open", "scheduled"] },
        ...(q.q
          ? {
              OR: [
                { title: { contains: q.q.slice(0, 120), mode: "insensitive" } },
                {
                  subject: { contains: q.q.slice(0, 120), mode: "insensitive" },
                },
              ],
            }
          : {}),
        ...(q.subject
          ? { subject: { equals: q.subject, mode: "insensitive" } }
          : {}),
        ...(q.modality ? { modality: q.modality } : {}),
        ...(q.level ? { level: q.level } : {}),
      },
      include: {
        _count: { select: { memberships: { where: { active: true } } } },
      },
      orderBy:
        q.sort === "scheduled" ? { scheduledAt: "asc" } : { updatedAt: "desc" },
      take: 100,
    });
    const u = await this.db.user.findUniqueOrThrow({ where: { id: i.uid } });
    if (q.sort === "activity")
      rows.sort((a, b) => b._count.memberships - a._count.memberships);
    if (q.sort === "relevance" || q.recommended === "true")
      rows.sort(
        (a, b) =>
          Number(
            u.interests.some((x) =>
              b.subject.toLowerCase().includes(x.toLowerCase()),
            ),
          ) -
          Number(
            u.interests.some((x) =>
              a.subject.toLowerCase().includes(x.toLowerCase()),
            ),
          ),
      );
    return Promise.all(rows.map((r) => this.format(r, i.uid)));
  }
  async get(id: string, i: Identity) {
    let r = await this.db.room.findUnique({ where: { id } });
    if (!r) throw new NotFoundException("Sala no encontrada");
    if(r.status==='scheduled'&&r.scheduledAt&&r.scheduledAt<=new Date()){
      await this.db.room.updateMany({where:{id,status:'scheduled',scheduledAt:{lte:new Date()}},data:{status:'open'}});
      r=await this.db.room.findUniqueOrThrow({where:{id}});
    }
    return this.format(r, i.uid);
  }
  async create(i: Identity, body: unknown) {
    this.limiter.check(`create:${i.uid}`, 5, 3600000);
    const data = parse(roomSchema, body);
    if (data.privacy === "private" && !data.accessCode)
      throw new BadRequestException(
        "Las salas privadas necesitan un código de al menos seis caracteres",
      );
    if (
      data.scheduledAt &&
      new Date(data.scheduledAt).getTime() < Date.now() - 60000
    )
      throw new BadRequestException("La fecha debe ser futura");
    const { accessCode, scheduledAt, ...rest } = data;
    const r = await this.db.room.create({
      data: {
        ...rest,
        hostId: i.uid,
        accessHash: accessCode ? hashCode(accessCode) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status:
          scheduledAt && new Date(scheduledAt) > new Date()
            ? "scheduled"
            : "open",
        memberships: { create: { userId: i.uid, role: "host" } },
        sessions: { create: { title: data.title, participantIds: [i.uid] } },
      },
    });
    return this.format(r, i.uid);
  }
  async update(id: string, i: Identity, body: unknown) {
    const d = parse(roomSchema.partial(), body);
    const r = await this.db.serial(async (tx) => {
      const m = await tx.membership.findUnique({
        where: { roomId_userId: { roomId: id, userId: i.uid } },
        include: { room: true },
      });
      if (!m?.active || m.banned || m.role !== "host")
        throw new ForbiddenException("Solo el anfitrión puede editar la sala");
      if (!["open", "scheduled"].includes(m.room.status))
        throw new ConflictException("La sala ya terminó");
      if (
        d.capacity &&
        d.capacity <
          (await tx.membership.count({ where: { roomId: id, active: true } }))
      )
        throw new ConflictException(
          "Hay más participantes que la nueva capacidad",
        );
      if (d.scheduledAt && new Date(d.scheduledAt) < new Date())
        throw new BadRequestException("La fecha debe ser futura");
      if (d.privacy === "private" && !d.accessCode && !m.room.accessHash)
        throw new BadRequestException("Define un código privado");
      const { accessCode, scheduledAt, ...rest } = d;
      return tx.room.update({
        where: { id },
        data: {
          ...rest,
          ...(accessCode ? { accessHash: hashCode(accessCode) } : {}),
          ...(scheduledAt !== undefined
            ? {
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                status: scheduledAt ? "scheduled" : "open",
              }
            : {}),
        },
      });
    });
    const result = await this.format(r, i.uid);
    const { myRole, ...broadcast } = result;
    this.events.emit(id, "room:updated", broadcast);
    return result;
  }
  async join(id: string, i: Identity, body: unknown) {
    this.limiter.check(`join:${i.uid}`, 15);
    const d = parse(
      z
        .object({
          code: z.string().max(64).optional(),
          inviteToken: z.string().max(200).optional(),
        })
        .strict(),
      body,
    );
    await this.db.serial(async (tx) => {
      const r = await tx.room.findUnique({ where: { id } });
      if (!r) throw new NotFoundException("Sala no encontrada");
      if (["closed", "cancelled"].includes(r.status))
        throw new ConflictException("La sala ya terminó");
      const old = await tx.membership.findUnique({
        where: { roomId_userId: { roomId: id, userId: i.uid } },
      });
      if (old?.banned)
        throw new ForbiddenException("El anfitrión retiró tu acceso");
      if (old?.active){
        if(r.status==='scheduled'&&r.scheduledAt&&r.scheduledAt<=new Date())await tx.room.update({where:{id},data:{status:'open'}});
        return;
      }
      if (r.scheduledAt && r.scheduledAt > new Date())
        throw new ConflictException("La sala todavía no ha comenzado");
      if (r.privacy === "private" && r.hostId !== i.uid) {
        const invite = d.inviteToken
          ? await tx.invite.findUnique({
              where: { tokenHash: sha(d.inviteToken) },
            })
          : null;
        if (
          !(invite?.roomId === id && invite.expiresAt > new Date()) &&
          !checkCode(d.code ?? "", r.accessHash)
        )
          throw new ForbiddenException("Código o invitación inválidos");
      }
      const n = await tx.membership.count({
        where: { roomId: id, active: true },
      });
      if (n >= r.capacity) throw new ConflictException("La sala está llena");
      await tx.membership.upsert({
        where: { roomId_userId: { roomId: id, userId: i.uid } },
        create: { roomId: id, userId: i.uid },
        update: { active: true, leftAt: null },
      });
      await tx.room.update({ where: { id }, data: { status: "open" } });
      const session = await tx.session.findFirst({
        where: { roomId: id, endedAt: null },
      });
      if (session && !session.participantIds.includes(i.uid))
        await tx.session.update({
          where: { id: session.id },
          data: { participantIds: { push: i.uid } },
        });
    });
    await this.broadcastMembers(id);
    return this.get(id, i);
  }
  async leave(id: string, i: Identity) {
    const m = await this.member(id, i.uid);
    await this.db.membership.update({
      where: { id: m.id },
      data: { active: false, handRaised: false, leftAt: new Date() },
    });
    this.events.evict(id, i.uid);
    await this.removeMedia(id, i.uid);
    await this.broadcastMembers(id);
    return { ok: true };
  }
  async members(id: string, uid: string) {
    await this.member(id, uid, undefined, true);
    return this.memberList(id);
  }
  async memberList(id: string) {
    const rows = await this.db.membership.findMany({
      where: { roomId: id, active: true },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });
    return rows.map((m) => ({
      userId: m.userId,
      displayName: m.user.displayName,
      role: m.role,
      handRaised: m.handRaised,
      online: this.events.online(id, m.userId),
    }));
  }
  async broadcastMembers(id: string) {
    this.events.emit(id, "room:members", await this.memberList(id));
  }
  async role(id: string, target: string, i: Identity, body: unknown) {
    await this.member(id, i.uid, ["host"]);
    const { role } = parse(
      z.object({ role: z.enum(["moderator", "participant"]) }).strict(),
      body,
    );
    const m = await this.member(id, target);
    if (m.role === "host")
      throw new ForbiddenException("El anfitrión conserva su rol");
    await this.db.membership.update({ where: { id: m.id }, data: { role } });
    await this.broadcastMembers(id);
    return { ok: true };
  }
  async kick(id: string, target: string, i: Identity) {
    const actor = await this.member(id, i.uid, ["host", "moderator"]);
    const m = await this.member(id, target);
    if (m.role === "host" || (m.role === "moderator" && actor.role !== "host"))
      throw new ForbiddenException("No puedes retirar a este participante");
    await this.db.membership.update({
      where: { id: m.id },
      data: { active: false, banned: true, leftAt: new Date() },
    });
    this.events.evict(id, target);
    await this.removeMedia(id, target);
    await this.broadcastMembers(id);
    return { ok: true };
  }
  async invite(id: string, i: Identity) {
    await this.member(id, i.uid, ["host", "moderator"]);
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 86400000);
    await this.db.invite.create({
      data: { roomId: id, tokenHash: sha(token), expiresAt },
    });
    return {
      token,
      expiresAt,
      url: `${process.env.WEB_ORIGIN?.split(",")[0] ?? "http://localhost:5173"}/salas/${id}?invite=${token}`,
    };
  }
  async messages(id: string, uid: string) {
    await this.member(id, uid, undefined, true);
    const data = await this.db.message.findMany({
      where: { roomId: id },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return data.reverse();
  }
  async message(id: string, i: Identity, body: unknown) {
    const m = await this.member(id, i.uid);
    if (m.room.status !== "open")
      throw new ConflictException("La sala no está abierta");
    this.limiter.check(`chat:${i.uid}`, 30);
    const d = parse(messageSchema, body);
    const value = await this.db.message.upsert({
      where: {
        roomId_userId_clientId: {
          roomId: id,
          userId: i.uid,
          clientId: d.clientId,
        },
      },
      create: {
        roomId: id,
        userId: i.uid,
        displayName: m.user.displayName,
        ...d,
      },
      update: {},
    });
    this.events.emit(id, "chat:message", value);
    return value;
  }
  async notes(id: string, i: Identity, body?: unknown) {
    await this.member(id, i.uid, undefined, true);
    if (body === undefined)
      return (
        (await this.db.note.findUnique({
          where: { roomId_userId: { roomId: id, userId: i.uid } },
        })) ?? { text: "" }
      );
    const { text } = parse(
      z.object({ text: z.string().max(30000) }).strict(),
      body,
    );
    return this.db.note.upsert({
      where: { roomId_userId: { roomId: id, userId: i.uid } },
      create: { roomId: id, userId: i.uid, text },
      update: { text },
    });
  }
  async timer(id: string, i: Identity, body?: unknown) {
    const m = await this.member(
      id,
      i.uid,
      body === undefined ? undefined : ["host", "moderator"],
    );
    let t = m.room.timer as any;
    if (body === undefined) return t;
    if (m.room.status !== "open")
      throw new ConflictException("La sala no está abierta");
    const d = parse(timerSchema, body);
    const remaining = t.running
      ? Math.max(
          0,
          Math.ceil((new Date(t.endsAt).getTime() - Date.now()) / 1000),
        )
      : t.remainingSeconds;
    t = {
      mode: d.mode,
      remainingSeconds:
        d.action === "reset"
          ? (d.durationSeconds ?? 1500)
          : (d.durationSeconds ?? remaining),
      running: d.action === "start",
    };
    if (t.running)
      t.endsAt = new Date(Date.now() + t.remainingSeconds * 1000).toISOString();
    await this.db.room.update({ where: { id }, data: { timer: t } });
    this.events.emit(id, "timer:updated", t);
    return t;
  }
  mediaClient() {
    if (
      !process.env.LIVEKIT_URL ||
      !process.env.LIVEKIT_API_KEY ||
      !process.env.LIVEKIT_API_SECRET
    )
      throw new ServiceUnavailableException(
        "Las videollamadas todavía no están configuradas",
      );
    return new RoomServiceClient(
      process.env.LIVEKIT_URL.replace(/^ws/, "http"),
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {requestTimeout:8},
    );
  }
  async mediaToken(id: string, i: Identity) {
    const m = await this.member(id, i.uid);
    if (m.room.status !== "open")
      throw new ConflictException("La sala no está abierta");
    const client = this.mediaClient();
    await this.db.serial(async (tx) => {
      const usage = await tx.usage.upsert({
        where: { id: monthKey() },
        create: { id: monthKey() },
        update: {},
      });
      const existing = await tx.mediaGrant.findUnique({
        where: { roomId_userId: { roomId: id, userId: i.uid } },
      });
      if (existing && existing.expiresAt > new Date()) return;
      const minutes = m.room.durationMinutes;
      const bytes = BigInt(minutes * 60 * 750000);
      if (
        usage.participantMinutes + minutes > CAPS.participantMinutes ||
        usage.mediaBytes + bytes > BigInt(CAPS.mediaBytes)
      )
        denyQuota(
          "La cuota gratuita de videollamada no permite otra sesión completa.",
        );
      if (
        (await tx.mediaGrant.count({
          where: { expiresAt: { gt: new Date() } },
        })) >= 80
      )
        denyQuota("No quedan conexiones gratuitas disponibles");
      await tx.usage.update({
        where: { id: usage.id },
        data: {
          participantMinutes: { increment: minutes },
          mediaBytes: { increment: bytes },
        },
      });
      await tx.mediaGrant.upsert({
        where: { roomId_userId: { roomId: id, userId: i.uid } },
        create: {
          roomId: id,
          userId: i.uid,
          reservedMinutes: minutes,
          reservedBytes: bytes,
          expiresAt: new Date(Date.now() + minutes * 60000),
        },
        update: {
          reservedMinutes: minutes,
          reservedBytes: bytes,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + minutes * 60000),
        },
      });
    });
    try{await client.createRoom({
      name: id,
      maxParticipants: m.room.capacity,
      emptyTimeout: 60,
      departureTimeout: 20,
    });}catch{throw new ServiceUnavailableException('No se pudo conectar con la videollamada. La sala y el chat siguen disponibles; vuelve a intentarlo.');}
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: i.uid, name: m.user.displayName, ttl: "1m" },
    );
    token.addGrant({
      room: id,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: false,
    });
    return { token: await token.toJwt(), url: process.env.LIVEKIT_URL };
  }
  async removeMedia(id: string, uid: string) {
    try {
      await this.mediaClient().removeParticipant(id, uid);
    } catch (e) {
      if (!(e instanceof ServiceUnavailableException))
        process.stderr.write(
          JSON.stringify({ event: "media_remove_failed", roomId: id }) + "\n",
        );
    }
  }
  async annotate(id: string, i: Identity, body: unknown) {
    const m = await this.member(id, i.uid);
    if (m.room.status !== "open")
      throw new ConflictException("La sala no está abierta");
    this.limiter.check(`annotation:${i.uid}`, 20, 1000);
    const d = parse(annotationSchema, body);
    let participants;
    try{participants = await this.mediaClient().listParticipants(id);}catch{throw new ServiceUnavailableException('No se pudo comprobar la pantalla compartida. Intenta de nuevo.');}
    const owner = participants.find((p) =>
      p.tracks.some(
        (t) => t.sid === d.screenId && Number(t.source) === 3 && !t.muted,
      ),
    );
    if (!owner)
      throw new ConflictException("La pantalla compartida ya no está activa");
    if (owner.identity !== i.uid && !["host", "moderator"].includes(m.role))
      throw new ForbiddenException(
        "Solo el emisor o un moderador puede señalar esta pantalla",
      );
    const annotation = {
      ...d,
      userId: i.uid,
      createdAt: new Date().toISOString(),
    };
    await this.db.serial(async (tx) => {
      const r = await tx.room.findUniqueOrThrow({ where: { id } });
      const existing = (r.annotations as any[]).filter(
        (a) =>
          !(
            a.screenId === d.screenId &&
            (d.action === "clear" ||
              (d.action === "point" && a.action === "point"))
          ),
      );
      const next =
        d.action === "clear" ? existing : [...existing, annotation].slice(-40);
      await tx.room.update({ where: { id }, data: { annotations: next } });
    });
    this.events.emit(id, "annotation:updated", annotation);
    return annotation;
  }
  async state(id: string, i: Identity) {
    const m = await this.member(id, i.uid);
    let annotations: any[] = [];
    try {
      const participants = await this.mediaClient().listParticipants(id);
      const active = new Set(
        participants.flatMap((p) =>
          p.tracks
            .filter((t) => Number(t.source) === 3 && !t.muted)
            .map((t) => t.sid),
        ),
      );
      annotations = (m.room.annotations as any[]).filter((a) =>
        active.has(a.screenId),
      );
    } catch {}
    return {
      members: await this.memberList(id),
      messages: await this.messages(id, i.uid),
      timer: m.room.timer,
      annotations,
    };
  }
  async close(id: string, i: Identity, cancel = false) {
    await this.member(id, i.uid, ["host"]);
    const session = await this.db.serial(async (tx) => {
      const room = await tx.room.findUniqueOrThrow({ where: { id } });
      if (["closed", "cancelled"].includes(room.status))
        return tx.session.findFirst({
          where: { roomId: id },
          orderBy: { startedAt: "desc" },
        });
      await tx.room.update({
        where: { id },
        data: { status: cancel ? "cancelled" : "closed", annotations: [] },
      });
      await tx.invite.deleteMany({ where: { roomId: id } });
      const session = await tx.session.findFirst({
        where: { roomId: id, endedAt: null },
      });
      if (!session) return null;
      const messages = await tx.message.findMany({
        where: { roomId: id, kind: "user" },
        orderBy: { createdAt: "asc" },
        take: 1000,
      });
      const docs = await tx.document.findMany({
        where: { roomId: id },
        select: { id: true, name: true, extractedText: true },
      });
      const saved = await tx.session.update({
        where: { id: session.id },
        data: {
          endedAt: new Date(),
          context: {
            messages: messages.map((m) => ({ id: m.id, text: m.text })),
            documents: docs,
          },
          participantIds: {
            set: (
              await tx.membership.findMany({
                where: { roomId: id, banned: false },
                select: { userId: true },
              })
            ).map((m) => m.userId),
          },
        },
      });
      if (!cancel && (messages.length || docs.length)) {
        const context = messages
          .map((m) => "[mensaje:" + m.id + "] " + m.text)
          .concat(
            docs.map(
              (d) =>
                "[documento:" + d.id + " " + d.name + "] " + d.extractedText,
            ),
          )
          .join("\n");
        const sources = messages
          .map((m) => "mensaje:" + m.id)
          .concat(docs.map((d) => "documento:" + d.id));
        for (const kind of ["summary", "keypoints", "quiz"])
          await tx.aiJob.upsert({
            where: { idempotencyKey: "artifact:" + saved.id + ":" + kind },
            create: {
              roomId: id,
              sessionId: saved.id,
              userId: i.uid,
              kind,
              priority: 10,
              shared: true,
              idempotencyKey: "artifact:" + saved.id + ":" + kind,
              payload: { context, sources },
              ...(Buffer.byteLength(context) > 60000
                ? {
                    status: "failed",
                    error:
                      "El contexto supera 60 KB. Divide el material en sesiones más cortas.",
                  }
                : {}),
            },
            update: {},
          });
      }
      return saved;
    });
    try {
      await this.mediaClient().deleteRoom(id);
    } catch {}
    this.events.emit(id, "room:closed", { roomId: id });
    return session;
  }
  async usage() {
    const u = await this.db.usage.findUnique({ where: { id: monthKey() } });
    const files = await this.db.document.aggregate({ _sum: { size: true } });
    const dbSize = await this.db.$queryRaw<
      { bytes: bigint }[]
    >`SELECT pg_database_size(current_database())::bigint AS bytes`;
    const used = {
      ngrokRequests: u?.ngrokRequests ?? 0,
      ngrokBytes: Number(u?.ngrokBytes ?? 0),
      participantMinutes: u?.participantMinutes ?? 0,
      mediaBytes: Number(u?.mediaBytes ?? 0),
      storage: files._sum.size ?? 0,
      storageEgress: Number(u?.storageEgress ?? 0),
      database: Number(dbSize[0]?.bytes ?? 0),
    };
    return {
      month: monthKey(),
      used,
      limits: CAPS,
      warnings: Object.entries(used)
        .filter(([k, v]) => v >= CAPS[k as keyof typeof CAPS] * 0.8)
        .map(([k]) => k),
      mediaAccounting:
        "Reserva conservadora por duración y 6 Mbps de descarga. Verificar consumo real en el panel LiveKit.",
      configured: {
        media: !!process.env.LIVEKIT_URL,
        storage: !!process.env.SUPABASE_URL,
        ai: !!process.env.AI_GATEWAY_URL,
      },
    };
  }
}
