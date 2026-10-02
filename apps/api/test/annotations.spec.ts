jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("livekit-server-sdk", () => ({ AccessToken: jest.fn(), RoomServiceClient: jest.fn() }));
import { randomUUID } from "node:crypto";
import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";
import { parse, RateLimiter } from "../src/core";
import { Events } from "../src/events";
import { Rooms } from "../src/rooms";
import { annotationSchema, ANNOTATION_LIMITS } from "../src/validation";

describe("Herramientas de anotación y aislamiento", () => {
  const identity = { uid: "student", email: "student@example.invalid", name: "Student" };
  const screenId = "TR_screen";
  const endpoints = [{ x: 0.1, y: 0.2 }, { x: 0.8, y: 0.7 }];
  const line = { action: "line", screenId, points: endpoints };
  const validate = (body: unknown) => parse(annotationSchema, body);
  function fixture(options: { role?: string; owner?: string; annotations?: any[] } = {}) {
    const room = { id: "room", status: "open", annotations: options.annotations ?? [] };
    const membership = { active: true, banned: false, role: options.role ?? "participant", room };
    const tx: any = {
      room: { findUniqueOrThrow: jest.fn().mockResolvedValue(room), update: jest.fn(async ({ data }: any) => Object.assign(room, data)) },
      membership: { findUnique: jest.fn(async () => membership) },
    };
    const db: any = { membership: tx.membership, serial: jest.fn(async (fn: any) => fn(tx)) };
    const events = new Events();
    jest.spyOn(events, "emit");
    const rooms = new Rooms(db, events, { check: jest.fn() } as unknown as RateLimiter);
    jest.spyOn(rooms, "mediaClient").mockReturnValue({ listParticipants: async () => [{
      identity: options.owner ?? identity.uid,
      tracks: [{ sid: screenId, source: 3, muted: false }],
    }] } as any);
    return { rooms, db, tx, room, membership, events };
  }
  test("admite figuras, texto y tamaños sin cambiar point/stroke/clear existentes", () => {
    for (const action of ["line", "arrow", "rectangle", "ellipse"])
      expect(validate({ ...line, action }).strokeWidth).toBe(3);
    expect(validate({ action: "text", screenId, x: 0, y: 1, text: "  Matriz A  " }))
      .toMatchObject({ text: "Matriz A", fontSize: 24 });
    expect(validate({ action: "stroke", screenId, points: endpoints }).strokeWidth).toBe(3);
    expect(validate({ action: "point", screenId, x: 0.5, y: 0.5 }).action).toBe("point");
    expect(validate({ action: "clear", screenId }).action).toBe("clear");
  });
  test.each([
    { ...line, points: endpoints.slice(0, 1) },
    { ...line, points: [...endpoints, endpoints[0]] },
    { ...line, points: [endpoints[0], endpoints[0]] },
    { ...line, action: "rectangle", points: [{ x: 0.1, y: 0.1 }, { x: 0.1, y: 0.8 }] },
    { ...line, action: "ellipse", points: [{ x: 0.1, y: 0.1 }, { x: 0.8, y: 0.1 }] },
    { ...line, strokeWidth: 0 },
    { ...line, strokeWidth: 25 },
    { ...line, points: [{ x: Infinity, y: 0 }, endpoints[1]] },
    { ...line, points: [{ x: -0.1, y: 0 }, endpoints[1]] },
    { ...line, color: "url(javascript:alert(1))" },
    { ...line, action: "stroke", points: Array(201).fill(endpoints[0]) },
    { action: "text", screenId, x: 0.5, y: 0.5, text: " " },
    { action: "text", screenId, x: 0.5, y: 0.5, text: "a".repeat(301) },
    { action: "text", screenId, x: 0.5, y: 0.5, text: "a\u0000b" },
    { action: "text", screenId, x: 0.5, y: 0.5, text: "Hola", fontSize: 97 },
    { action: "text", screenId, x: 0.5, y: 0.5, text: "Hola", fontSize: 7 },
    { action: "erase", screenId, targetIds: [] },
    { action: "erase", screenId, targetIds: ["foreign"] },
    { action: "erase", screenId, targetIds: Array.from({ length: 41 }, () => randomUUID()) },
    { action: "erase", screenId, targetIds: Array(2).fill("5684228d-2b56-408c-9b76-fec5c65069e1") },
    { action: "erase", screenId, targetIds: [randomUUID()], points: endpoints },
    { action: "clear", screenId, text: "unexpected" },
    { ...line, id: randomUUID(), userId: "forged" },
  ])("rechaza payload inválido %# sin ambigüedad de herramienta", (body) => {
    expect(() => validate(body)).toThrow(BadRequestException);
  });
  test("crea IDs confiables, conserva tamaños y publica después de guardar", async () => {
    const { rooms, room, events } = fixture();
    const result = await rooms.annotate("room", identity, { ...line, strokeWidth: 7 });
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.userId).toBe(identity.uid);
    expect(room.annotations).toEqual([result]);
    expect(events.emit).toHaveBeenCalledWith("room", "annotation:updated", result);
  });
  test("borrar IDs se limita a la pantalla indicada y no almacena comandos de borrado", async () => {
    const own = { id: randomUUID(), action: "rectangle", screenId };
    const foreign = { id: randomUUID(), action: "ellipse", screenId: "TR_other" };
    const untouched = { id: randomUUID(), action: "text", screenId };
    const unknown = randomUUID();
    const { rooms, room, events } = fixture({ role: "moderator", annotations: [own, foreign, untouched] });
    const result = await rooms.annotate("room", identity, {
      action: "erase", screenId, targetIds: [own.id, foreign.id, unknown],
    });
    expect(result.targetIds).toEqual([own.id]);
    expect(room.annotations).toEqual([foreign, untouched]);
    expect(events.emit).toHaveBeenCalledWith("room", "annotation:updated", expect.objectContaining({ targetIds: [own.id] }));
    const repeated = await rooms.annotate("room", identity, { action: "erase", screenId, targetIds: [own.id] });
    expect(repeated.targetIds).toEqual([]);
    expect(room.annotations).toEqual([foreign, untouched]);
  });
  test("ninguna herramienta permite a un participante modificar la pantalla ajena", async () => {
    const { rooms, db, events } = fixture({ owner: "other" });
    for (const body of [line, { action: "text", screenId, x: 0.1, y: 0.1, text: "Hola" }, { action: "erase", screenId, targetIds: [randomUUID()] }])
      await expect(rooms.annotate("room", identity, body)).rejects.toThrow(ForbiddenException);
    expect(db.serial).not.toHaveBeenCalled();
    expect(events.emit).not.toHaveBeenCalled();
  });
  test("la moderación sigue permitiendo editar la pantalla ajena", async () => {
    const { rooms } = fixture({ owner: "other", role: "moderator" });
    await expect(rooms.annotate("room", identity, line)).resolves.toMatchObject({ action: "line" });
  });
  test("revalida permisos y estado si la sala cambia durante la consulta de medios", async () => {
    for (const change of ["closed", "banned", "demoted"]) {
      const { rooms, db, room, membership, events } = fixture({ owner: "other", role: "moderator" });
      const original = db.serial.getMockImplementation();
      db.serial.mockImplementation(async (fn: any) => {
        if (change === "closed") room.status = "closed";
        if (change === "banned") membership.banned = true;
        if (change === "demoted") membership.role = "participant";
        return original(fn);
      });
      await expect(rooms.annotate("room", identity, line)).rejects.toThrow(change === "closed" ? ConflictException : ForbiddenException);
      expect(room.annotations).toEqual([]);
      expect(events.emit).not.toHaveBeenCalled();
    }
  });
  test("mantiene el límite de estado y clear no afecta otra pantalla", async () => {
    const { rooms, room } = fixture();
    for (let n = 0; n < ANNOTATION_LIMITS.stored + 1; n++)
      await rooms.annotate("room", identity, line);
    expect(room.annotations).toHaveLength(ANNOTATION_LIMITS.stored);
    const foreign = { id: randomUUID(), action: "line", screenId: "TR_other" };
    room.annotations.push(foreign);
    await rooms.annotate("room", identity, { action: "clear", screenId });
    expect(room.annotations).toEqual([foreign]);
  });
});
