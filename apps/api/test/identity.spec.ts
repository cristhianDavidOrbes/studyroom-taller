jest.mock("firebase-admin/app", () => ({
  getApps: () => [{}],
  initializeApp: jest.fn(),
  applicationDefault: jest.fn(),
  cert: jest.fn(),
}));
jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
import { getAuth } from "firebase-admin/auth";
import { IdentityService } from "../src/core";
describe("Identidad y revocación", () => {
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST,
  };
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.FIREBASE_PROJECT_ID = "demo-studyroom";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  });
  afterEach(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    jest.useRealTimers();
    jest.clearAllMocks();
  });
  test("nunca admite identidad de emulador en producción", () => {
    process.env.NODE_ENV = "production";
    expect(() => new IdentityService({} as any)).toThrow("emulador");
  });
  test("expira la caché de verificación a los 15 segundos", async () => {
    jest.useFakeTimers().setSystemTime(100000);
    const verifyIdToken = jest
      .fn()
      .mockResolvedValue({ uid: "u", email: "u@example.test", exp: 1000 });
    (getAuth as jest.Mock).mockReturnValue({ verifyIdToken });
    const service = new IdentityService({
      user: { findUnique: async () => ({ email: "u@example.test" }) },
    } as any);
    await service.verify("valid");
    await service.verify("valid");
    expect(verifyIdToken).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(15001);
    await service.verify("valid");
    expect(verifyIdToken).toHaveBeenCalledTimes(2);
    expect(verifyIdToken).toHaveBeenLastCalledWith("valid", true);
  });
  test("logout elimina inmediatamente la verificación y rechaza token revocado", async () => {
    const verifyIdToken = jest
      .fn()
      .mockResolvedValueOnce({
        uid: "u",
        email: "u@example.test",
        exp: Date.now() / 1000 + 300,
      })
      .mockRejectedValue(new Error("revoked"));
    const revokeRefreshTokens = jest.fn().mockResolvedValue(undefined);
    (getAuth as jest.Mock).mockReturnValue({
      verifyIdToken,
      revokeRefreshTokens,
    });
    const service = new IdentityService({
      user: { findUnique: async () => ({ email: "u@example.test" }) },
    } as any);
    await service.verify("valid");
    await service.logout("u");
    await expect(service.verify("valid")).rejects.toMatchObject({
      status: 401,
    });
    expect(revokeRefreshTokens).toHaveBeenCalledWith("u");
  });
});
