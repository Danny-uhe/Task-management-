import api from "@/lib/axios";

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string | null;
  position: string | null;
  points: number;
  streak: number | null;
  tasksCompleted: number;
}

export interface GamificationProfile {
  preferences: {
    leaderboardVisible: boolean;
    shareStreak: boolean;
    notifyAchievement: boolean;
  };
  achievements: {
    id: string;
    label: string;
    description: string;
    unlocked: boolean;
  }[];
  stats: {
    points: number;
    streak: number;
    completedTasks: number;
    completionRate: number;
  };
}

export type GamificationPreferences = GamificationProfile['preferences'];

export const leaderboardService = {
  getLeaderboard() {
    return api.get<{ success: boolean; leaderboard: LeaderboardUser[] }>("/leaderboard");
  },
  getMyProfile() {
    return api.get<{ success: boolean } & GamificationProfile>('/leaderboard/me');
  },
  updatePreferences(preferences: Partial<GamificationPreferences>) {
    return api.patch<{ success: boolean; preferences: GamificationPreferences }>(
      '/leaderboard/preferences',
      preferences,
    );
  },
};
