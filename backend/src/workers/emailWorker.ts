import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { EMAIL_QUEUE_NAME } from "../queue/emailQueue";
import { EmailJobData } from "../types";
import { env } from "../config/env";
import { checkRateLimit } from "../utils/rateLimiter";
import {
  markProcessing,
  markSent,
  markFailed,
  rescheduleEmail,
} from "../services/emailService";
import { sendMail } from "../services/mailerService";

/**
 * Processes a single email job:
 * 1. Check hourly rate limit for sender
 * 2. If exceeded → reschedule into next available window (no failure)
 * 3. Otherwise → mark processing → send → mark sent
 * 4. On error → mark failed (BullMQ will retry per backoff config)
 */
async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { emailId, recipient, subject, body, senderEmail } = job.data;

  console.log(`⚙️   Processing job ${job.id} for email ${emailId}`);

  // ── Rate limit check ────────────────────────────────────────────────────────
  const { allowed, retryAfterMs } = await checkRateLimit(
    senderEmail,
    env.MAX_EMAILS_PER_HOUR
  );

  if (!allowed) {
    console.warn(
      `⏳  Rate limit exceeded for ${senderEmail}. Rescheduling in ${retryAfterMs}ms`
    );
    await rescheduleEmail(emailId, retryAfterMs);
    // Return without error so BullMQ does NOT count this as a failure
    return;
  }

  // ── Send ────────────────────────────────────────────────────────────────────
  await markProcessing(emailId);

  try {
    await sendMail({
      from: `"Email Scheduler" <${senderEmail}>`,
      to: recipient,
      subject,
      html: body,
    });

    await markSent(emailId);
    console.log(`✅  Email ${emailId} sent to ${recipient}`);
  } catch (err) {
    await markFailed(emailId);
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌  Email ${emailId} failed: ${message}`);
    // Re-throw so BullMQ retries according to backoff config
    throw err;
  }
}

/**
 * Creates and starts the BullMQ worker.
 * Called once from app.ts — runs in the same process as the API server.
 */
export function startEmailWorker(): Worker<EmailJobData> {
  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    processEmailJob,
    {
      connection: redisConnection,
      concurrency: env.WORKER_CONCURRENCY,
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅  Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌  Job ${job?.id} failed: ${err.message}`);
  });

  worker.on("error", (err) => {
    console.error("❌  Worker error:", err.message);
  });

  console.log(
    `🚀  Email worker started (concurrency: ${env.WORKER_CONCURRENCY})`
  );

  return worker;
}
