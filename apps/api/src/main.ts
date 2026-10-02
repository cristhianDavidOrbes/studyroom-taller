import "reflect-metadata";
import "dotenv/config";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import {
  Db,
  IdentityService,
  AuthGuard,
  RateLimiter,
  SafeErrors,
} from "./core";
import { Events } from "./events";
import { Rooms } from "./rooms";
import { Documents } from "./documents";
import { Ai } from "./ai";
import { Realtime } from "./realtime";
import { StorageGuard } from "./storage-guard";
import { HealthController, AppController } from "./controller";
import { documentContracts } from './openapi';
@Module({
  controllers: [HealthController, AppController],
  providers: [
    Db,
    IdentityService,
    AuthGuard,
    StorageGuard,
    RateLimiter,
    Events,
    Rooms,
    Documents,
    Ai,
    Realtime,
  ],
})
export class AppModule {}
export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });
  app.setGlobalPrefix("api");
  app.use(helmet());
  app.enableCors({
    origin: (process.env.WEB_ORIGIN ?? "http://localhost:5173").split(","),
    credentials: false,
  });
  const limiter = app.get(RateLimiter);
  app.use((req: any, res: any, next: any) => {
    req.requestId = randomUUID();
    res.setHeader("X-Request-ID", req.requestId);
    try {
      limiter.check(`http:${req.ip}`, 6000);
      next();
    } catch {
      res.status(429).json({
        message: "Demasiadas solicitudes. Espera un momento.",
        code: "RATE_LIMIT",
      });
    }
  });
  app.useGlobalFilters(new SafeErrors());
  app.enableShutdownHooks();
  const spec = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("StudyRoom API")
      .setDescription(
        "API de estudio con Firebase Auth, PostgreSQL, LiveKit y Ollama local. Todas las operaciones requieren permisos de sala salvo /health.",
      )
      .setVersion("1.0.0")
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup("api/docs", app, documentContracts(spec));
  await app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
  return app;
}
if (require.main === module)
  void bootstrap().catch(() => {
    process.stderr.write(
      "No se pudo iniciar StudyRoom. Revisa configuración y conexión a PostgreSQL.\n",
    );
    process.exitCode = 1;
  });
