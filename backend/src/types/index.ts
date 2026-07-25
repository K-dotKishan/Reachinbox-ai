import { EmailStatus } from "@prisma/client";

// ─── Auth / Session ───────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

declare module "express-session" {
  interface SessionData {
    user: SessionUser;
  }
}

// ─── Email ────────────────────────────────────────────────────────────────────

export interface ScheduleEmailInput {
  recipients: string[];
  subject: string;
  body: string;
  scheduledAt: string; // ISO 8601
  delayBetweenMs: number;
  hourlyLimit: number;
}

export interface EmailRecord {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
  sentAt: Date | null;
  status: EmailStatus;
  senderEmail: string;
  bullJobId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── BullMQ Job Data ──────────────────────────────────────────────────────────

export interface EmailJobData {
  emailId: string;
  recipient: string;
  subject: string;
  body: string;
  senderEmail: string;
  userId: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
