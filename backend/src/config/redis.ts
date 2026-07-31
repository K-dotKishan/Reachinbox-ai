import IORedis from "ioredis";
import { env } from "./env";

function createRedisConnection(): IORedis {
  const isUpstash = env.REDIS_URL.startsWith("rediss://");

  if (isUpstash) {
    const url = new URL(env.REDIS_URL);
    return new IORedis({
      host: url.hostname,
      port: Number(url.port) || 6380,
      password: decodeURIComponent(url.password),
      username: url.username || "default",
      tls: {
        rejectUnauthorized: false,
        servername: url.hostname,
      },
      maxRetriesPerRequest: null, // required by BullMQ
      enableReadyCheck: false,
      connectTimeout: 10000,
      retryStrategy: (times: number) => {
        // Retry up to 20 times with exponential backoff — Render cold start can be slow
        if (times > 20) {
          console.error("❌  Redis: max retries reached, giving up");
          return null;
        }
        const delay = Math.min(times * 200, 2000);
        console.log(`🔄  Redis: retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
    });
  }

  // Local Redis
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 10) return null;
      return Math.min(times * 300, 2000);
    },
  });
}

export const redisConnection = createRedisConnection();

redisConnection.on("connect", () => {
  console.log("✅  Redis connected");
});

redisConnection.on("ready", () => {
  console.log("✅  Redis ready");
});

redisConnection.on("error", (err: Error) => {
  console.error("❌  Redis error:", err.message);
});

redisConnection.on("close", () => {
  console.warn("⚠️   Redis connection closed");
});

redisConnection.on("reconnecting", () => {
  console.log("🔄  Redis reconnecting...");
});
