import { Request, Response } from "express";
import { z } from "zod";
import {
  getOrganisationStats,
  getOrgMembers as getOrgMembersService,
  inviteMember as inviteMemberService,
  removeUser as removeUserService,
  activateUser as activateUserService,
  changeUserRole as changeUserRoleService,
} from "./organisation.service.js";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "member"]).optional(),
  systemRole: z.enum(["admin", "member"]).optional(),
});

export async function getOrgStats(_req: Request, res: Response) {
  try {
    const stats = await getOrganisationStats();
    return res.json({
      success: true,
      stats,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function getOrgMembers(_req: Request, res: Response) {
  try {
    const members = await getOrgMembersService();
    return res.json({
      success: true,
      members,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function inviteMember(req: Request, res: Response) {
  try {
    const body = inviteSchema.parse(req.body);
    const systemRole = body.systemRole || body.role || "member";
    const invitation = await inviteMemberService(
      body.email,
      req.user!.userId,
      body.name,
      systemRole
    );

    return res.status(201).json({
      success: true,
      invitation,
      data: invitation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function removeUser(req: Request, res: Response) {
  try {
    const userId = req.params.userId as string;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });
    const user = await removeUserService(userId, req.user?.userId);
    return res.json({ success: true, message: "User deactivated successfully", user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Something went wrong" });
  }
}

export async function activateUser(req: Request, res: Response) {
  try {
    const userId = req.params.userId as string;
    const user = await activateUserService(userId);
    return res.json({ success: true, message: "User re-activated successfully", user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Something went wrong" });
  }
}

export async function changeUserRole(req: Request, res: Response) {
  try {
    const userId = req.params.userId as string;
    const { systemRole } = z.object({ systemRole: z.enum(["admin", "member"]) }).parse(req.body);
    const user = await changeUserRoleService(userId, systemRole, req.user?.userId);
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Something went wrong" });
  }
}

