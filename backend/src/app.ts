import "./config/env"; // validate env vars first
import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import passport from "./config/passport";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import emailRoutes from "./routes/emailRoutes";
import healthRoutes from "./routes/healthRoutes";
import { startEmailWorker } from "./workers/emailWorker";
import { prisma } from "./config/prisma";

const app = express();

// ─── Security & Utilities ─────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Session ──────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// ─── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/health", healthRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("✅  PostgreSQL connected");

    // Start BullMQ worker in the same process
    startEmailWorker();

    app.listen(env.PORT, () => {
      console.log(`🚀  Server running on http://localhost:${env.PORT}`);
      console.log(`📌  Environment: ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error("❌  Bootstrap failed:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑  SIGTERM received — shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑  SIGINT received — shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();

export default app;
