import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    sendError(res, "Validation error", 422, err.flatten().fieldErrors);
    return;
  }

  if (err instanceof Error) {
    console.error("❌  Unhandled error:", err.message);
    sendError(res, err.message, 500);
    return;
  }

  console.error("❌  Unknown error:", err);
  sendError(res, "Internal server error", 500);
}
