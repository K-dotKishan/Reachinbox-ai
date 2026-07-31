import IORedis from "ioredis";
import { env } from "./env";

// Common BullMQ-required options
const baseOptions = {
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,
  connectTimeout: 15000,
  retryStrategy: (times: number) => {
    if (times > 20) {
      console.error("❌  Redis: max retries reached");
      return null;
    }
    return Math.min(times * 250, 3000);
  },
};

function createRedisConnection(): IORedis {
  if (env.REDIS_URL.startsWith("rediss://")) {
    // Upstash TLS — pass URL directly, IORedis handles rediss:// natively
    // The key is setting tls:{} separately to force TLS regardless of cert
    return new IORedis(env.REDIS_URL, {
      ...baseOptions,
      tls: {},
    });
  }

  return new IORedis(env.REDIS_URL, baseOptions);
}

export const redisConnection = createRedisConnection();

redisConnection.on("connect", () => console.log("✅  Redis connected"));
redisConnection.on("ready", () => console.log("✅  Redis ready"));
redisConnection.on("error", (err: Error) => console.error("❌  Redis error:", err.message));
redisConnection.on("close", () => console.warn("⚠️   Redis connection closed"));
redisConnection.on("reconnecting", () => console.log("🔄  Redis reconnecting..."));
