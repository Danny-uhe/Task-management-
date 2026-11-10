import { Request, Response } from "express";
import {
  getUserActivity,
  getOrgActivity as getOrgActivityService,
} from "./activity.service.js";

export async function getMyActivity(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const activity = await getUserActivity(userId);

    return res.json({
      success: true,
      ...activity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch user activity",
    });
  }
}

export async function getOrgActivity(req: Request, res: Response) {
  try {
    const tasks = await getOrgActivityService();

    return res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch organization activity",
    });
  }
}
