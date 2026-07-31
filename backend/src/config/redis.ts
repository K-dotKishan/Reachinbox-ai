import IORedis from "ioredis";
import { env } from "./env";

// Shared Redis connection — reused by BullMQ queues and workers.
// Supports both local Redis (redis://) and Upstash TLS (rediss://).
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,   // Required by BullMQ
  enableReadyCheck: false,
  // TLS for Upstash (rediss://)
  tls: env.REDIS_URL.startsWith("rediss://") ? {
    rejectUnauthorized: false,
  } : undefined,
  // Limit reconnect attempts to avoid flooding logs
  retryStrategy: (times: number) => {
    if (times > 5) {
      console.error(`❌  Redis: giving up after ${times} retries`);
      return null; // stop retrying
    }
    return Math.min(times * 500, 3000); // wait 500ms, 1s, 1.5s...
  },
});

redisConnection.on("connect", () => {
  console.log("✅  Redis connected");
});

redisConnection.on("error", (err: Error) => {
  console.error("❌  Redis error:", err.message);
});
