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
  } catch {
    checks.postgres = "error";
  }

  // Redis
  try {
    await redisConnection.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "healthy" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;
