import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { env } from "./env.js";

/**
 * Production-grade Nodemailer transporter.
 *
 * - Gmail SMTP via App Password (port 465 direct TLS)
 * - Any SMTP relay: Brevo, SendGrid, AWS SES, Postmark, Mailgun
 *   (change SMTP_HOST/PORT/USER/PASS in .env)
 * - Non-pooled: Gmail closes idle connections quickly, causing
 *   "Greeting never received" errors when pool=true is used.
 */
const smtpOptions: SMTPTransport.Options = {
  host:   env.SMTP_HOST,
  port:   env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true = direct TLS; false = STARTTLS
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  connectionTimeout: 15_000, // 15s to establish connection
  greetingTimeout:   15_000, // 15s to receive SMTP greeting
  socketTimeout:     30_000, // 30s per socket op

  tls: {
    rejectUnauthorized: env.NODE_ENV === "production",
  },
};

export const transporter = nodemailer.createTransport(smtpOptions);

/**
 * Verify SMTP connection on startup.
 * Logs a warning but does NOT crash the server if SMTP is unreachable.
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
