import "dotenv/config";
import { createServer } from "node:http";

import app from "./app.js";
import { initSocket } from "./sockets/socket.js";
import { verifyMailer } from "./config/mailer.js";
import { closeRedis } from "./config/redis.js";
import { startEmailWorker } from "./queues/email.worker.js";
import { prisma, startKeepAlive, stopKeepAlive } from "./config/prisma.js";

const PORT = Number(process.env.PORT) || 5000;

// ── Seed default Organisation (required for invitations FK) ────────────────
async function seedOrganisation() {
  try {
    await prisma.organization.upsert({
      where:  { id: "org_default" },
      update: {},
      create: { id: "org_default", name: "TaskSync" },
    });
  } catch {
    // Non-fatal — server still starts
  }
}

// ── Seed admin user from env vars (production bootstrap) ───────────────────
async function seedAdmin() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name     = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) return; // env vars not set — skip silently

  try {
    const bcrypt = await import("bcrypt");
    const hashed = await bcrypt.hash(password, 12);

    const existing = await prisma.user.findUnique({ where: { email } });
    const admin = existing
      ? existing.systemRole === "admin"
        ? existing
        : await prisma.user.update({
            where: { email },
            data: { systemRole: "admin", isActive: true, password: hashed },
          })
      : await prisma.user.create({
          data: { name, email, password: hashed, systemRole: "admin", isActive: true },
        });

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: "org_default",
          userId: admin.id,
        },
      },
      update: { role: "admin" },
      create: {
        organizationId: "org_default",
        userId: admin.id,
        role: "admin",
      },
    });

    console.log(
      existing
        ? existing.systemRole === "admin"
          ? "[Admin] Admin user and organization membership verified ✅"
          : `[Admin] Existing user promoted to admin: ${email}`
        : `[Admin] Admin created: ${email}`
    );
  } catch (err) {
    console.error("[Admin] Failed to seed admin:", (err as Error).message);
    // Non-fatal — server still starts
  }
}

// ── Create HTTP server (shared by Express + Socket.io) ─────────────────────
const httpServer = createServer(app);

// ── Initialise Socket.io ───────────────────────────────────────────────────
initSocket(httpServer);

// ── Start background workers ───────────────────────────────────────────────
const emailWorker = startEmailWorker();

// ── Verify SMTP on startup (non-blocking) ─────────────────────────────────
verifyMailer();

// ── Start HTTP server ──────────────────────────────────────────────────────
seedOrganisation().then(() => seedAdmin()).then(() => {
  httpServer.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    startKeepAlive(); // Ping DB every 4min so Neon never sleeps
  });
});

// ── Graceful shutdown ──────────────────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`\n[Server] ${signal} received — shutting down gracefully…`);

  httpServer.close(async () => {
    console.log("[Server] HTTP server closed");
    stopKeepAlive();

    try {
      await emailWorker.close();
      console.log("[EmailWorker] Stopped");

      await closeRedis();
      await prisma.$disconnect();
      console.log("[Server] Shutdown complete");
      process.exit(0);
    } catch (err) {
      console.error("[Server] Error during shutdown:", err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("[Server] Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));