import { redisConnection } from "../config/redis";

const WINDOW_SECONDS = 3600; // 1 hour

/**
 * Returns the Redis key for the per-sender hourly counter.
 * Key format: rate:email:<senderEmail>:<epochHour>
 */
function getRateLimitKey(senderEmail: string): string {
  const epochHour = Math.floor(Date.now() / (1000 * WINDOW_SECONDS));
  return `rate:email:${senderEmail}:${epochHour}`;
}

/**
 * Returns the number of seconds until the current hour window resets.
 */
function secondsUntilNextHour(): number {
  const now = Date.now();
  const msInHour = 1000 * WINDOW_SECONDS;
  return Math.ceil((msInHour - (now % msInHour)) / 1000);
}

/**
 * Increments the counter for `senderEmail` and checks against `limit`.
 *
 * @returns `{ allowed: true }` when under limit,
 *          `{ allowed: false, retryAfterMs: number }` when limit exceeded.
 */
export async function checkRateLimit(
  senderEmail: string,
  limit: number
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const key = getRateLimitKey(senderEmail);

  // Atomic increment + set expiry in one pipeline
  const pipeline = redisConnection.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, WINDOW_SECONDS + 60); // slight buffer
  const results = await pipeline.exec();

  const currentCount = (results?.[0]?.[1] as number) ?? 1;

  if (currentCount <= limit) {
    return { allowed: true, retryAfterMs: 0 };
  }

  const retryAfterMs = secondsUntilNextHour() * 1000;
  return { allowed: false, retryAfterMs };
}

/**
 * Decrements the counter (used if a job was added but later cancelled).
 */
export async function decrementRateLimit(senderEmail: string): Promise<void> {
  const key = getRateLimitKey(senderEmail);
  await redisConnection.decr(key);
}
