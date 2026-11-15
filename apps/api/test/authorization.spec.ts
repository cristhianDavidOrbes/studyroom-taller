jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({
  AccessToken: jest.fn(),
  RoomServiceClient: jest.fn(),
}));
import { ForbiddenException, ConflictException } from "@nestjs/common";
import { Rooms } from "../src/rooms";
import { RateLimiter } from "../src/core";
import { Events } from "../src/events";
describe("Autorización de salas", () => {
  const identity = {
    uid: "student",
    email: "student@example.invalid",
    name: "Student",
  };
  test("el anfitrión puede abrir una sala programada al llegar su fecha", async () => {
    const scheduled = {
      id: "r",
      status: "scheduled",
      scheduledAt: new Date(Date.now() - 1000),
    };
    const db: any = {
      membership: {
        findUnique: jest
          .fn()
          .mockResolvedValue({
            active: true,
            banned: false,
            role: "host",
            room: scheduled,
            user: { birthDate: new Date("2000-01-01") },
          }),
      },
      room: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue({ ...scheduled, status: "open" }),
      },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    expect((await rooms.member("r", identity.uid)).room.status).toBe("open");
    expect(db.room.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "scheduled" }),
      }),
    );
  });
  test("rechaza otra sala, retirada o expulsión aunque uid sea válido", async () => {
    for (const member of [
      null,
      { active: false, banned: false },
      { active: true, banned: true },
    ]) {
      const db: any = {
        membership: { findUnique: jest.fn().mockResolvedValue(member) },
      };
      const rooms = new Rooms(db, new Events(), new RateLimiter());
      await expect(rooms.member("room", identity.uid)).rejects.toThrow(
        ForbiddenException,
      );
    }
  });
  test("el participante no puede administrar el temporizador", async () => {
    const db: any = {
      membership: {
        findUnique: jest.fn().mockResolvedValue({
          role: "participant",
          active: true,
          banned: false,
          room: {},
          user: { birthDate: new Date("2000-01-01") },
        }),
      },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    await expect(
      rooms.timer("r", identity, { action: "start" }),
    ).rejects.toThrow(ForbiddenException);
  });
  test("rechaza una señal sobre una pantalla inexistente antes de mutar", async () => {
    const db: any = {
      membership: {
        findUnique: jest.fn().mockResolvedValue({
          role: "host",
          active: true,
          banned: false,
          room: { status: "open" },
          user: { birthDate: new Date("2000-01-01") },
        }),
      },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    jest
      .spyOn(rooms, "mediaClient")
      .mockReturnValue({ listParticipants: async () => [] } as any);
    await expect(
      rooms.annotate("r", identity, {
        action: "point",
        screenId: "TR_other",
        x: 0.5,
        y: 0.5,
      }),
    ).rejects.toThrow(ConflictException);
  });
  test("rechaza señal ajena aun compartiendo sala", async () => {
    const db: any = {
      membership: {
        findUnique: jest.fn().mockResolvedValue({
          role: "participant",
          active: true,
          banned: false,
          room: { status: "open" },
          user: { birthDate: new Date("2000-01-01") },
        }),
      },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    jest.spyOn(rooms, "mediaClient").mockReturnValue({
      listParticipants: async () => [
        {
          identity: "other",
          tracks: [{ sid: "TR_other", source: 3, muted: false }],
        },
      ],
    } as any);
    await expect(
      rooms.annotate("r", identity, {
        action: "point",
        screenId: "TR_other",
        x: 0.5,
        y: 0.5,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});

describe("Descubrimiento de salas", () => {
  const identity = { uid: "student", email: "student@example.invalid", name: "Student" };
  const room = (id: string, subject: string, members = 1) => ({
    id, subject, title: `${subject} en grupo`, _count: { memberships: members },
  });
  test("combina búsqueda y visibilidad: no expone salas privadas ajenas", async () => {
    const db: any = {
      room: { updateMany: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue({ interests: [], birthDate: new Date("2000-01-01") }) },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    await rooms.list(identity, { q: "álgebra" });
    const where = db.room.findMany.mock.calls[0][0].where;
    expect(where.AND).toEqual([
      { OR: [
        { privacy: "public" },
        { memberships: { some: { userId: identity.uid, active: true, banned: false } } },
      ] },
      { OR: [
        { title: { contains: "álgebra", mode: "insensitive" } },
        { subject: { contains: "álgebra", mode: "insensitive" } },
      ] },
    ]);
  });
  test("recomienda únicamente materias afines y no inventa sugerencias sin intereses", async () => {
    const db: any = {
      room: { updateMany: jest.fn(), findMany: jest.fn().mockResolvedValue([
        room("math", "Matemáticas"), room("history", "Historia"),
      ]) },
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue({ interests: ["matemáticas"], birthDate: new Date("2000-01-01") }) },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    jest.spyOn(rooms, "format").mockImplementation(async (value: any) => value);
    expect((await rooms.list(identity, { recommended: "true" })).map((r: any) => r.id)).toEqual(["math"]);
    expect(db.room.findMany.mock.calls[0][0].where.AND).toContainEqual({
      OR: [{ subject: { contains: "matemáticas", mode: "insensitive" } }],
    });
    db.user.findUniqueOrThrow.mockResolvedValue({ interests: [], birthDate: new Date("2000-01-01") });
    expect(await rooms.list(identity, { recommended: "true" })).toEqual([]);
  });
  test("ordena por participantes activos", async () => {
    const db: any = {
      room: { updateMany: jest.fn(), findMany: jest.fn().mockResolvedValue([
        room("small", "Física", 1), room("large", "Física", 4),
      ]) },
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue({ interests: [], birthDate: new Date("2000-01-01") }) },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    jest.spyOn(rooms, "format").mockImplementation(async (value: any) => value);
    expect((await rooms.list(identity, { sort: "activity" })).map((r: any) => r.id)).toEqual(["large", "small"]);
  });
  test("la búsqueda por relevancia antepone coincidencias del título", async () => {
    const db: any = {
      room: { updateMany: jest.fn(), findMany: jest.fn().mockResolvedValue([
        { ...room("subject", "Álgebra", 4), title: "Repaso general" },
        { ...room("title", "Matemáticas", 1), title: "Álgebra en grupo" },
      ]) },
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue({ interests: [], birthDate: new Date("2000-01-01") }) },
    };
    const rooms = new Rooms(db, new Events(), new RateLimiter());
    jest.spyOn(rooms, "format").mockImplementation(async (value: any) => value);
    expect((await rooms.list(identity, { q: "álgebra", sort: "relevance" })).map((r: any) => r.id)).toEqual(["title", "subject"]);
  });
});
