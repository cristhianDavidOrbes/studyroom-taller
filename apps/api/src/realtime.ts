import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { OnModuleDestroy, ConflictException } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { IdentityService, RateLimiter, parse } from "./core";
import { Rooms } from "./rooms";
import { Events } from "./events";
import { z } from "zod";

@WebSocketGateway({
  cors: {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = (process.env.WEB_ORIGIN ?? "http://localhost:5173").split(
        ",",
      );
      callback(
        !origin || allowed.includes(origin)
          ? null
          : new Error("Origen no permitido"),
        !origin || allowed.includes(origin),
      );
    },
  },
  maxHttpBufferSize: 20000,
})
export class Realtime
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  private authTimer?: NodeJS.Timeout;
  @WebSocketServer() server!: Server;
  constructor(
    private identity: IdentityService,
    private rooms: Rooms,
    private events: Events,
    private rate: RateLimiter,
  ) {}
  afterInit(server: Server) {
    this.events.server = server;
    server.use(async (socket, next) => {
      try {
        const who = await this.identity.verify(socket.handshake.auth?.token);
        socket.data.uid = who.uid;
        socket.data.token = socket.handshake.auth.token;
        socket.data.joined = new Set<string>();
        next();
      } catch {
        next(new Error("La sesión venció"));
      }
    });
    this.authTimer = setInterval(() => {
      for (const socket of server.sockets.sockets.values())
        void this.identity.verify(socket.data.token).catch(() => {
          socket.emit("auth:error", { message: "La sesión venció" });
          socket.disconnect(true);
        });
    }, 30000);
    this.authTimer.unref();
  }
  onModuleDestroy() {
    if (this.authTimer) clearInterval(this.authTimer);
  }
  async handleConnection(socket: Socket) {
    await socket.join(`user:${socket.data.uid}`);
  }
  async handleDisconnect(socket: Socket) {
    for (const id of socket.data.joined ?? [])
      await this.rooms.broadcastMembers(id).catch(() => {});
  }
  private async auth(socket: Socket) {
    this.rate.check(`socket:${socket.id}`, 60);
    const who = await this.identity.verify(
      socket.data.token ?? socket.handshake.auth?.token,
    );
    if (who.uid !== socket.data.uid) throw new Error("Identidad inválida");
    return who;
  }
  @SubscribeMessage("room:join") async join(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: unknown,
  ) {
    try {
      const who = await this.auth(socket);
      const { roomId } = parse(
        z.object({ roomId: z.string().uuid() }).strict(),
        body,
      );
      await this.rooms.member(roomId, who.uid);
      if (socket.data.joined.size >= 3 && !socket.data.joined.has(roomId))
        throw new Error("Cierra otra sala antes de continuar");
      await socket.join(`room:${roomId}`);
      socket.data.joined.add(roomId);
      socket.emit("room:state", await this.rooms.state(roomId, who));
      await this.rooms.broadcastMembers(roomId);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Acceso denegado",
      };
    }
  }
  @SubscribeMessage("room:leave") async leave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: unknown,
  ) {
    try {
      const { roomId } = parse(
        z.object({ roomId: z.string().uuid() }).strict(),
        body,
      );
      await socket.leave(`room:${roomId}`);
      socket.data.joined?.delete(roomId);
      await this.rooms.broadcastMembers(roomId);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
  @SubscribeMessage("room:reaction") async reaction(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: unknown,
  ) {
    try {
      const who = await this.auth(socket);
      this.rate.check(`reaction:${who.uid}`, 10, 10000);
      const d = parse(
        z
          .object({
            roomId: z.string().uuid(),
            emoji: z.enum(["👍", "👏", "🎉", "❤️", "🤔", "💡"]),
          })
          .strict(),
        body,
      );
      const member = await this.rooms.member(d.roomId, who.uid);
      if (member.room.status !== "open")
        throw new ConflictException("La sala no está abierta");
      this.events.emit(d.roomId, "room:reaction", {
        userId: who.uid,
        emoji: d.emoji,
      });
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Acceso denegado",
      };
    }
  }
  @SubscribeMessage("room:hand") async hand(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: unknown,
  ) {
    try {
      const who = await this.auth(socket);
      const d = parse(
        z.object({ roomId: z.string().uuid(), raised: z.boolean() }).strict(),
        body,
      );
      const m = await this.rooms.member(d.roomId, who.uid);
      if (m.room.status !== "open")
        throw new ConflictException("La sala no está abierta");
      await this.rooms.db.membership.update({
        where: { id: m.id },
        data: { handRaised: d.raised },
      });
      this.events.emit(d.roomId, "room:hand", {
        userId: who.uid,
        raised: d.raised,
      });
      await this.rooms.broadcastMembers(d.roomId);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Acceso denegado",
      };
    }
  }
}
