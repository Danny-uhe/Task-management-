import { prisma } from "../../config/prisma.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_DAYS = 30;

export async function getUserActivity(userId: string) {
  const now = new Date();
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const monthAgo = new Date(now.getTime() - ACTIVITY_DAYS * DAY_MS);
  const userTasks = {
    OR: [{ assignedToId: userId }, { createdById: userId }],
  };

  const [user, tasks, notifications, projects, completedToday, updatedToday] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      }),
      prisma.task.findMany({
        where: {
          AND: [
            userTasks,
            {
              OR: [
                { createdAt: { gte: monthAgo } },
                { status: "done", updatedAt: { gte: monthAgo } },
              ],
            },
          ],
        },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.notification.findMany({
        where: { userId, createdAt: { gte: monthAgo } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.project.findMany({
        where: { ownerId: userId, createdAt: { gte: monthAgo } },
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.task.count({
        where: {
          ...userTasks,
          status: "done",
          updatedAt: { gte: today },
        },
      }),
      prisma.task.count({
        where: {
          ...userTasks,
          updatedAt: { gte: today },
        },
      }),
    ]);

  const activities = [
    ...tasks.flatMap((task) => {
      const entries: {
        id: string;
        type: string;
        title: string;
        description: string;
        occurredAt: Date;
      }[] = [];
      if (task.createdById === userId && task.createdAt >= monthAgo) {
        entries.push({
          id: `${task.id}-created`,
          type: "task_created",
          title: `Created task: ${task.title}`,
          description: `Added to ${task.project.name}.`,
          occurredAt: task.createdAt,
        });
      }
      if (
        task.status === "done" &&
        task.assignedToId === userId &&
        task.updatedAt >= monthAgo
      ) {
        entries.push({
          id: `${task.id}-completed`,
          type: "task_completed",
          title: `Completed task: ${task.title}`,
          description: `Completed in ${task.project.name}.`,
          occurredAt: task.updatedAt,
        });
      }
      return entries;
    }),
    ...notifications.map((notification) => ({
      id: notification.id,
      type: "notification",
      title: notification.type.replace(/_/g, " ").toLowerCase(),
      description: notification.message,
      occurredAt: notification.createdAt,
    })),
    ...projects.map((project) => ({
      id: `${project.id}-created`,
      type: "project_created",
      title: `Created project: ${project.name}`,
      description: "Created a project.",
      occurredAt: project.createdAt,
    })),
  ].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return {
    stats: {
      completedToday,
      updatedToday,
      points: user?.points ?? 0,
    },
    activities: activities.slice(0, 100),
  };
}

/**
 * Returns recent task updates across all projects for organization admins.
 */
export async function getOrgActivity() {
  return prisma.task.findMany({
    take: 50,
    orderBy: { updatedAt: "desc" },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignedTo: {
        select: { id: true, name: true, email: true, avatar: true, position: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true, position: true },
      },
    },
  });
}
