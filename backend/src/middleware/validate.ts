import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { sendError } from "../utils/response";

/**
 * Express middleware factory that validates `req.body` against a Zod schema.
 * On failure it returns a 422 with field-level error details.
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      sendError(res, "Validation error", 422, result.error.flatten().fieldErrors);
      return;
    }
    // Attach parsed + coerced data back onto the body
    req.body = result.data;
    next();
  };
}
