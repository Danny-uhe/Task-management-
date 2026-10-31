import { prisma } from "../../config/prisma.js";

/**
 * Returns recent tasks created/completed by user (last 20),
 * and recent notifications for the user
 */
export async function getUserActivity(userId: string) {
  const [tasks, notifications] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [
          { createdById: userId },
          { assignedToId: userId, status: "done" },
        ],
      },
      take: 20,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
            position: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
            position: true,
          },
        },
      },
    }),
    prisma.notification.findMany({
      where: {
        userId,
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    tasks,
    notifications,
  };
}

/**
 * Returns last 50 task updates across all projects
 * (join with user name, project name)
 */
export async function getOrgActivity() {
  return prisma.task.findMany({
    take: 50,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },
    },
  });
}
