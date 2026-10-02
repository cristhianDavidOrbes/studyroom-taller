import { Injectable } from "@nestjs/common";
import type { Server } from "socket.io";
@Injectable()
export class Events {
  server?: Server;
  emit(roomId: string, name: string, data: unknown) {
    this.server?.to(`room:${roomId}`).emit(name, data);
  }
  personal(uid: string, name: string, data: unknown) {
    this.server?.to(`user:${uid}`).emit(name, data);
  }
  evict(roomId: string, userId: string) {
    for (const socket of this.server?.sockets.sockets.values() ?? []) {
      if (socket.data.uid === userId) {
        socket.emit("room:removed", { roomId });
        void socket.leave(`room:${roomId}`);
      }
    }
  }
  online(roomId: string, userId: string) {
    return Array.from(this.server?.sockets.sockets.values() ?? []).some(
      (s) => s.data.uid === userId && s.rooms.has(`room:${roomId}`),
    );
  }
}
