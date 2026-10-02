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
  else if (
    ["text/plain", "text/markdown"].includes(file.mimetype) &&
    !bytes.includes(0) &&
    Buffer.from(bytes.toString("utf8")).equals(bytes)
  )
    mime = "text/plain";
  if (!mime)
    throw new BadRequestException(
      "Se permiten PDF, texto UTF-8, PNG, JPEG y WebP",
    );
  const name =
    file.originalname.replace(/[\x00-\x1f<>:"/\\|?*]/g, "_").slice(0, 180) ||
    "documento";
  return { mime, name };
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
    if (mime === "text/plain")
      text = f.buffer.toString("utf8").slice(0, 100000);
    if (mime === "application/pdf") {
      try {
        const parsed = await pdfParse(f.buffer, { max: 100 });
        text = parsed.text.slice(0, 100000);
      } catch {
        throw new BadRequestException(
          "No se pudo leer este PDF. Prueba un documento sin contraseña.",
        );
      }
    }
    const docId = randomUUID();
    const path = `${id}/${docId}`;
    // Reserve bytes in PostgreSQL before upload; serializable isolation prevents concurrent quota overrun.
    const doc = await this.db.serial(async (tx) => {
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
