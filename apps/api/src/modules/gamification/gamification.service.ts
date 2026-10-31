import { prisma } from "../../config/prisma.js";

/**
 * Increments user.points by amount
 */
export async function awardPoints(userId: string | null | undefined, amount: number) {
  if (!userId) {
    return null;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      points: {
        increment: amount,
      },
    },
    select: {
      id: true,
      name: true,
      points: true,
      streak: true,
    },
  });
}

/**
 * Returns all users ordered by points desc,
 * select: id, name, avatar, position, points, streak, _count tasks done
 */
export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    orderBy: {
      points: "desc",
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      position: true,
      points: true,
      streak: true,
      _count: {
        select: {
          assignedTasks: {
            where: {
              status: "done",
            },
          },
        },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    position: user.position,
    points: user.points,
    streak: user.streak,
    tasksCompleted: user._count.assignedTasks,
    _count: user._count,
  }));
}
