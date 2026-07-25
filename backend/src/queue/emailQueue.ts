import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
import { EmailJobData } from "../types";

export const EMAIL_QUEUE_NAME = "email-queue";

// Single queue instance — shared across the app
export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 10s, 20s
    },
    removeOnComplete: {
      count: 500, // keep last 500 completed jobs
    },
    removeOnFail: {
      count: 200, // keep last 200 failed jobs
    },
  },
});

emailQueue.on("error", (err: Error) => {
  console.error("❌  Email queue error:", err.message);
});
