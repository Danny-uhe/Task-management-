import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

/**
 * All email job types that can be queued.
 */
export type EmailJobName =
  | "send-invite"
  | "send-password-reset"
  | "send-welcome";

/**
 * Typed payloads for each email job.
 * Add new email types here as the app grows.
 */
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

/**
 * The email queue.
 *
 * Default job options:
 *  - 3 retries with exponential backoff (1s → 2s → 4s)
 *  - Jobs are removed from Redis after completion/failure to save memory
 *  - Jobs that fail all retries are kept in the "failed" list for inspection
 */
export const emailQueue = new Queue<EmailJobData>("email", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type:  "exponential",
      delay: 1000, // 1s, 2s, 4s
    },
    removeOnComplete: { count: 100 }, // keep last 100 successful jobs for monitoring
    removeOnFail:     { count: 500 }, // keep last 500 failed jobs for debugging
  },
});

emailQueue.on("error", (err) => {
  console.error("[EmailQueue] Queue error:", err.message);
});

// ─── Convenience helpers ───────────────────────────────────────────────────
// These are the only functions the rest of the app should call.
// They add jobs to the queue — the worker processes them asynchronously.

/**
 * Queue an invitation email.
 * Returns immediately — email is sent in the background.
 */
export async function queueInviteEmail(data: {
  to: string;
  inviteeName: string;
  inviterName: string;
  orgName: string;
  role: "admin" | "member";
  token: string;
}) {
  await emailQueue.add("send-invite", { type: "send-invite", ...data });
}

/**
 * Queue a password reset email.
 * Returns immediately — email is sent in the background.
 */
export async function queuePasswordResetEmail(data: {
  to: string;
  userName: string;
  token: string;
}) {
  await emailQueue.add("send-password-reset", { type: "send-password-reset", ...data });
}

/**
 * Queue a welcome email (sent after invite is accepted).
 * Returns immediately — email is sent in the background.
 */
export async function queueWelcomeEmail(data: {
  to: string;
  userName: string;
  orgName: string;
}) {
  await emailQueue.add("send-welcome", { type: "send-welcome", ...data });
}
