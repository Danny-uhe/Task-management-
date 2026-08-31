/**
 * Email HTML templates for TaskSync.
 *
 * All templates use a shared base layout for consistent branding.
 * Plain-text versions are included for email clients that don't render HTML.
 */

// ─── Shared base layout ────────────────────────────────────────────────────

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                TaskSync
              </p>
              <p style="margin:4px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#93c5fd;">
                Workspace
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                This email was sent by TaskSync &middot; Your company workspace<br/>
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, text: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="border-radius:10px;background:#2563eb;">
          <a href="${href}"
             style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`;
}

function fallbackLink(href: string): string {
  return `<p style="font-size:13px;color:#94a3b8;word-break:break-all;margin-top:8px;">
    Or copy this link: <span style="color:#2563eb;">${href}</span>
  </p>`;
}

function expiryNote(text: string): string {
  return `<p style="font-size:13px;color:#f59e0b;margin-top:16px;">
    ⏱ ${text}
  </p>`;
}

// ─── Template 1 — Invite ───────────────────────────────────────────────────

export interface InviteEmailData {
  inviteeName:  string;
  inviterName:  string;
  orgName:      string;
  role:         "admin" | "member";
  inviteUrl:    string;
  expiresInDays: number;
}

export function buildInviteEmail(data: InviteEmailData) {
  const roleLabel = data.role === "admin" ? "Admin" : "Member";

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">
      You've been invited! 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      <strong style="color:#0f172a;">${data.inviterName}</strong> has invited you to join
      <strong style="color:#0f172a;">${data.orgName}</strong> on TaskSync as a
      <strong style="color:#2563eb;">${roleLabel}</strong>.
    </p>

    <p style="margin:0;font-size:15px;color:#475569;">
      Click below to set up your account and start collaborating:
    </p>

    ${ctaButton(data.inviteUrl, "Accept Invitation")}
    ${expiryNote(`This invitation expires in ${data.expiresInDays} days.`)}
    ${fallbackLink(data.inviteUrl)}
  `;

  const html  = baseLayout("You've been invited to TaskSync", body);
  const text  = [
    `Hi ${data.inviteeName},`,
    ``,
    `${data.inviterName} has invited you to join ${data.orgName} on TaskSync as a ${roleLabel}.`,
    ``,
    `Click the link below to accept:`,
    data.inviteUrl,
    ``,
    `This invitation expires in ${data.expiresInDays} days.`,
    ``,
    `If you weren't expecting this, ignore this email.`,
  ].join("\n");

  return {
    subject: `${data.inviterName} invited you to join ${data.orgName} on TaskSync`,
    html,
    text,
  };
}

// ─── Template 2 — Password Reset ──────────────────────────────────────────

export interface PasswordResetEmailData {
  userName:   string;
  resetUrl:   string;
  expiresInMinutes: number;
}

export function buildPasswordResetEmail(data: PasswordResetEmailData) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">
      Reset your password
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi <strong style="color:#0f172a;">${data.userName}</strong>, someone requested a
      password reset for your TaskSync account. Click below to set a new password.
    </p>

    ${ctaButton(data.resetUrl, "Reset Password")}
    ${expiryNote(`This link expires in ${data.expiresInMinutes} minutes.`)}
    ${fallbackLink(data.resetUrl)}

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
    <p style="font-size:13px;color:#94a3b8;margin:0;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will not change.
    </p>
  `;

  const html  = baseLayout("Reset your TaskSync password", body);
  const text  = [
    `Hi ${data.userName},`,
    ``,
    `Someone requested a password reset for your TaskSync account.`,
    ``,
    `Click the link below to reset your password:`,
    data.resetUrl,
    ``,
    `This link expires in ${data.expiresInMinutes} minutes.`,
    ``,
    `If you didn't request this, ignore this email. Your password won't change.`,
  ].join("\n");

  return {
    subject: "Reset your TaskSync password",
    html,
    text,
  };
}

// ─── Template 3 — Welcome (after accepting invite) ────────────────────────

export interface WelcomeEmailData {
  userName: string;
  orgName:  string;
  loginUrl: string;
}

export function buildWelcomeEmail(data: WelcomeEmailData) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">
      Welcome to ${data.orgName}! 👋
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi <strong style="color:#0f172a;">${data.userName}</strong>, your TaskSync account
      is ready. You can now log in and start collaborating with your team.
    </p>

    ${ctaButton(data.loginUrl, "Go to Dashboard")}
  `;

  const html  = baseLayout(`Welcome to ${data.orgName} on TaskSync`, body);
  const text  = [
    `Welcome to ${data.orgName} on TaskSync, ${data.userName}!`,
    ``,
    `Your account is ready. Log in here:`,
    data.loginUrl,
  ].join("\n");

  return {
    subject: `Welcome to ${data.orgName} on TaskSync`,
    html,
    text,
  };
}
