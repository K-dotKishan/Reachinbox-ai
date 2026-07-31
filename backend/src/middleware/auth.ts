import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { verifyToken } from "../utils/jwt";
import { SessionUser } from "../types";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Check session cookie (local dev)
  if (req.session?.user) {
    return next();
  }

  // 2. Check JWT Bearer token (production cross-domain)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const user = verifyToken(token);
    if (user) {
      // Attach user to session-like object so controllers can access it
      req.session.user = user as SessionUser;
      return next();
    }
  }

  sendError(res, "Unauthorized — please log in", 401);
}
