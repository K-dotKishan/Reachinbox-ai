import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { scheduleEmailSchema } from "../utils/validation";
import {
  scheduleEmailsHandler,
  getScheduledEmailsHandler,
  getSentEmailsHandler,
} from "../controllers/emailController";

const router = Router();

// All email routes require authentication
router.use(requireAuth);

// POST /api/emails/schedule
router.post("/schedule", validate(scheduleEmailSchema), scheduleEmailsHandler);

// GET /api/emails/scheduled
router.get("/scheduled", getScheduledEmailsHandler);

// GET /api/emails/sent
router.get("/sent", getSentEmailsHandler);

export default router;
