jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({ AccessToken: jest.fn(), RoomServiceClient: jest.fn() }));
import { deflateRawSync } from "node:zlib";
import mammoth from "mammoth";
import { Documents, validateDocx } from "../src/documents";
function zip(items: { name: string; text: string; declaredSize?: number; flags?: number }[]) {
  const locals: Buffer[] = [], central: Buffer[] = []; let offset = 0;
  for (const item of items) {
    const raw = Buffer.from(item.text), compressed = deflateRawSync(raw), name = Buffer.from(item.name);
    let crc = 0xffffffff;
    for (const byte of raw) { crc ^= byte; for (let b = 0; b < 8; b++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(item.flags ?? 0, 6); local.writeUInt16LE(8, 8); local.writeUInt32LE(crc, 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(item.declaredSize ?? raw.length, 22); local.writeUInt16LE(name.length, 26);
    locals.push(local, name, compressed);
    const entry = Buffer.alloc(46); entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(item.flags ?? 0, 8); entry.writeUInt16LE(8, 10); entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(compressed.length, 20); entry.writeUInt32LE(item.declaredSize ?? raw.length, 24); entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42); central.push(entry, name); offset += local.length + name.length + compressed.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(items.length, 8); end.writeUInt16LE(items.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16); return Buffer.concat([...locals, directory, end]);
}
const types = { name: "[Content_Types].xml", text: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' };
const word = { name: "word/document.xml", text: '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Álgebra y apuntes compartidos.</w:t></w:r></w:p></w:body></w:document>' };
describe("Extracción segura de documentos de reporte", () => {
  test("DOCX real produce solo texto, sin HTML", async () => {
    const file = zip([types, word]); await validateDocx(file);
    expect((await mammoth.extractRawText({ buffer: file })).value).toContain("Álgebra y apuntes compartidos.");
  });
  test("rechaza ZIP ajeno, cifrado, rutas peligrosas, bomb y demasiadas entradas", async () => {
    for (const file of [zip([types]), zip([types, { ...word, flags: 1 }]), zip([types, word, { name: "../outside.txt", text: "outside" }]), zip([types, { ...word, declaredSize: 30000000 }]), zip([types, word, ...Array.from({ length: 200 }, (_, n) => ({ name: `extra${n}.txt`, text: "x" }))])]) await expect(validateDocx(file)).rejects.toThrow();
  });
  function uploadFixture() {
    const storage = { upload: jest.fn(async () => ({ error: null })) };
    const tx: any = { membership: { findUnique: jest.fn(async () => ({ active: true, banned: false, room: { status: "open" } })) }, document: { aggregate: jest.fn(async () => ({ _sum: { size: 0 } })), create: jest.fn(async ({ data }) => ({ ...data, createdAt: new Date() })) }, session: { findFirst: jest.fn(async () => ({ id: "s", startedAt: new Date(Date.now() - 1000), endedAt: null })) }, sessionDocument: { upsert: jest.fn() } };
    const db: any = { serial: jest.fn(async f => f(tx)) };
    const rooms: any = { member: jest.fn(async () => ({ room: { status: "open" } })), events: { emit: jest.fn() } };
    const service = new Documents(db, rooms);
    jest.spyOn(service as any, "storage").mockReturnValue(storage);
    const file = { buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), size: 8, mimetype: "image/png", originalname: "imagen.png" } as Express.Multer.File;
    return { service, file, tx, storage };
  }
  test("OCR truncado queda partial en archivo y proveniencia", async () => {
    const f = uploadFixture(); jest.spyOn(f.service as any, "extractImage").mockResolvedValue({ text: "Texto reconocido parcial", truncated: true });
    const result = await f.service.upload("r", { uid: "u", name: "U", email: "local@example.invalid" }, f.file);
    expect(result.extractionStatus).toBe("partial"); expect(result.extractionError).toContain("incompleta");
    expect(f.tx.sessionDocument.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ extractionStatus: "partial", extractedText: "Texto reconocido parcial" }) }));
  });
  test("fallo OCR conserva el adjunto y declara unavailable", async () => {
    const f = uploadFixture(); jest.spyOn(f.service as any, "extractImage").mockRejectedValue(new Error("private token issue"));
    const result = await f.service.upload("r", { uid: "u", name: "U", email: "local@example.invalid" }, f.file);
    expect(result.extractionStatus).toBe("unavailable"); expect(result.extractionError).not.toContain("private token"); expect(f.storage.upload).toHaveBeenCalledTimes(1);
  });
});
