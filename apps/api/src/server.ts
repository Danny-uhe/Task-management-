import "dotenv/config";

import app from "./app.js";
import { verifyMailer } from "./config/mailer.js";
import { closeRedis } from "./config/redis.js";
import { startEmailWorker } from "./queues/email.worker.js";

const PORT = Number(process.env.PORT) || 5000;

// ── Start background workers ───────────────────────────────────────────────
const emailWorker = startEmailWorker();

// ── Verify SMTP on startup (non-blocking) ─────────────────────────────────
verifyMailer();

// ── Start HTTP server ──────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

// ── Graceful shutdown ──────────────────────────────────────────────────────
// On SIGTERM / SIGINT: stop accepting new requests, finish in-flight work,
// close queue workers and Redis, then exit cleanly.
async function shutdown(signal: string) {
  console.log(`\n[Server] ${signal} received — shutting down gracefully…`);

  server.close(async () => {
    console.log("[Server] HTTP server closed");

    try {
      await emailWorker.close();
      console.log("[EmailWorker] Stopped");

      await closeRedis();
      console.log("[Server] Shutdown complete");
      process.exit(0);
    } catch (err) {
      console.error("[Server] Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Force-exit if graceful shutdown takes longer than 10 seconds
  setTimeout(() => {
    console.error("[Server] Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));