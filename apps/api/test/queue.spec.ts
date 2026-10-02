jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({
  AccessToken: jest.fn(),
  RoomServiceClient: jest.fn(),
}));
import { Ai, publicJob } from "../src/ai";
import { Rooms } from "../src/rooms";
import { Db, RateLimiter } from "../src/core";
import { Events } from "../src/events";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
describe("Cola durable y límites", () => {
  beforeEach(() => {
    process.env.AI_GATEWAY_URL = "http://127.0.0.1:8787";
    process.env.AI_GATEWAY_TOKEN = "test-only-token";
  });
  afterEach(() => {
    delete process.env.AI_GATEWAY_URL;
    delete process.env.AI_GATEWAY_TOKEN;
    delete process.env.LIVEKIT_URL;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  function fixture() {
    const job: any = {
      id: "job1",
      userId: "u1",
      roomId: "r1",
      kind: "answer",
      status: "running",
      attempts: 1,
      priority: 0,
      shared: false,
      payload: { question: "¿Qué es x?", context: "" },
    };
    const tx: any = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([{ locked: 1 }])
        .mockResolvedValueOnce([job]),
    };
    const db: any = {
      $transaction: jest.fn(async (fn: any) => fn(tx)),
      aiJob: {
        findUnique: jest.fn().mockResolvedValue(job),
        update: jest.fn(async ({ data }: any) => ({ ...job, ...data })),
        updateMany: jest.fn(),
      },
    };
    const events = new Events();
    const rooms = new Rooms(db, events, new RateLimiter());
    const ai = new Ai(db, rooms, new RateLimiter());
    return { job, db, tx, rooms, ai };
  }
  test("una caída del PC vuelve a encolar con demora y conserva el trabajo", async () => {
    const { ai, db, tx } = fixture();
    jest.spyOn(ai, "run").mockRejectedValue(new Error("fetch failed"));
    await ai.tick();
    expect(tx.$queryRaw).toHaveBeenCalledTimes(2);
    const args = db.aiJob.update.mock.calls[0][0];
    expect(args.data.status).toBe("queued");
    expect(args.data.availableAt.getTime()).toBeGreaterThan(Date.now());
    expect(args.data.leaseOwner).toBeNull();
    expect(args.data.error).toContain("Reintentaremos");
  });
  test("agotados los intentos muestra error sin resultado inventado", async () => {
    const { ai, db, job } = fixture();
    job.attempts = 5;
    jest.spyOn(ai, "run").mockRejectedValue(new Error("AI_UNAVAILABLE_429"));
    await ai.tick();
    expect(db.aiJob.update.mock.calls[0][0].data.status).toBe("failed");
    expect(db.aiJob.update.mock.calls[0][0].data).not.toHaveProperty("result");
  });
  test("un secreto inválido no produce bucle de solicitudes", async () => {
    const { ai, db } = fixture();
    jest.spyOn(ai, "run").mockRejectedValue(new Error("AI_UNAUTHORIZED"));
    await ai.tick();
    expect(db.aiJob.update.mock.calls[0][0].data.status).toBe("failed");
  });
  test("un límite de alcance termina una vez y preserva la explicación", async () => {
    const { ai, db } = fixture();
    jest.spyOn(ai, "run").mockRejectedValue(new BadRequestException("Acota la pregunta; el reporte permanece íntegro."));
    await ai.tick();
    expect(db.aiJob.update.mock.calls[0][0].data.status).toBe("failed");
    expect(db.aiJob.update.mock.calls[0][0].data.error).toBe("Acota la pregunta; el reporte permanece íntegro.");
  });
  test("un usuario no puede leer una generación privada ajena", async () => {
    const { ai, job } = fixture();
    await expect(ai.authorize(job, "u2")).rejects.toThrow(ForbiddenException);
  });
  test("expone la pregunta para reintentar sin revelar contexto ni dueño", () => {
    const { job } = fixture();
    job.payload.context = "Contexto de sala que no forma parte del contrato público";
    const result = publicJob(job);
    expect(result.question).toBe("¿Qué es x?");
    expect(result).not.toHaveProperty("payload");
    expect(result).not.toHaveProperty("userId");
    job.kind = "summary";
    expect(publicJob(job)).not.toHaveProperty("question");
  });
  test("cancelar aborta el trabajo de su dueño y libera la reserva", async () => {
    const { ai, db } = fixture();
    const value = await ai.cancel("job1", { uid: "u1", email: "x", name: "x" });
    expect(value.status).toBe("cancelled");
    expect(db.aiJob.update.mock.calls[0][0].data.leaseOwner).toBeNull();
  });
  test("un cierre ordenado libera solo los trabajos del propio consumidor", async () => {
    const { ai, db } = fixture();
    db.aiJob.updateMany.mockResolvedValue({ count: 1 });
    await ai.onModuleDestroy();
    await ai.beforeApplicationShutdown();
    expect(db.aiJob.updateMany).toHaveBeenCalledWith({
      where: { leaseOwner: expect.any(String), status: "running" },
      data: {
        status: "queued",
        availableAt: expect.any(Date),
        leaseOwner: null,
        leaseUntil: null,
      },
    });
  });
  test("rechaza escritura al alcanzar margen gratuito de PostgreSQL", async () => {
    const db = new Db();
    jest.spyOn(db, "$queryRaw").mockResolvedValue([{ bytes: 450000001n }]);
    await expect(db.ensureWriteSpace()).rejects.toMatchObject({ status: 429 });
    await db.$disconnect();
  });
  test("termina conexiones cuya duración reservada expiró", async () => {
    process.env.LIVEKIT_URL = "ws://localhost:7880";
    const remove = jest.fn().mockResolvedValue(undefined);
    const db: any = {
      mediaGrant: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "g",
            roomId: "r",
            userId: "u",
            expiresAt: new Date(Date.now() - 120000),
          },
        ]),
        deleteMany: jest.fn(),
      },
      membership: {
        findUnique: jest.fn().mockResolvedValue({
          active: true,
          banned: false,
          room: { status: "open" },
        }),
      },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    jest
      .spyOn(rooms, "mediaClient")
      .mockReturnValue({ removeParticipant: remove } as any);
    await rooms.expireMedia();
    expect(remove).toHaveBeenCalledWith("r", "u");
    expect(db.mediaGrant.deleteMany).toHaveBeenCalled();
    delete process.env.LIVEKIT_URL;
  });
  test("limpia concesión revocada incluso si LiveKit ya borró la sala", async () => {
    jest.useFakeTimers();
    process.env.LIVEKIT_URL = "ws://localhost:7880";
    const grant = {
      id: "g", roomId: "r", userId: "u",
      expiresAt: new Date(Date.now() + 3600000),
    };
    const db: any = {
      mediaGrant: {
        findMany: jest.fn().mockResolvedValue([grant]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      membership: { findUnique: jest.fn().mockResolvedValue({
        active: false, banned: false, room: { status: "closed" },
      }) },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    const remove = jest.fn().mockRejectedValue({ status: 404, code: "not_found" });
    jest.spyOn(rooms, "mediaClient").mockReturnValue({ removeParticipant: remove } as any);
    await rooms.expireMedia();
    expect(db.mediaGrant.updateMany).toHaveBeenCalledTimes(1);
    expect(grant.expiresAt.getTime()).toBe(Date.now());
    expect(db.mediaGrant.deleteMany).not.toHaveBeenCalled();
    jest.advanceTimersByTime(61000);
    await rooms.expireMedia();
    expect(db.mediaGrant.deleteMany).toHaveBeenCalledTimes(1);
  });
  test("un proveedor lento no solapa barridos de expulsión", async () => {
    process.env.LIVEKIT_URL = "ws://localhost:7880";
    let resolve!: (value: never[]) => void;
    const db: any = { mediaGrant: { findMany: jest.fn().mockReturnValue(
      new Promise<never[]>((done) => { resolve = done; }),
    ) } };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    const first = rooms.expireMedia();
    await rooms.expireMedia();
    expect(db.mediaGrant.findMany).toHaveBeenCalledTimes(1);
    resolve([]);
    await first;
    await rooms.expireMedia();
    expect(db.mediaGrant.findMany).toHaveBeenCalledTimes(2);
  });
});
