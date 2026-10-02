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
  test('el anfitrión puede abrir una sala programada al llegar su fecha',async()=>{
    const scheduled={id:'r',status:'scheduled',scheduledAt:new Date(Date.now()-1000)};
    const db:any={membership:{findUnique:jest.fn().mockResolvedValue({active:true,banned:false,role:'host',room:scheduled})},room:{updateMany:jest.fn().mockResolvedValue({count:1}),findUniqueOrThrow:jest.fn().mockResolvedValue({...scheduled,status:'open'})}};
    const rooms=new Rooms(db,new Events(),new RateLimiter());
    expect((await rooms.member('r',identity.uid)).room.status).toBe('open');
    expect(db.room.updateMany).toHaveBeenCalledWith(expect.objectContaining({where:expect.objectContaining({status:'scheduled'})}));
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
