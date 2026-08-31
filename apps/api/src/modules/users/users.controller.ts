import { Request, Response } from "express";
import { getAllUsers, updateProfile } from "./users.service.js";
import { updateProfileSchema } from "./users.validation.js";

export async function getUsers(
  req: Request,
  res: Response
) {
  const users = await getAllUsers();

  return res.json({
    success: true,
    users,
  });
}

export async function updateMe(
  req: Request,
  res: Response
) {
  try {
    const body = updateProfileSchema.parse(req.body);

    const user = await updateProfile(
      req.user!.userId,
      body
    );

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
}