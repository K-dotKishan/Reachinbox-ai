import { prisma } from "../config/prisma";
import { emailQueue } from "../queue/emailQueue";
import { env } from "../config/env";
import { ScheduleEmailSchema } from "../utils/validation";
import { EmailJobData, EmailRecord } from "../types";
import { EmailStatus } from "@prisma/client";

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Creates one Email row + one BullMQ delayed job per recipient.
 * Jobs are staggered by `delayBetweenMs` to respect send cadence.
 */
export async function scheduleEmails(
  input: ScheduleEmailSchema,
  userId: string,
  senderEmail: string
): Promise<EmailRecord[]> {
  const baseDelay = Math.max(
    0,
    new Date(input.scheduledAt).getTime() - Date.now()
  );

  const created: EmailRecord[] = [];

  for (let i = 0; i < input.recipients.length; i++) {
    const recipient = input.recipients[i];
    const jobDelay = baseDelay + i * input.delayBetweenMs;

    // Persist to DB first (status = scheduled)
    const email = await prisma.email.create({
      data: {
        recipient,
        subject: input.subject,
        body: input.body,
        scheduledAt: new Date(input.scheduledAt),
        status: EmailStatus.scheduled,
        senderEmail,
        userId,
      },
    });

    const jobData: EmailJobData = {
      emailId: email.id,
      recipient,
      subject: input.subject,
      body: input.body,
      senderEmail,
      userId,
    };

    // Add delayed BullMQ job
    const job = await emailQueue.add(`send-email-${email.id}`, jobData, {
      delay: jobDelay,
      jobId: `email-${email.id}`, // idempotency — prevents duplicate scheduling
    });

    // Store the BullMQ job id so we can trace it later
    await prisma.email.update({
      where: { id: email.id },
      data: { bullJobId: job.id ?? null },
    });

    created.push({ ...email, bullJobId: job.id ?? null });
  }

  return created;
}

// ─── Query ────────────────────────────────────────────────────────────────────

export async function getScheduledEmails(userId: string): Promise<EmailRecord[]> {
  return prisma.email.findMany({
    where: {
      userId,
      status: { in: [EmailStatus.scheduled, EmailStatus.processing] },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getSentEmails(userId: string): Promise<EmailRecord[]> {
  return prisma.email.findMany({
    where: {
      userId,
      status: { in: [EmailStatus.sent, EmailStatus.failed] },
    },
    orderBy: { sentAt: "desc" },
  });
}

// ─── Status helpers (used by worker) ─────────────────────────────────────────

export async function markProcessing(emailId: string): Promise<void> {
  await prisma.email.update({
    where: { id: emailId },
    data: { status: EmailStatus.processing },
  });
}

export async function markSent(emailId: string): Promise<void> {
  await prisma.email.update({
    where: { id: emailId },
    data: { status: EmailStatus.sent, sentAt: new Date() },
  });
}

export async function markFailed(emailId: string): Promise<void> {
  await prisma.email.update({
    where: { id: emailId },
    data: { status: EmailStatus.failed },
  });
}

export async function rescheduleEmail(
  emailId: string,
  delayMs: number
): Promise<void> {
  // Reset status back to scheduled so the worker won't double-count
  await prisma.email.update({
    where: { id: emailId },
    data: { status: EmailStatus.scheduled },
  });

  // Re-add to queue with new delay — BullMQ jobId ensures no duplicate
  const email = await prisma.email.findUniqueOrThrow({ where: { id: emailId } });

  const jobData: EmailJobData = {
    emailId: email.id,
    recipient: email.recipient,
    subject: email.subject,
    body: email.body,
    senderEmail: email.senderEmail,
    userId: email.userId,
  };

  const job = await emailQueue.add(`send-email-${email.id}`, jobData, {
    delay: delayMs,
    jobId: `email-${email.id}-retry-${Date.now()}`,
  });

  await prisma.email.update({
    where: { id: emailId },
    data: { bullJobId: job.id ?? null },
  });
}

// ─── Config defaults (env fallbacks) ─────────────────────────────────────────

export const defaultHourlyLimit = env.MAX_EMAILS_PER_HOUR;
export const defaultDelayMs = env.EMAIL_DELAY_MS;
