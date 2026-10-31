import api from "@/lib/axios";

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string | null;
  position: string | null;
  points: number;
  streak: number;
  tasksCompleted: number;
}

export const leaderboardService = {
  getLeaderboard() {
    return api.get<{ success: boolean; leaderboard: LeaderboardUser[] }>("/leaderboard");
  },
};
