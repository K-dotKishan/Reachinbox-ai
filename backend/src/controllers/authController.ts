import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { signToken } from "../utils/jwt";
import { env } from "../config/env";
import { SessionUser } from "../types";

export function getCurrentUser(req: Request, res: Response): void {
  if (!req.session.user) {
    sendError(res, "Not authenticated", 401);
    return;
  }
  sendSuccess(res, { user: req.session.user });
}

export function logout(req: Request, res: Response): void {
  req.session.destroy((err: unknown) => {
    if (err) {
      sendError(res, "Logout failed", 500);
      return;
    }
    res.clearCookie("connect.sid");
    res.redirect(env.FRONTEND_URL);
  });
}

export function googleCallback(req: Request, res: Response): void {
  const user = req.user as SessionUser;

  // Store in session (for same-domain use)
  req.session.user = user;

  // Also issue a JWT and pass it in the redirect URL
  // This solves cross-domain cookie issues (Vercel frontend + Render backend)
  const token = signToken(user);

  res.redirect(`${env.FRONTEND_URL}/dashboard?token=${token}`);
}
