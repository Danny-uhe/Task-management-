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
export async function getLeaderboard(requesterId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: requesterId },
    select: { organizationId: true },
  });
  const organizationIds = memberships.map(({ organizationId }) => organizationId);

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      organizationMembers: {
        some: { organizationId: { in: organizationIds } },
      },
      OR: [{ leaderboardVisible: true }, { id: requesterId }],
    },
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
      shareStreak: true,
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
    streak: user.shareStreak ? user.streak : null,
    shareStreak: user.shareStreak,
    tasksCompleted: user._count.assignedTasks,
    _count: user._count,
  }));
}

export async function getGamificationProfile(userId: string) {
  const [user, assignedTasks, comments, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        streak: true,
        leaderboardVisible: true,
        shareStreak: true,
        notifyAchievement: true,
      },
    }),
    prisma.task.findMany({
      where: { assignedToId: userId, isArchived: false },
      select: { status: true, updatedAt: true },
    }),
    prisma.comment.count({ where: { userId } }),
    prisma.projectMember.count({ where: { userId } }),
  ]);
  if (!user) throw new Error("User not found");

  const completedTasks = assignedTasks.filter((task) => task.status === "done");
  const taskTotal = assignedTasks.length;
  const completionRate = taskTotal
    ? Math.round((completedTasks.length / taskTotal) * 100)
    : 0;
  const completedByUtcDay = new Map<string, number>();
  for (const task of completedTasks) {
    const day = task.updatedAt.toISOString().slice(0, 10);
    completedByUtcDay.set(day, (completedByUtcDay.get(day) ?? 0) + 1);
  }
  const completedFiveInOneDay = [...completedByUtcDay.values()].some(
    (count) => count >= 5
  );

  return {
    preferences: {
      leaderboardVisible: user.leaderboardVisible,
      shareStreak: user.shareStreak,
      notifyAchievement: user.notifyAchievement,
    },
    achievements: [
      {
        id: "five-day-streak",
        label: "5-Day Streak",
        description: "Reach a five-day activity streak.",
        unlocked: user.streak >= 5,
      },
      {
        id: "task-master",
        label: "Task Master",
        description: "Complete 20 assigned tasks.",
        unlocked: completedTasks.length >= 20,
      },
      {
        id: "project-starter",
        label: "Project Contributor",
        description: "Join your first project.",
        unlocked: projects > 0,
      },
      {
        id: "completion-rate",
        label: "92% Rate",
        description: "Complete at least 92% of your assigned tasks.",
        unlocked: taskTotal > 0 && completionRate >= 92,
      },
      {
        id: "speed-runner",
        label: "Speed Runner",
        description: "Complete five tasks on the same day.",
        unlocked: completedFiveInOneDay,
      },
      {
        id: "team-player",
        label: "Team Player",
        description: "Write 10 task comments.",
        unlocked: comments >= 10,
      },
    ],
    stats: {
      points: user.points,
      streak: user.streak,
      completedTasks: completedTasks.length,
      completionRate,
    },
  };
}

export async function updateGamificationPreferences(
  userId: string,
  preferences: {
    leaderboardVisible?: boolean;
    shareStreak?: boolean;
    notifyAchievement?: boolean;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data: preferences,
    select: {
      leaderboardVisible: true,
      shareStreak: true,
      notifyAchievement: true,
    },
  });
}
