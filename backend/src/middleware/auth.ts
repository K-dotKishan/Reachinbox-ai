import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session?.user) {
    return next();
  }
  sendError(res, "Unauthorized — please log in", 401);
}
