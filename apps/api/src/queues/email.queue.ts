import { Queue } from "bullmq";
import { redisConnection, isRedisReady } from "../config/redis.js";

// ── Job type definitions ───────────────────────────────────────────────────

export type EmailJobName =
  | "send-invite"
  | "send-password-reset"
  | "send-welcome";

export type EmailJobData =
  | {
      type: "send-invite";
      to: string;
      inviteeName: string;
      inviterName: string;
      orgName: string;
      role: "admin" | "member";
      token: string;
    }
  | {
      type: "send-password-reset";
      to: string;
      userName: string;
      token: string;
    }
  | {
      type: "send-welcome";
      to: string;
      userName: string;
      orgName: string;
    };

// ── Queue instance ─────────────────────────────────────────────────────────

export const emailQueue = new Queue<EmailJobData>("email", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail:     { count: 500 },
  },
});

emailQueue.on("error", (err) => {
  // Suppress repetitive connection noise — redis.ts already logs it
  if (!err.message.includes("ETIMEDOUT") && !err.message.includes("ECONNREFUSED")) {
    console.error("[EmailQueue] Queue error:", err.message);
  }
});

// ── Helpers — guard against Redis being unavailable ────────────────────────
// If Redis is down emails are silently skipped — the server still works.

export async function queueInviteEmail(data: {
  to: string;
  inviteeName: string;
  inviterName: string;
  orgName: string;
  role: "admin" | "member";
  token: string;
}) {
  if (!isRedisReady()) {
    console.warn("[EmailQueue] Redis unavailable — invite email skipped for:", data.to);
    return;
  }
  await emailQueue.add("send-invite", { type: "send-invite", ...data });
}

export async function queuePasswordResetEmail(data: {
  to: string;
  userName: string;
  token: string;
}) {
  if (!isRedisReady()) {
    console.warn("[EmailQueue] Redis unavailable — password-reset email skipped for:", data.to);
    return;
  }
  await emailQueue.add("send-password-reset", { type: "send-password-reset", ...data });
}

export async function queueWelcomeEmail(data: {
  to: string;
  userName: string;
  orgName: string;
}) {
  if (!isRedisReady()) {
    console.warn("[EmailQueue] Redis unavailable — welcome email skipped for:", data.to);
    return;
  }
  await emailQueue.add("send-welcome", { type: "send-welcome", ...data });
}
