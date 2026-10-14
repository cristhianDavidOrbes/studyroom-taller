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
import { Transcription, AUDIO_MAX_BYTES } from "./transcription";
import { reportMarkdown } from "./report-context";
import { createReportArchive, createReportWord } from "./report-archive";
import { pipeline } from "node:stream/promises";
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
  private archiveInFlight = false;
  constructor(
    private rooms: Rooms,
    private identities: IdentityService,
    private documents: Documents,
    private ai: Ai,
    private rate: RateLimiter,
    private transcription: Transcription,
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
      for (const kind of ["summary", "keypoints"])
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
  @Post("rooms/:id/transcription/consent") consent(@Req() r: Authed, @Param("id") id: string, @Body() b: unknown) {
    return this.transcription.consent(id, r.identity, b);
  }
  @Get("rooms/:id/transcription") transcript(@Req() r: Authed, @Param("id") id: string, @Query() q: unknown) {
    return this.transcription.room(id, r.identity, q);
  }
  @Post("rooms/:id/transcription/audio")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Transcribe tu micrófono con la transcripción activa; WAV PCM16 mono16k hasta30s. Guarda texto y huecos, nunca el audio." })
  @ApiBody({ schema: { type: "object", additionalProperties: false, required: ["audio", "clientId", "sessionId", "startMs", "endMs"], properties: {
    audio: { type: "string", format: "binary", description: "WAV canónico (cabecera44bytes), máximo960044bytes." }, clientId: { type: "string", format: "uuid" }, sessionId: { type: "string", format: "uuid" }, startMs: { type: "integer", minimum: 0, description: "Milisegundos desde session.startedAt" }, endMs: { type: "integer", minimum: 1 },
  } } })
  @UseInterceptors(FileInterceptor("audio", { limits: { fileSize: AUDIO_MAX_BYTES, files: 1, fields: 4, fieldSize: 100, parts: 5 } }))
  transcribe(@Req() r: Authed, @Param("id") id: string, @Body() b: unknown, @UploadedFile() audio: Express.Multer.File) {
    return this.transcription.audio(id, r.identity, b, audio);
  }
  @Post("rooms/:id/transcription/gaps") transcriptionGap(@Req() r: Authed, @Param("id") id: string, @Body() b: unknown) {
    return this.transcription.gap(id, r.identity, b);
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
  @Get("sessions") sessions(@Req() r: Authed, @Query("after") after?: string) {
    return this.ai.history(r.identity, after);
  }
  @Get("sessions/:id") session(@Req() r: Authed, @Param("id") id: string) {
    return this.ai.detail(id, r.identity);
  }
  @Get("sessions/:id/report") report(@Req() r: Authed, @Param("id") id: string) {
    return this.ai.report(id, r.identity);
  }
  @Post("sessions/:id/questions") reportQuestion(@Req() r: Authed, @Param("id") id: string, @Body() b: unknown) {
    return this.ai.reportQuestion(id, r.identity, b);
  }
  @Get("sessions/:id/documents/:docId/url") reportDocument(@Req() r: Authed, @Param("id") id: string, @Param("docId") docId: string) {
    return this.documents.sessionUrl(id, docId, r.identity);
  }
  @Get("sessions/:id/export") async export(
    @Req() r: Authed,
    @Param("id") id: string,
    @Query("format") format: string,
    @Res() res: Response,
  ) {
    const data = await this.ai.report(id, r.identity);
    if (format === "zip") {
      this.rate.check(`report-export:${r.identity.uid}`, 3, 60000);
      if (this.archiveInFlight) throw new ServiceUnavailableException("Se está preparando otra descarga completa. Intenta nuevamente en un momento.");
      this.archiveInFlight = true;
      try {
        const archive = await createReportArchive(data, (documentId, maxBytes) => this.documents.downloadForReport(id, documentId, r.identity, maxBytes));
        res.setHeader("Content-Disposition", `attachment; filename="studyroom-${data.id}.zip"`);
        res.setHeader("Cache-Control", "private, no-store");
        res.type("application/zip");
        try { await pipeline(archive.stream, res); }
        catch (error) { if (!res.headersSent) throw error; res.destroy(); }
      } finally { this.archiveInFlight = false; }
      return;
    }
    if (format === "docx") {
      this.rate.check(`report-export:${r.identity.uid}`, 3, 60000);
      if (this.archiveInFlight) throw new ServiceUnavailableException("Se está preparando otra descarga. Intenta nuevamente en un momento.");
      this.archiveInFlight = true;
      try {
        const word = await createReportWord(data, (documentId, maxBytes) => this.documents.downloadForReport(id, documentId, r.identity, maxBytes));
        res.setHeader("Content-Disposition", `attachment; filename="studyroom-${data.id}.docx"`);
        res.setHeader("Cache-Control", "private, no-store");
        res.type("application/vnd.openxmlformats-officedocument.wordprocessingml.document").send(word);
      } finally { this.archiveInFlight = false; }
      return;
    }
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="studyroom-${data.id}.${format === "markdown" ? "md" : "json"}"`,
    );
    if (format === "markdown") {
      const text = reportMarkdown(data);
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
}
