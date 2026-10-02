import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  ConflictException,
} from "@nestjs/common";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import * as yauzl from "yauzl";
import { Db, Identity, CAPS, denyQuota, monthKey } from "./core";
import { Rooms } from "./rooms";

export function validateFile(file: Express.Multer.File | undefined) {
  if (!file || !file.buffer.length || file.size > 10_000_000)
    throw new BadRequestException("Selecciona un documento de hasta 10 MB");
  const bytes = file.buffer;
  let mime = "";
  if (bytes.subarray(0, 5).toString() === "%PDF-") mime = "application/pdf";
  else if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    mime = "image/png";
  else if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    mime = "image/jpeg";
  else if (
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP"
  )
    mime = "image/webp";
  else if (bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) &&
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    mime = file.mimetype;
  else if (
    ["text/plain", "text/markdown"].includes(file.mimetype) &&
    !bytes.includes(0) &&
    Buffer.from(bytes.toString("utf8")).equals(bytes)
  )
    mime = "text/plain";
  if (!mime)
    throw new BadRequestException(
      "Se permiten PDF, DOCX, texto UTF-8, PNG, JPEG y WebP",
    );
  const name =
    file.originalname.replace(/[\x00-\x1f<>:"/\\|?*]/g, "_").slice(0, 180) ||
    "documento";
  return { mime, name };
}
export async function validateDocx(buffer: Buffer) {
  await new Promise<void>((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true, validateEntrySizes: true }, (error, zip) => {
      if (error || !zip) { reject(new BadRequestException("DOCX inválido")); return; }
      let count = 0, bytes = 0, hasDocument = false, hasTypes = false, completed = false;
      const timer = setTimeout(() => fail(), 5000);
      const fail = () => { if (completed) return; completed = true; clearTimeout(timer); zip.close(); reject(new BadRequestException("DOCX inválido o demasiado grande al descomprimir (máximo 25 MB/200 entradas)")); };
      zip.on("error", fail);
      zip.on("entry", entry => {
        if (++count > 200 || (entry.generalPurposeBitFlag & 1) || entry.fileName.split(/[\\/]/).includes("..") || entry.fileName.startsWith("/") || (bytes += entry.uncompressedSize) > 25000000) { fail(); return; }
        if (entry.fileName === "word/document.xml") hasDocument = true;
        if (entry.fileName === "[Content_Types].xml") hasTypes = true;
        if (/\/$/.test(entry.fileName)) { zip.readEntry(); return; }
        zip.openReadStream(entry, (e, stream) => {
          if (e || !stream) { fail(); return; }
          let actual = 0;
          stream.on("error", fail);
          stream.on("data", chunk => { actual += chunk.length; if (completed || actual > entry.uncompressedSize || actual > 25000000) { stream.destroy(); fail(); } });
          stream.on("end", () => { if (!completed) zip.readEntry(); });
        });
      });
      zip.on("end", () => { if (completed) return; if (!hasDocument || !hasTypes) { fail(); return; } completed = true; clearTimeout(timer); zip.close(); resolve(); });
      zip.readEntry();
    });
  });
}
@Injectable()
export class Documents {
  constructor(
    private db: Db,
    private rooms: Rooms,
  ) {}
  private storage() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
      throw new ServiceUnavailableException(
        "El almacenamiento de documentos todavía no está configurado",
      );
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    ).storage.from(process.env.STORAGE_BUCKET ?? "studyroom-files");
  }
  async list(id: string, i: Identity) {
    await this.rooms.member(id, i.uid, undefined, true);
    return this.db.document.findMany({
      where: { roomId: id },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        createdAt: true,
        uploadedBy: true,
        extractionStatus: true,
        extractionError: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
  async upload(id: string, i: Identity, file: Express.Multer.File | undefined) {
    const member = await this.rooms.member(id, i.uid);
    if (member.room.status !== "open")
      throw new ConflictException("La sala no está abierta");
    const { mime, name } = validateFile(file);
    const f = file!;
    const storage = this.storage();
    let text = "";
    let extractionStatus = "text";
    let extractionError: string | null = null;
    if (mime === "text/plain")
      text = f.buffer.toString("utf8");
    if (mime === "application/pdf") {
      try {
        const parsed = await pdfParse(f.buffer, { max: 100 });
        text = parsed.text;
        if (parsed.numpages > 100) { extractionStatus = "partial"; extractionError = "Solo se extrajeron las primeras 100 páginas. El PDF original está disponible completo."; }
      } catch {
        throw new BadRequestException(
          "No se pudo leer este PDF. Prueba un documento sin contraseña.",
        );
      }
    }
    if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      await validateDocx(f.buffer);
      try { text = (await mammoth.extractRawText({ buffer: f.buffer })).value; }
      catch { throw new BadRequestException("No se pudo leer el contenido de este DOCX"); }
    }
    if (mime.startsWith("image/")) {
      try {
        const result = await this.extractImage(f.buffer, mime); text = result.text;
        extractionStatus = result.truncated ? "partial" : text.trim() ? "ocr" : "no_text";
        if (result.truncated) extractionError = "La extracción de texto de esta imagen alcanzó el límite local y está incompleta. La imagen original sigue disponible completa.";
      }
      catch { extractionStatus = "unavailable"; extractionError = "No fue posible extraer texto de esta imagen con la IA local. El archivo original sí se guardó."; }
    }
    if (!text.trim() && extractionStatus === "text") extractionStatus = "no_text";
    const docId = randomUUID();
    const path = `${id}/${docId}`;
    // Reserve bytes in PostgreSQL before upload; serializable isolation prevents concurrent quota overrun.
    const doc = await this.db.serial(async (tx) => {
      const current = await tx.membership.findUnique({ where: { roomId_userId: { roomId: id, userId: i.uid } }, include: { room: true } });
      if (!current?.active || current.banned || current.room.status !== "open") throw new ConflictException("La sala dejó de estar abierta durante la preparación del archivo");
      const total = await tx.document.aggregate({ _sum: { size: true } });
      if ((total._sum.size ?? 0) + f.size > CAPS.storage)
        denyQuota("No queda espacio gratuito para este documento");
      return tx.document.create({
        data: {
          id: docId,
          roomId: id,
          name,
          mimeType: mime,
          size: f.size,
          path,
          uploadedBy: i.uid,
          extractedText: text,
          extractionStatus,
          extractionError,
        },
      });
    });
    const { error } = await storage.upload(path, f.buffer, {
      contentType: mime,
      cacheControl: "0",
      upsert: false,
    });
    if (error) {
      await this.db.document.delete({ where: { id: doc.id } });
      throw new ServiceUnavailableException(
        "No se pudo guardar el archivo. La cuota o conexión del almacenamiento no están disponibles.",
      );
    }
    await this.db.serial(async tx => {
      const session = await tx.session.findFirst({ where: { roomId: id }, orderBy: { startedAt: "desc" } });
      if (session && session.startedAt <= doc.createdAt && (!session.endedAt || session.endedAt >= doc.createdAt))
        await tx.sessionDocument.upsert({ where: { sessionId_documentId: { sessionId: session.id, documentId: doc.id } },
          create: { sessionId: session.id, documentId: doc.id, name: doc.name, mimeType: doc.mimeType, size: doc.size, uploadedBy: doc.uploadedBy, extractedText: doc.extractedText, extractionStatus: doc.extractionStatus, extractionError: doc.extractionError, createdAt: doc.createdAt }, update: {},
        });
    });
    this.rooms.events.emit(id, "documents:updated", { roomId: id });
    const { extractedText, path: _, ...safe } = doc;
    return safe;
  }
  async url(id: string, docId: string, i: Identity) {
    await this.rooms.member(id, i.uid, undefined, true);
    const doc = await this.db.document.findFirst({
      where: { id: docId, roomId: id },
    });
    if (!doc) throw new NotFoundException("Documento no encontrado");
    return this.signedUrl(doc);
  }
  async sessionUrl(sessionId: string, docId: string, i: Identity) {
    const session = await this.db.session.findUnique({ where: { id: sessionId } });
    if (!session || !session.participantIds.includes(i.uid)) throw new ForbiddenException("Este archivo no pertenece a tu historial");
    await this.rooms.member(session.roomId, i.uid, undefined, true);
    const record = await this.db.sessionDocument.findUnique({ where: { sessionId_documentId: { sessionId, documentId: docId } } });
    const legacy = (session.context as any).documents?.some((d: any) => d.id === docId);
    if (!record && !legacy) throw new ForbiddenException("Este archivo no pertenece a este reporte");
    const doc = await this.db.document.findFirst({ where: { id: docId, roomId: session.roomId } });
    if (!doc) throw new NotFoundException("El archivo original fue eliminado; su registro permanece en el reporte");
    return this.signedUrl(doc);
  }
  private async signedUrl(doc: { path: string; size: number }) {
    await this.db.serial(async (tx) => {
      const u = await tx.usage.upsert({
        where: { id: monthKey() },
        create: { id: monthKey() },
        update: {},
      });
      if (u.storageEgress + BigInt(doc.size) > BigInt(CAPS.storageEgress))
        denyQuota("Se alcanzó la cuota gratuita de descarga");
      await tx.usage.update({
        where: { id: u.id },
        data: { storageEgress: { increment: doc.size } },
      });
    });
    const { data, error } = await this.storage().createSignedUrl(doc.path, 60);
    if (error)
      throw new ServiceUnavailableException(
        "No fue posible preparar la descarga",
      );
    return { url: data.signedUrl, expiresIn: 60 };
  }
  private async extractImage(image: Buffer, mimeType: string) {
    if (!process.env.AI_GATEWAY_URL || !process.env.AI_GATEWAY_TOKEN) throw new Error("OCR unavailable");
    const url = new URL(process.env.AI_GATEWAY_URL);
    if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("Insecure OCR endpoint");
    const body = JSON.stringify({ imageBase64: image.toString("base64"), mimeType });
    const reservation = Buffer.byteLength(body) + 504096, month = monthKey();
    await this.db.serial(async tx => {
      const u = await tx.usage.upsert({ where: { id: month }, create: { id: month }, update: {} });
      if (u.ngrokRequests + 1 > CAPS.ngrokRequests || u.ngrokBytes + BigInt(reservation) > BigInt(CAPS.ngrokBytes)) denyQuota();
      await tx.usage.update({ where: { id: month }, data: { ngrokRequests: { increment: 1 }, ngrokBytes: { increment: reservation } } });
    });
    const response = await fetch(new URL("/v1/extract-image", url), { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_GATEWAY_TOKEN}` }, body, signal: AbortSignal.timeout(45000) });
    if (!response.ok || !response.body) throw new Error("OCR unavailable");
    const chunks: Buffer[] = []; let received = 0;
    for await (const chunk of response.body as any) { received += chunk.byteLength; if (received > 500000) throw new Error("OCR response too large"); chunks.push(Buffer.from(chunk)); }
    const result = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (typeof result.text !== "string" || typeof result.model !== "string" || typeof result.language !== "string" || (result.truncated !== undefined && typeof result.truncated !== "boolean")) throw new Error("Invalid OCR result");
    await this.db.usage.update({ where: { id: month }, data: { ngrokBytes: { increment: Buffer.byteLength(body) + received + 4096 - reservation } } });
    return { text: result.text as string, truncated: result.truncated === true };
  }
  async remove(id: string, docId: string, i: Identity) {
    const m = await this.rooms.member(id, i.uid, undefined, true);
    const doc = await this.db.document.findFirst({
      where: { id: docId, roomId: id },
    });
    if (!doc) throw new NotFoundException("Documento no encontrado");
    if (doc.uploadedBy !== i.uid && !["host", "moderator"].includes(m.role))
      throw new ForbiddenException(
        "Solo el propietario o un moderador puede eliminarlo",
      );
    const { error } = await this.storage().remove([doc.path]);
    if (error)
      throw new ServiceUnavailableException("No se pudo eliminar el archivo");
    await this.db.document.delete({ where: { id: docId } });
    this.rooms.events.emit(id, "documents:updated", { roomId: id });
    return { ok: true };
  }
}
