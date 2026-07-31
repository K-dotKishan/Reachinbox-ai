import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { SessionUser } from "../types";

const EXPIRES_IN = "7d";

export function signToken(user: SessionUser): string {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}
