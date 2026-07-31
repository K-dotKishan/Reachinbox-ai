import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiResponse, Email, User, ComposeFormValues } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Singleton axios instance — sends cookies for session auth
const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Response interceptor ─────────────────────────────────────────────────────
http.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      // Session expired — redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractData<T>(response: { data: ApiResponse<T> }): T {
  const body = response.data;
  if (!body.success) throw new Error(body.error);
  return body.data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  getMe: async (): Promise<User> => {
    const res = await http.get<ApiResponse<{ user: User }>>("/api/auth/me");
    return extractData(res).user;
  },

  logout: async (): Promise<void> => {
    await http.post("/api/auth/logout");
  },

  getGoogleLoginUrl: (): string => `${BASE_URL}/api/auth/google`,
};

// ─── Emails ───────────────────────────────────────────────────────────────────

export interface SchedulePayload {
  recipients: string[];
  subject: string;
  body: string;
  scheduledAt: string;
  delayBetweenMs: number;
  hourlyLimit: number;
}

export interface ScheduleResponse {
  scheduled: number;
  emails: Email[];
}

export const emailApi = {
  schedule: async (payload: SchedulePayload): Promise<ScheduleResponse> => {
    const res = await http.post<ApiResponse<ScheduleResponse>>(
      "/api/emails/schedule",
      payload
    );
    return extractData(res);
  },

  getScheduled: async (): Promise<Email[]> => {
    const res = await http.get<ApiResponse<{ emails: Email[] }>>(
      "/api/emails/scheduled"
    );
    return extractData(res).emails;
  },

  getSent: async (): Promise<Email[]> => {
    const res = await http.get<ApiResponse<{ emails: Email[] }>>(
      "/api/emails/sent"
    );
    return extractData(res).emails;
  },
};

// ─── CSV parsing (client-side) ────────────────────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

export function extractEmailsFromText(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) ?? [];
  // Deduplicate and lowercase
  return [...new Set(matches.map((e) => e.toLowerCase()))];
}

export function composeFormToPayload(
  form: ComposeFormValues
): SchedulePayload {
  return {
    recipients: form.recipients,
    subject: form.subject,
    body: form.body,
    scheduledAt: form.scheduledAt,
    delayBetweenMs: form.delayBetweenMs,
    hourlyLimit: form.hourlyLimit,
  };
}
