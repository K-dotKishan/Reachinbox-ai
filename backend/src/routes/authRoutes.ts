import { Router, Request, Response } from "express";
import passport from "../config/passport";
import { logout, googleCallback } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { verifyToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";

const router = Router();

// Redirect to Google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google redirects back here after consent
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/failure" }),
  googleCallback
);

router.get("/failure", (_req: Request, res: Response) => {
  res.status(401).json({ success: false, error: "Google authentication failed" });
});

// Get current user — supports both session cookie AND Bearer JWT token
router.get("/me", (req: Request, res: Response) => {
  // 1. Try session first (local dev)
  if (req.session?.user) {
    sendSuccess(res, { user: req.session.user });
    return;
  }

  // 2. Try JWT Bearer token (production cross-domain)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const user = verifyToken(token);
    if (user) {
      sendSuccess(res, { user });
      return;
    }
  }

  sendError(res, "Not authenticated", 401);
});

// Logout
router.post("/logout", requireAuth, logout);

export default router;
