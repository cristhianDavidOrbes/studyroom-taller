import JSZip from "jszip";
import sharp from "sharp";
import { createReportArchive, type ArchiveReport } from "./report-archive";

const report: ArchiveReport = {
  id: "session-1", title: "Reunión de prueba", startedAt: "2026-10-02T12:00:00Z", endedAt: "2026-10-02T12:01:00Z", jobs: [],
  messages: [{ id: "chat", displayName: "Ana", text: "CHAT_10 https://ejemplo.com/uno y www.ejemplo.com/dos.", createdAt: "2026-10-02T12:00:10Z" }],
  documents: [
    { id: "image", name: "IMAGEN_30.png", mimeType: "image/png", size: 1, available: true, createdAt: "2026-10-02T12:00:30Z", uploadedBy: "ana" },
    { id: "file", name: "ARCHIVO_40.txt", mimeType: "text/plain", size: 7, available: true, createdAt: "2026-10-02T12:00:40Z", uploadedBy: "ana" },
  ],
  transcription: { segments: [{ id: "voice", speakerId: "ana", speakerName: "Ana", text: "VOZ_20", startMs: 20000, endMs: 25000 }], participants: [{ userId: "ana", displayName: "Ana" }], coverage: { status: "available" } },
};

it("incluye Word y originales en el ZIP con la conversación en orden", async () => {
  const image = await sharp({ create: { width: 2, height: 2, channels: 4, background: "#ff0000" } }).png().toBuffer();
  report.documents[0].size = image.length;
  const archive = await createReportArchive(report, async (id) => id === "image" ? image : Buffer.from("archivo"));
  const bytes = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    archive.stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    archive.stream.on("end", () => resolve(Buffer.concat(chunks)));
    archive.stream.on("error", reject);
  });
  const zip = await JSZip.loadAsync(bytes);
  expect(Object.keys(zip.files).some((name) => name.endsWith("IMAGEN_30.png"))).toBe(true);
  expect(Object.keys(zip.files).some((name) => name.endsWith("ARCHIVO_40.txt"))).toBe(true);
  expect(Object.keys(zip.files).filter((name) => !zip.files[name].dir).sort()).toEqual([archive.wordName, ...archive.resources.map((resource) => resource.archivePath).filter((path): path is string => !!path)].sort());
  const word = await JSZip.loadAsync(await zip.file(archive.wordName)!.async("nodebuffer"));
  const content = await word.file("word/document.xml")!.async("string");
  const markers = ["CHAT_10", "https://ejemplo.com/uno", "www.ejemplo.com/dos", "VOZ_20", "IMAGEN_30.png", "ARCHIVO_40.txt"].map((marker) => content.indexOf(marker));
  expect(markers.every((position) => position >= 0)).toBe(true);
  expect(markers).toEqual([...markers].sort((a, b) => a - b));
  expect(Object.keys(word.files).some((name) => name.startsWith("word/media/"))).toBe(true);
  const relations = await word.file("word/_rels/document.xml.rels")!.async("string");
  expect(relations).toContain("adjuntos/001-IMAGEN_30.png");
  expect(relations).toContain("adjuntos/002-ARCHIVO_40.txt");
  expect(relations).toContain('Target="https://ejemplo.com/uno"');
  expect(relations).toContain('Target="https://www.ejemplo.com/dos"');
});
