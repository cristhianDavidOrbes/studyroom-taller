import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  BadRequestException,
} from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { z } from "zod";

@Injectable()
export class Db extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  private sizeCheckAt = 0;
  private sizeBytes = 0;
  async onModuleInit() {
    await this.$connect();
  }
  async onApplicationShutdown() {
    await this.$disconnect();
  }
  async ensureWriteSpace() {
    if (Date.now() - this.sizeCheckAt > 15000) {
      const rows = await this.$queryRaw<
        { bytes: bigint }[]
      >`SELECT pg_database_size(current_database())::bigint AS bytes`;
      this.sizeBytes = Number(rows[0]?.bytes ?? 0);
      this.sizeCheckAt = Date.now();
    }
    if (this.sizeBytes >= 450_000_000)
      denyQuota(
        "La base de datos alcanzó el margen del plan gratuito. Libera archivos o exporta y archiva sesiones antes de continuar.",
      );
  }
  async serial<T>(
    action: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.$transaction(action, {
          isolationLevel: "Serializable",
          timeout: 15000,
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2034" &&
          attempt < 3
        )
          continue;
        throw e;
      }
    }
  }
}
export type Identity = {
  uid: string;
  email: string;
  name: string;
  token?: string;
};
@Injectable()
export class IdentityService {
  private verified = new Map<string, { identity: Identity; until: number }>();
  constructor(private db: Db) {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.FIREBASE_AUTH_EMULATOR_HOST
    )
      throw new Error("El emulador Firebase está prohibido en producción");
    if (!process.env.FIREBASE_PROJECT_ID)
      throw new Error("Falta FIREBASE_PROJECT_ID");
    if (!getApps().length)
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        ...(process.env.FIREBASE_AUTH_EMULATOR_HOST
          ? {}
          : {
              credential: process.env.FIREBASE_SERVICE_ACCOUNT_JSON
                ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
                : applicationDefault(),
            }),
      });
  }
  async verify(token: string | undefined): Promise<Identity> {
    if (!token || token.length > 16384)
      throw new UnauthorizedException("Inicia sesión para continuar");
    const tokenKey = sha(token);
    const cached = this.verified.get(tokenKey);
    if (cached && cached.until > Date.now()) return cached.identity;
    let decoded: DecodedIdToken;
    try {
      decoded = await getAuth().verifyIdToken(token, true);
    } catch {
      throw new UnauthorizedException("Tu sesión venció o fue revocada");
    }
    const uid = decoded.uid;
    const email = decoded.email ?? "";
    const name = decoded.name || email.split("@")[0] || "Estudiante";
    const existing = await this.db.user.findUnique({ where: { id: uid } });
    if (!existing) {
      await this.db.ensureWriteSpace();
      await this.db.user.upsert({
        where: { id: uid },
        create: { id: uid, email, displayName: name.slice(0, 80) },
        update: {},
      });
    } else if (existing.email !== email) {
      await this.db.user.update({ where: { id: uid }, data: { email } });
    }
    const identity = { uid, email, name, token };
    if (this.verified.size >= 1000) {
      for (const [key, value] of this.verified)
        if (value.until <= Date.now()) this.verified.delete(key);
      if (this.verified.size >= 1000)
        this.verified.delete(this.verified.keys().next().value!);
    }
    // Bound provider reads during pointer streams; expiration is never extended.
    this.verified.set(tokenKey, {
      identity,
      until: Math.min(Date.now() + 15000, decoded.exp * 1000),
    });
    return identity;
  }
  async logout(uid: string) {
    await getAuth().revokeRefreshTokens(uid);
    for (const [key, value] of this.verified)
      if (value.identity.uid === uid) this.verified.delete(key);
    return { ok: true };
  }
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private identities: IdentityService) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    req.identity = await this.identities.verify(
      req.headers.authorization?.match(/^Bearer (.+)$/)?.[1],
    );
    return true;
  }
}
export function parse<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
): z.infer<T> {
  const r = schema.safeParse(value);
  if (!r.success)
    throw new BadRequestException(
      r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
  return r.data;
}
export function hashCode(code: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(code, salt, 32).toString("hex")}`;
}
export function checkCode(code: string, stored: string | null) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!hash || hash.length !== 64) return false;
  return timingSafeEqual(scryptSync(code, salt, 32), Buffer.from(hash, "hex"));
}
export function sha(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export function monthKey() {
  return new Date().toISOString().slice(0, 7);
}
export const CAPS = {
  ngrokRequests: 19000,
  ngrokBytes: 900_000_000,
  participantMinutes: 4500,
  mediaBytes: 45_000_000_000,
  storage: 900_000_000,
  storageEgress: 4_500_000_000,
  database: 450_000_000,
};
export function denyQuota(
  message = "Se alcanzó el límite gratuito. Intenta cuando se renueve la cuota.",
): never {
  throw new HttpException({ message, code: "QUOTA_EXCEEDED" }, 429);
}
@Injectable()
export class RateLimiter {
  private buckets = new Map<string, { at: number; count: number }>();
  check(key: string, limit = 60, windowMs = 60000) {
    const now = Date.now();
    if (this.buckets.size > 10000)
      for (const [k, v] of this.buckets)
        if (v.at < now - 60000) this.buckets.delete(k);
    let b = this.buckets.get(key);
    if (!b || b.at + windowMs <= now) {
      b = { at: now, count: 0 };
      this.buckets.set(key, b);
    }
    if (++b.count > limit)
      throw new HttpException(
        {
          message: "Demasiadas solicitudes. Espera un momento.",
          code: "RATE_LIMIT",
        },
        429,
      );
  }
}
@Catch()
export class SafeErrors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const status = error instanceof HttpException ? error.getStatus() : 500;
    const requestId = host.switchToHttp().getRequest().requestId;
    if (status >= 500)
      process.stderr.write(
        JSON.stringify({
          event: "request_error",
          requestId,
          status,
          type: error instanceof Error ? error.constructor.name : "Unknown",
          at: new Date().toISOString(),
        }) + "\n",
      );
    const body =
      error instanceof HttpException
        ? error.getResponse()
        : {
            message:
              "No fue posible completar la operación. Inténtalo de nuevo.",
            code: "INTERNAL_ERROR",
          };
    res
      .status(status)
      .json(
        typeof body === "string"
          ? { message: body, requestId }
          : { ...(body as object), requestId },
      );
  }
}
