jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({
  AccessToken: jest.fn(),
  RoomServiceClient: jest.fn(),
}));
import { BadRequestException, HttpException } from "@nestjs/common";
import { checkCode, hashCode, parse, RateLimiter } from "../src/core";
import {
  annotationSchema,
  roomSchema,
  profileSchema,
  quizSchema,
} from "../src/validation";
import { validateFile } from "../src/documents";
import { publicJob, utf8Chunks, validatedCitations } from "../src/ai";
describe("Seguridad y contratos", () => {
  test("los códigos privados usan salt y nunca aceptan otro código", () => {
    const one = hashCode("secreto-123");
    const two = hashCode("secreto-123");
    expect(one).not.toBe(two);
    expect(checkCode("secreto-123", one)).toBe(true);
    expect(checkCode("distinto", one)).toBe(false);
    expect(checkCode("cualquier", null)).toBe(false);
  });
  test("rechaza masificación y capacidad fuera del máximo probado", () => {
    expect(() =>
      parse(roomSchema, { title: "Sala", subject: "Mate", capacity: 100 }),
    ).toThrow(BadRequestException);
    expect(() =>
      parse(profileSchema, { displayName: "Estudiante", role: "admin" }),
    ).toThrow(BadRequestException);
  });
  test("rechaza señales fuera del contenido y payloads vacíos", () => {
    expect(() =>
      parse(annotationSchema, {
        action: "point",
        screenId: "TR_1",
        x: 1.2,
        y: 0,
      }),
    ).toThrow();
    expect(() =>
      parse(annotationSchema, {
        action: "stroke",
        screenId: "TR_1",
        points: [],
      }),
    ).toThrow();
    expect(
      parse(annotationSchema, {
        action: "point",
        screenId: "TR_1",
        x: 0.4,
        y: 0.6,
      }).x,
    ).toBe(0.4);
  });
  test("impone ventanas y permite reintentar después de vencer", () => {
    jest.useFakeTimers().setSystemTime(10000);
    const rate = new RateLimiter();
    rate.check("a", 1, 1000);
    expect(() => rate.check("a", 1, 1000)).toThrow(HttpException);
    jest.advanceTimersByTime(1001);
    expect(() => rate.check("a", 1, 1000)).not.toThrow();
    jest.useRealTimers();
  });
  test("el tipo real del archivo gana frente a un MIME falso", () => {
    const fake = {
      buffer: Buffer.from("<script>alert(1)</script>"),
      size: 25,
      mimetype: "application/pdf",
      originalname: "fake.pdf",
    } as Express.Multer.File;
    expect(() => validateFile(fake)).toThrow();
    const text = {
      ...fake,
      mimetype: "text/plain",
      originalname: "../../nota.txt",
    };
    expect(validateFile(text).name).toBe(".._.._nota.txt");
  });
  test("UTF8 se fragmenta sin romper emoji, caracteres ni exceder la memoria", () => {
    const input = "á🙂漢字 ".repeat(500);
    const chunks = utf8Chunks(input, 511);
    expect(chunks.join("")).toBe(input);
    expect(chunks.every((x) => Buffer.byteLength(x) <= 511)).toBe(true);
  });
  test("el modelo no puede publicar identificadores de citas inventados", () => {
    const valid = "mensaje:c9a88be4-92b1-4957-b7a3-022ee0588877";
    const invented = "mensaje:c9a88be4-92b1-4957-b7a3-072ee0588877";
    expect(validatedCitations(`Hay seis. [${valid}] [${invented}] [documento:ajeno]`, [valid]))
      .toBe(`Hay seis. [${valid}]`);
    expect(validatedCitations("Sin contexto [mensaje:inventado]", []))
      .toBe("Sin contexto");
  });
  test("los resultados públicos no revelan prompts, secretos ni soluciones del quiz", () => {
    const pub = publicJob({
      id: "j",
      payload: { context: "privado" },
      idempotencyKey: "secreto",
      leaseOwner: "worker",
      kind: "quiz",
      result: {
        questions: [
          {
            question: "Q",
            options: ["A", "B", "C", "D"],
            correctIndex: 2,
            explanation: "Solución",
          },
        ],
      },
    } as any);
    expect(pub).not.toHaveProperty("payload");
    expect(pub).not.toHaveProperty("leaseOwner");
    expect((pub.result as any).questions[0]).not.toHaveProperty("correctIndex");
    expect((pub.result as any).questions[0]).not.toHaveProperty("explanation");
  });
  test("un quiz malformado o sin respuesta válida nunca se publica", () => {
    expect(() =>
      parse(quizSchema, {
        questions: [
          {
            question: "¿Qué?",
            options: ["A", "B"],
            correctIndex: 8,
            explanation: "x",
          },
        ],
      }),
    ).toThrow();
  });
});
