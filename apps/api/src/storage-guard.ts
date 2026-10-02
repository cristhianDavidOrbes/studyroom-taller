import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Db } from "./core";
@Injectable()
export class StorageGuard implements CanActivate {
  constructor(private db: Db) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const path = req.path as string;
    if (
      ["POST", "PUT", "PATCH"].includes(req.method) &&
      !["/leave", "/close", "/cancel", "/auth/logout"].some((s) =>
        path.endsWith(s),
      )
    )
      await this.db.ensureWriteSpace();
    return true;
  }
}
