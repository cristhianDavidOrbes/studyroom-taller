import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ServiceUnavailableException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthGuard, Db, Identity, IdentityService, RateLimiter } from "./core";
import { Rooms } from "./rooms";
import { Documents } from "./documents";
import { Ai } from "./ai";
import { StorageGuard } from "./storage-guard";
type Authed = Request & { identity: Identity };
@Controller()
export class HealthController {
  constructor(private db: Db) {}
  @Get("health")
  @ApiOperation({ summary: "Estado de la API y conexión PostgreSQL" })
  async health() {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return {
        status: "ok",
        service: "StudyRoom",
        time: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        "La base de datos no está disponible",
      );
    }
  }
}
@Controller()
@UseGuards(AuthGuard, StorageGuard)
@ApiBearerAuth()
@ApiTags("StudyRoom")
export class AppController {
  constructor(
    private rooms: Rooms,
    private identities: IdentityService,
    private documents: Documents,
    private ai: Ai,
    private rate: RateLimiter,
  ) {}
  @Get("me") me(@Req() r: Authed) {
    return this.rooms.profile(r.identity);
  }
  @Patch("me") profile(@Req() r: Authed, @Body() b: unknown) {
    return this.rooms.profile(r.identity, b);
  }
  @Post("auth/logout") async logout(@Req() r: Authed) {
    const result = await this.identities.logout(r.identity.uid);
    this.rooms.events.server
      ?.in(`user:${r.identity.uid}`)
      .disconnectSockets(true);
    return result;
  }
  @Get("rooms") list(@Req() r: Authed, @Query() q: Record<string, string>) {
    return this.rooms.list(r.identity, q);
  }
  @Post("rooms") create(@Req() r: Authed, @Body() b: unknown) {
    return this.rooms.create(r.identity, b);
  }
  @Get("rooms/:id") room(@Req() r: Authed, @Param("id") id: string) {
    return this.rooms.get(id, r.identity);
  }
  @Patch("rooms/:id") update(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.rooms.update(id, r.identity, b);
  }
  @Post("rooms/:id/join") join(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.rooms.join(id, r.identity, b);
  }
  @Post("rooms/:id/leave") leave(@Req() r: Authed, @Param("id") id: string) {
    return this.rooms.leave(id, r.identity);
  }
  @Post("rooms/:id/close") async close(
    @Req() r: Authed,
    @Param("id") id: string,
  ) {
    const session = await this.rooms.close(id, r.identity);
    if (session)
      for (const kind of ["summary", "keypoints", "quiz"])
        await this.ai
          .artifact(session.id, r.identity, { kind })
          .catch(() => {});
    return session
      ? { id: session.id, roomId: id, endedAt: session.endedAt }
      : null;
  }
  @Post("rooms/:id/cancel") async cancel(
    @Req() r: Authed,
    @Param("id") id: string,
  ) {
    const s = await this.rooms.close(id, r.identity, true);
    return s ? { id: s.id, roomId: id, endedAt: s.endedAt } : null;
  }
  @Get("rooms/:id/members") members(@Req() r: Authed, @Param("id") id: string) {
    return this.rooms.members(id, r.identity.uid);
  }
  @Patch("rooms/:id/members/:uid") role(
    @Req() r: Authed,
    @Param("id") id: string,
    @Param("uid") uid: string,
    @Body() b: unknown,
  ) {
    return this.rooms.role(id, uid, r.identity, b);
  }
  @Delete("rooms/:id/members/:uid") kick(
    @Req() r: Authed,
    @Param("id") id: string,
    @Param("uid") uid: string,
  ) {
    return this.rooms.kick(id, uid, r.identity);
  }
  @Post("rooms/:id/invites") invite(@Req() r: Authed, @Param("id") id: string) {
    return this.rooms.invite(id, r.identity);
  }
  @Get("rooms/:id/messages") messages(
    @Req() r: Authed,
    @Param("id") id: string,
  ) {
    return this.rooms.messages(id, r.identity.uid);
  }
  @Post("rooms/:id/messages") async message(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    const message = await this.rooms.message(id, r.identity, b);
    if (/(?:^|\s)@IA(?:\s|$)/i.test(message.text)) {
      try {
        await this.ai.ask(
          id,
          r.identity,
          {
            question: message.text.replace(/@IA/gi, "").trim(),
            includeChat: true,
            documentIds: [],
          },
          true,
          message.clientId,
        );
      } catch (e) {
        this.rooms.events.personal(r.identity.uid, "ai:error", {
          message: e instanceof Error ? e.message : "No se pudo solicitar IA",
        });
      }
    }
    return message;
  }
  @Get("rooms/:id/notes") notes(@Req() r: Authed, @Param("id") id: string) {
    return this.rooms.notes(id, r.identity);
  }
  @Put("rooms/:id/notes") note(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.rooms.notes(id, r.identity, b);
  }
  @Get("rooms/:id/documents") docs(@Req() r: Authed, @Param("id") id: string) {
    return this.documents.list(id, r.identity);
  }
  @Post("rooms/:id/documents")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10_000_000, files: 1, fields: 0 },
    }),
  )
  upload(
    @Req() r: Authed,
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.rate.check(`upload:${r.identity.uid}`, 10, 3600000);
    return this.documents.upload(id, r.identity, file);
  }
  @Get("rooms/:id/documents/:docId/url") url(
    @Req() r: Authed,
    @Param("id") id: string,
    @Param("docId") docId: string,
  ) {
    return this.documents.url(id, docId, r.identity);
  }
  @Delete("rooms/:id/documents/:docId") remove(
    @Req() r: Authed,
    @Param("id") id: string,
    @Param("docId") docId: string,
  ) {
    return this.documents.remove(id, docId, r.identity);
  }
  @Get("rooms/:id/timer") timer(@Req() r: Authed, @Param("id") id: string) {
    return this.rooms.timer(id, r.identity);
  }
  @Put("rooms/:id/timer") setTimer(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.rooms.timer(id, r.identity, b);
  }
  @Post("rooms/:id/media/token") token(
    @Req() r: Authed,
    @Param("id") id: string,
  ) {
    return this.rooms.mediaToken(id, r.identity);
  }
  @Get("rooms/:id/state") state(@Req() r: Authed, @Param("id") id: string) {
    return this.rooms.state(id, r.identity);
  }
  @Post("rooms/:id/annotations") annotate(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.rooms.annotate(id, r.identity, b);
  }
  @Get("usage") usage() {
    return this.rooms.usage();
  }
  @Post("rooms/:id/ai") ask(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.ai.ask(id, r.identity, b);
  }
  @Get("ai/jobs/:id") job(@Req() r: Authed, @Param("id") id: string) {
    return this.ai.get(id, r.identity);
  }
  @Post("ai/jobs/:id/cancel") cancelJob(
    @Req() r: Authed,
    @Param("id") id: string,
  ) {
    return this.ai.cancel(id, r.identity);
  }
  @Post("ai/answers/:id/feedback") feedback(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.ai.feedback(id, r.identity, b);
  }
  @Get("sessions") sessions(@Req() r: Authed) {
    return this.ai.history(r.identity);
  }
  @Get("sessions/:id") session(@Req() r: Authed, @Param("id") id: string) {
    return this.ai.detail(id, r.identity);
  }
  @Get("sessions/:id/export") async export(
    @Req() r: Authed,
    @Param("id") id: string,
    @Query("format") format: string,
    @Res() res: Response,
  ) {
    const data = await this.ai.detail(id, r.identity);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="studyroom-${data.id}.${format === "markdown" ? "md" : "json"}"`,
    );
    if (format === "markdown") {
      const text =
        `# ${data.title}\n\nInicio: ${data.startedAt.toISOString()}\nFin: ${data.endedAt?.toISOString() ?? "Pendiente"}\n\n` +
        data.jobs
          .map(
            (j) =>
              `## ${j.kind} — ${j.status}\n\n${(j.result as any)?.text ?? JSON.stringify(j.result ?? { error: j.error })}`,
          )
          .join("\n\n");
      res.type("text/markdown").send(text);
    } else res.json(data);
  }
  @Post("sessions/:id/artifacts") artifact(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.ai.artifact(id, r.identity, b);
  }
  @Post("sessions/:id/quiz/attempts") quiz(
    @Req() r: Authed,
    @Param("id") id: string,
    @Body() b: unknown,
  ) {
    return this.ai.quiz(id, r.identity, b);
  }
}
