import { Request, Response } from "express";
import { getLeaderboard as getLeaderboardService } from "./gamification.service.js";

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const leaderboard = await getLeaderboardService();

    return res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch leaderboard",
    });
  }
}
