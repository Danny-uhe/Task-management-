import { prisma } from "../../config/prisma.js";
import { Prisma } from "@prisma/client";
import crypto from "node:crypto";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { hashPassword } from "../../utils/password.js";
import {
  queueInviteEmail,
  queueWelcomeEmail,
} from "../../queues/email.queue.js";

const ORG_ID = "org_default";

// ─────────────────────────────────────────────────────────────────────────────
// SEND INVITE  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export async function createInvitation(
  invitedById: string,
  email: string,
  name: string,
  systemRole: "admin" | "member",
  projectId?: string,
  projectRole: string = "member"
) {
  // Block if already a registered member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const isMember = await prisma.organizationMember.findFirst({
      where: { userId: existingUser.id, organizationId: ORG_ID },
    });
    if (isMember) throw new Error("This user is already a member of the organisation.");
  }

  // Block duplicate pending invites
  const pending = await prisma.invitation.findFirst({
    where: { email, organizationId: ORG_ID, status: "PENDING" },
  });
  if (pending) throw new Error("A pending invitation already exists for this email. Cancel it first or use resend.");

  const token     = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({
    data: {
      email, name,
      organizationId: ORG_ID,
      invitedById,
      systemRole, role: projectRole,
      projectId,
      token, expiresAt,
    },
  });

  // Fetch inviter name for the email
  const inviter = await prisma.user.findUnique({
    where: { id: invitedById },
    select: { name: true },
  });

  const org = await prisma.organization.findUnique({
    where: { id: ORG_ID },
    select: { name: true },
  });

  // Queue the email — returns immediately, sends in background
  await queueInviteEmail({
    to:          email,
    inviteeName: name,
    inviterName: inviter?.name ?? "Admin",
    orgName:     org?.name    ?? "TaskSync",
    role:        systemRole,
    token,
  });

  return invitation;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET INVITE BY TOKEN  (public — for the accept-invite page)
// ─────────────────────────────────────────────────────────────────────────────
export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      invitedBy:    { select: { name: true } },
      organization: { select: { name: true } },
    },
  });

  if (!invitation)                       throw new Error("Invitation not found.");
  if (invitation.status === "ACCEPTED")  throw new Error("This invitation has already been accepted. Try logging in.");
  if (invitation.status === "CANCELLED") throw new Error("This invitation was cancelled. Contact your admin.");
  if (invitation.expiresAt < new Date()) throw new Error("This invitation has expired. Ask your admin to send a new one.");

  return invitation;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCEPT INVITE + CREATE ACCOUNT  (public)
// ─────────────────────────────────────────────────────────────────────────────
export async function acceptInvitation(token: string, password: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token } });

  if (!invitation)                        throw new Error("Invitation not found.");
  if (invitation.status !== "PENDING")    throw new Error("This invitation has already been used or cancelled.");
  if (invitation.expiresAt < new Date())  throw new Error("This invitation has expired. Ask your admin to send a new one.");

  const existing = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (existing) throw new Error("An account with this email already exists. Try logging in.");

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Create user
    const user = await tx.user.create({
      data: {
        name:       invitation.name,
        email:      invitation.email,
        password:   hashedPassword,
        systemRole: invitation.systemRole,
        isActive:   true,
      },
    });

    // 2. Add to organisation
    await tx.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId: user.id,
        role: invitation.systemRole === "admin" ? "admin" : "member",
      },
    });

    // 3. Add to project if invite included one (graceful — project might be deleted)
    if (invitation.projectId) {
      const projectExists = await tx.project.findUnique({
        where: { id: invitation.projectId },
      });
      if (projectExists) {
        await tx.projectMember.create({
          data: {
            projectId: invitation.projectId,
            userId:    user.id,
            role:      invitation.role ?? "member",
          },
        });
      }
      // If project was deleted — skip silently; user is still created
    }

    // 4. Mark invite as accepted
    await tx.invitation.update({
      where: { id: invitation.id },
      data:  { status: "ACCEPTED" },
    });

    return user;
  });

  // 5. Issue tokens — user is logged in immediately
  const accessToken  = generateAccessToken(newUser.id, newUser.systemRole);
  const refreshToken = generateRefreshToken(newUser.id);

  await prisma.refreshToken.create({
    data: {
      token:     refreshToken,
      userId:    newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 6. Queue welcome email in background
  const org = await prisma.organization.findUnique({
    where: { id: ORG_ID },
    select: { name: true },
  });

  await queueWelcomeEmail({
    to:       newUser.email,
    userName: newUser.name,
    orgName:  org?.name ?? "TaskSync",
  });

  return {
    user: {
      id:         newUser.id,
      name:       newUser.name,
      email:      newUser.email,
      systemRole: newUser.systemRole,
      isActive:   newUser.isActive,
    },
    accessToken,
    refreshToken,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST ALL INVITATIONS  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export async function listInvitations() {
  return prisma.invitation.findMany({
    where: { organizationId: ORG_ID },
    include: { invitedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL INVITATION  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export async function cancelInvitation(invitationId: string) {
  const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
  if (!invite)                     throw new Error("Invitation not found.");
  if (invite.status !== "PENDING") throw new Error("Only pending invitations can be cancelled.");

  return prisma.invitation.update({
    where: { id: invitationId },
    data:  { status: "CANCELLED" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// RESEND INVITATION  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export async function resendInvitation(invitationId: string) {
  const invite = await prisma.invitation.findUnique({
    where:   { id: invitationId },
    include: { invitedBy: { select: { name: true } } },
  });
  if (!invite) throw new Error("Invitation not found.");

  // Cancel old token so it can never be used
  await prisma.invitation.update({
    where: { id: invitationId },
    data:  { status: "CANCELLED" },
  });

  // Create fresh invite
  const newToken     = crypto.randomBytes(32).toString("hex");
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const newInvite = await prisma.invitation.create({
    data: {
      email:          invite.email,
      name:           invite.name,
      organizationId: invite.organizationId,
      invitedById:    invite.invitedById,
      systemRole:     invite.systemRole,
      role:           invite.role,
      projectId:      invite.projectId,
      token:          newToken,
      expiresAt:      newExpiresAt,
    },
  });

  const org = await prisma.organization.findUnique({
    where: { id: ORG_ID },
    select: { name: true },
  });

  // Queue fresh invite email
  await queueInviteEmail({
    to:          invite.email,
    inviteeName: invite.name,
    inviterName: invite.invitedBy.name,
    orgName:     org?.name ?? "TaskSync",
    role:        invite.systemRole,
    token:       newToken,
  });

  return newInvite;
}