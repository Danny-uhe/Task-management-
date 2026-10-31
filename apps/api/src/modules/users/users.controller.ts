import { Request, Response } from "express";
import { getAllUsers, updateProfile, changePassword as changePasswordService } from "./users.service.js";
import { updateProfileSchema, changePasswordSchema } from "./users.validation.js";

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

export async function changePassword(
  req: Request,
  res: Response
) {
  try {
    const body = changePasswordSchema.parse(req.body);

    const result = await changePasswordService(
      req.user!.userId,
      body
    );

    return res.json({
      success: true,
      message: result.message,
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