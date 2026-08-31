import nodemailer from "nodemailer";
import { env } from "./env.js";

/**
 * Production-grade Nodemailer transporter.
 *
 * Supports:
 *  - Gmail SMTP (via App Password)
 *  - Any SMTP relay: Brevo, SendGrid, AWS SES, Postmark, Mailgun
 *    (just change SMTP_HOST/PORT/USER/PASS in .env)
 *  - Connection pooling (up to 5 simultaneous connections)
 *  - TLS (secure on port 465, STARTTLS on 587)
 *  - Rate limiting (max 5 messages per second)
 */
export const transporter = nodemailer.createTransport({
  host:   env.SMTP_HOST,
  port:   env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true = TLS; false = STARTTLS (port 587)
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  pool:           true,  // keep connections alive (much faster in production)
  maxConnections: 5,     // max simultaneous SMTP connections
  maxMessages:    10,    // max messages per connection before reconnecting
  rateDelta:      1000,  // time window in ms
  rateLimit:      5,     // max messages per rateDelta window

  tls: {
    // Strict in production; relaxed in dev (allows self-signed certs)
    rejectUnauthorized: env.NODE_ENV === "production",
  },
});

/**
 * Verify SMTP connection on startup.
 * Logs a warning but does NOT crash the server if SMTP is unreachable.
 * Failed emails will be retried by the BullMQ worker.
 */
export async function verifyMailer(): Promise<void> {
  try {
    await transporter.verify();
    console.log("[Mailer] SMTP connection verified ✅");
  } catch (err) {
    console.error("[Mailer] ⚠️  SMTP connection failed:", (err as Error).message);
    console.warn("[Mailer] Emails will fail until SMTP is reachable.");
  }
}