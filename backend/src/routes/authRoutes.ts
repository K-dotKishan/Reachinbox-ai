import { Router } from "express";
import passport from "../config/passport";
import { getCurrentUser, logout, googleCallback } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Redirect to Google consent screen
// NOTE: Do NOT pass session:false here — Passport needs to store the
// OAuth state cookie during the redirect round-trip to prevent CSRF.
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google redirects back here after consent
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/failure",
  }),
  googleCallback
);

router.get("/failure", (_req, res) => {
  res.status(401).json({ success: false, error: "Google authentication failed" });
});

// Get logged-in user info
router.get("/me", requireAuth, getCurrentUser);

// Logout
router.post("/logout", requireAuth, logout);

export default router;
