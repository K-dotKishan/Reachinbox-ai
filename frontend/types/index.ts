// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

// ─── Email ────────────────────────────────────────────────────────────────────

export type EmailStatus = "scheduled" | "processing" | "sent" | "failed";

export interface Email {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  status: EmailStatus;
  senderEmail: string;
  bullJobId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Compose Form ─────────────────────────────────────────────────────────────

export interface ComposeFormValues {
  recipients: string[];        // parsed from CSV / manual input
  subject: string;
  body: string;
  scheduledAt: string;         // ISO 8601
  delayBetweenMs: number;
  hourlyLimit: number;
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
