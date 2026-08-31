import { Worker, type Job } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { transporter } from "../config/mailer.js";
import {
  buildInviteEmail,
  buildPasswordResetEmail,
  buildWelcomeEmail,
} from "../config/email.templates.js";
import { env } from "../config/env.js";
import type { EmailJobData } from "./email.queue.js";

const FRONTEND_URL = env.FRONTEND_URL;

/**
 * Email worker — processes jobs from the "email" BullMQ queue.
 *
 * Runs in the same process as the API server.
 * BullMQ handles retries automatically on failure (see queue defaultJobOptions).
 *
 * Job flow:
 *  1. Service adds job to queue (returns immediately — no delay to the HTTP response)
 *  2. Worker picks it up (almost instantly — milliseconds)
 *  3. Worker builds the email template and sends via SMTP
 *  4. On SMTP failure → BullMQ retries with exponential backoff (1s → 2s → 4s)
 *  5. After 3 failures → job moves to "failed" list for inspection
 */
export function startEmailWorker() {
  const worker = new Worker<EmailJobData>(
    "email",
    async (job: Job<EmailJobData>) => {
      const { data } = job;
      console.log(`[EmailWorker] Processing job "${job.name}" (id: ${job.id})`);

      switch (data.type) {
        // ── Invite email ──────────────────────────────────────────────────
        case "send-invite": {
          const inviteUrl = `${FRONTEND_URL}/invite/${data.token}`;
          const email = buildInviteEmail({
            inviteeName:   data.inviteeName,
            inviterName:   data.inviterName,
            orgName:       data.orgName,
            role:          data.role,
            inviteUrl,
            expiresInDays: 7,
          });

          await transporter.sendMail({
            from:    env.SMTP_FROM,
            to:      data.to,
            subject: email.subject,
            html:    email.html,
            text:    email.text,
          });

          console.log(`[EmailWorker] ✅ Invite sent to ${data.to}`);
          break;
        }

        // ── Password reset email ──────────────────────────────────────────
        case "send-password-reset": {
          const resetUrl = `${FRONTEND_URL}/reset-password/${data.token}`;
          const email = buildPasswordResetEmail({
            userName:         data.userName,
            resetUrl,
            expiresInMinutes: 60,
          });

          await transporter.sendMail({
            from:    env.SMTP_FROM,
            to:      data.to,
            subject: email.subject,
            html:    email.html,
            text:    email.text,
          });

          console.log(`[EmailWorker] ✅ Password reset sent to ${data.to}`);
          break;
        }

        // ── Welcome email ─────────────────────────────────────────────────
        case "send-welcome": {
          const loginUrl = `${FRONTEND_URL}/login`;
          const email = buildWelcomeEmail({
            userName: data.userName,
            orgName:  data.orgName,
            loginUrl,
          });

          await transporter.sendMail({
            from:    env.SMTP_FROM,
            to:      data.to,
            subject: email.subject,
            html:    email.html,
            text:    email.text,
          });

          console.log(`[EmailWorker] ✅ Welcome email sent to ${data.to}`);
          break;
        }

        default: {
          // TypeScript exhaustive check — should never happen
          const _exhaustive: never = data;
          throw new Error(`[EmailWorker] Unknown job type: ${JSON.stringify(_exhaustive)}`);
        }
      }
    },
    {
      connection:  redisConnection,
      concurrency: 5, // process up to 5 emails simultaneously
    }
  );

  // ── Worker event handlers ─────────────────────────────────────────────────
  worker.on("completed", (job) => {
    console.log(`[EmailWorker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    const attempts = job?.attemptsMade ?? 0;
    const max      = job?.opts?.attempts ?? 3;
    console.error(
      `[EmailWorker] Job ${job?.id} failed (attempt ${attempts}/${max}): ${err.message}`
    );
  });

  worker.on("error", (err) => {
    console.error("[EmailWorker] Worker error:", err.message);
  });

  console.log("[EmailWorker] Started and listening for email jobs");

  return worker;
}
