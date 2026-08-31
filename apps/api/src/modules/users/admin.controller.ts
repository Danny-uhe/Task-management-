import { Request, Response } from "express";
import {
  getAllOrgUsers,
  updateUserSystemRole,
  deactivateUser,
  activateUser,
} from "./admin.service.js";

export async function listUsers(
  req: Request,
  res: Response
) {
  try {
    const users = await getAllOrgUsers();

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export async function updateRole(
  req: Request,
  res: Response
) {
  try {
    const { systemRole } = req.body;

    if (!["admin", "member"].includes(systemRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin' or 'member'.",
      });
    }

    const user = await updateUserSystemRole(
      req.user!.userId,   // callerId — service checks self-change + last-admin
      req.params.id as string,
      systemRole
    );

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function deactivate(
  req: Request,
  res: Response
) {
  try {
    const user = await deactivateUser(
      req.user!.userId,   // callerId — service handles self-check + last-admin guard
      req.params.id as string
    );
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}


export async function activate(
  req: Request,
  res: Response
) {
  try {
    const user = await activateUser(req.params.id as string);

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