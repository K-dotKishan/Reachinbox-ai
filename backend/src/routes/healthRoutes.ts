import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { redisConnection } from "../config/redis";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  // PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = "ok";
  } catch (e) {
    checks.postgres = e instanceof Error ? e.message : "error";
  }

  // Redis — reconnect if closed before pinging
  try {
    if (redisConnection.status === "end" || redisConnection.status === "close") {
      await redisConnection.connect();
    }
    const pong = await redisConnection.ping();
    checks.redis = pong === "PONG" ? "ok" : `unexpected: ${pong}`;
  } catch (e) {
    checks.redis = e instanceof Error ? e.message : "error";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "healthy" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;
