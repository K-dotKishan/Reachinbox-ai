import { z } from "zod";

// ─── Schedule Email Schema ────────────────────────────────────────────────────

export const scheduleEmailSchema = z.object({
  recipients: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one recipient required")
    .max(500, "Maximum 500 recipients per request"),
  subject: z.string().min(1, "Subject is required").max(998, "Subject too long"),
  body: z.string().min(1, "Body is required"),
  scheduledAt: z
    .string()
    .datetime({ message: "scheduledAt must be a valid ISO 8601 datetime" }),
  delayBetweenMs: z.number().nonnegative().default(2000),
  hourlyLimit: z.number().int().positive().max(1000).default(10),
});

export type ScheduleEmailSchema = z.infer<typeof scheduleEmailSchema>;
