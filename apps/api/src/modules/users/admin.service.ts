import { prisma } from "../../config/prisma.js";

// ─── List all users ───────────────────────────────────────────────────────────
export async function getAllOrgUsers() {
  return prisma.user.findMany({
    select: {
      id: true, name: true, email: true,
      bio: true, avatar: true, position: true,
      isOnline: true, points: true,
      systemRole: true, isActive: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
}

// ─── Update name / email ──────────────────────────────────────────────────────
export async function updateUserProfile(
  targetUserId: string,
  data: { name?: string; email?: string }
) {
  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: targetUserId } },
    });
    if (existing) throw new Error("This email is already in use.");
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data,
    select: { id: true, name: true, email: true },
  });
}

// ─── Promote / demote ─────────────────────────────────────────────────────────
export async function updateUserSystemRole(
  callerId: string,
  targetUserId: string,
  systemRole: "admin" | "member"
) {
  if (callerId === targetUserId) {
    throw new Error("You cannot change your own role.");
  }

  // Guard: never remove the last admin
  if (systemRole === "member") {
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (target?.systemRole === "admin") {
      const activeAdminCount = await prisma.user.count({
        where: { systemRole: "admin", isActive: true },
      });
      if (activeAdminCount <= 1) {
        throw new Error(
          "Cannot demote the last admin. Promote another user to admin first."
        );
      }
    }
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data:  { systemRole },
    select: { id: true, name: true, email: true, systemRole: true },
  });
}

// ─── Deactivate (soft-delete — keeps all data) ────────────────────────────────
export async function deactivateUser(callerId: string, targetUserId: string) {
  if (callerId === targetUserId) {
    throw new Error("You cannot deactivate your own account.");
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new Error("User not found.");

  // Guard: never deactivate the last admin
  if (target.systemRole === "admin") {
    const activeAdminCount = await prisma.user.count({
      where: { systemRole: "admin", isActive: true },
    });
    if (activeAdminCount <= 1) {
      throw new Error(
        "Cannot deactivate the last admin. Promote another user to admin first."
      );
    }
  }

  // Immediately revoke all active sessions so deactivation takes effect now
  await prisma.refreshToken.deleteMany({ where: { userId: targetUserId } });

  return prisma.user.update({
    where: { id: targetUserId },
    data:  { isActive: false },
    select: { id: true, name: true, isActive: true },
  });
}

// ─── Reactivate ───────────────────────────────────────────────────────────────
export async function activateUser(targetUserId: string) {
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new Error("User not found.");

  return prisma.user.update({
    where: { id: targetUserId },
    data:  { isActive: true },
    select: { id: true, name: true, isActive: true },
  });
}