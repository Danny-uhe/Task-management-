import { prisma } from "../../config/prisma.js";
import { createInvitation } from "../invitaions/invitation.service.js";

/**
 * Total users count, total projects count, total tasks count, total tasks done,
 * and completion rate percentage.
 */
export async function getOrganisationStats() {
  const [totalUsers, totalProjects, totalTasks, totalTasksDone] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: "done" } }),
  ]);

  const completionRate =
    totalTasks > 0 ? Math.round((totalTasksDone / totalTasks) * 100) : 0;

  return {
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks: totalTasksDone,
    completionRate,
  };
}

/**
 * List all users with their project count, tasks count, and points.
 */
export async function getOrgMembers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      systemRole: true,
      isActive: true,
      avatar: true,
      bio: true,
      position: true,
      isOnline: true,
      points: true,
      streak: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
          assignedTasks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.systemRole,
    systemRole: u.systemRole,
    isActive: u.isActive,
    avatar: u.avatar,
    bio: u.bio,
    position: u.position,
    isOnline: u.isOnline,
    points: u.points,
    streak: u.streak,
    projectCount: u._count.projects,
    taskCount: u._count.assignedTasks,
    createdAt: u.createdAt,
  }));
}

/**
 * Creates an Invitation record and returns it.
 */
export async function inviteMember(
  email: string,
  invitedById: string,
  name?: string,
  systemRole: "admin" | "member" = "member"
) {
  const normalizedEmail = email.trim().toLowerCase();
  const inviteeName = name?.trim() || normalizedEmail.split("@")[0];

  return createInvitation(
    invitedById,
    normalizedEmail,
    inviteeName,
    systemRole
  );
}

/**
 * Deactivates user (set isActive: false).
 */
export async function removeUser(userId: string, callerId?: string) {
  if (callerId && callerId === userId) {
    throw new Error("You cannot remove your own account.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found.");

  if (target.systemRole === "admin") {
    const activeAdminCount = await prisma.user.count({
      where: { systemRole: "admin", isActive: true },
    });
    if (activeAdminCount <= 1) {
      throw new Error("Cannot deactivate the last admin. Promote another user first.");
    }
  }

  await prisma.refreshToken.deleteMany({ where: { userId } });

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: { id: true, name: true, email: true, systemRole: true, isActive: true },
  });
}

/**
 * Re-activates a previously deactivated user.
 */
export async function activateUser(userId: string) {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found.");

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
    select: { id: true, name: true, email: true, systemRole: true, isActive: true },
  });
}

/**
 * Change a user's systemRole (admin ↔ member).
 */
export async function changeUserRole(
  userId: string,
  systemRole: "admin" | "member",
  callerId?: string
) {
  if (callerId && callerId === userId) {
    throw new Error("You cannot change your own role.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found.");

  // Prevent demoting the last admin
  if (target.systemRole === "admin" && systemRole === "member") {
    const adminCount = await prisma.user.count({
      where: { systemRole: "admin", isActive: true },
    });
    if (adminCount <= 1) {
      throw new Error("Cannot demote the last admin. Promote another user first.");
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: { systemRole },
    select: { id: true, name: true, email: true, systemRole: true, isActive: true },
  });
}

