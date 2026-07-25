import IORedis from "ioredis";
import { env } from "./env";

// Shared Redis connection — reused by BullMQ queues and workers
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
});

redisConnection.on("connect", () => {
  console.log("✅  Redis connected");
});

redisConnection.on("error", (err: Error) => {
  console.error("❌  Redis error:", err.message);
});
