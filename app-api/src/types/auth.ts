import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export type AuthenticatedRequest = Request & { user: JwtPayload };

export function assertAuthenticated(req: Request): asserts req is AuthenticatedRequest {
  if (!("user" in req) || !req.user || !(req.user as any).userId) {
    throw new Error("UNAUTHORIZED");
  }
}