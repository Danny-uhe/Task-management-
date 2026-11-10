import { Request, Response } from "express";
import {
  getLeaderboard as getLeaderboardService,
  getGamificationProfile,
  updateGamificationPreferences,
} from "./gamification.service.js";

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const leaderboard = await getLeaderboardService(req.user!.userId);

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

export async function getMyGamificationProfile(req: Request, res: Response) {
  try {
    const profile = await getGamificationProfile(req.user!.userId);
    return res.json({ success: true, ...profile });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch achievements",
    });
  }
}

export async function updateMyGamificationPreferences(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>;
  const allowedFields = ["leaderboardVisible", "shareStreak", "notifyAchievement"];
  const entries = Object.entries(body);
  if (
    entries.length === 0 ||
    entries.some(
      ([key, value]) =>
        !allowedFields.includes(key) || typeof value !== "boolean"
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one valid boolean preference",
    });
  }

  try {
    const preferences = await updateGamificationPreferences(
      req.user!.userId,
      body as {
        leaderboardVisible?: boolean;
        shareStreak?: boolean;
        notifyAchievement?: boolean;
      }
    );
    return res.json({ success: true, preferences });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update preferences",
    });
  }
}
