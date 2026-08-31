import { Request, Response } from "express";
import { z } from "zod";
import {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  listInvitations,
  cancelInvitation,
  resendInvitation,
} from "./invitation.service.js";

const createSchema = z.object({
  email:      z.string().email("Invalid email"),
  name:       z.string().min(2, "Name is too short"),
  systemRole: z.enum(["admin", "member"]).default("member"),
  projectId:  z.string().optional(),
  role:       z.enum(["owner", "admin", "member"]).default("member"),
});

const acceptSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /api/invitations  — admin only
export async function create(req: Request, res: Response) {
  try {
    const body = createSchema.parse(req.body);
    const invitation = await createInvitation(
      req.user!.userId,
      body.email,
      body.name,
      body.systemRole,
      body.projectId,
      body.role
    );
    return res.status(201).json({ success: true, invitation });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

// GET /api/invitations/:token  — public
export async function getByToken(req: Request, res: Response) {
  try {
    const invitation = await getInvitationByToken(String(req.params.token));
    return res.json({ success: true, invitation });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

// POST /api/invitations/:token/accept  — public
export async function accept(req: Request, res: Response) {
  try {
    const { password } = acceptSchema.parse(req.body);
    const result = await acceptInvitation(String(req.params.token), password);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

// GET /api/invitations  — admin only
export async function list(req: Request, res: Response) {
  try {
    const invitations = await listInvitations();
    return res.json({ success: true, invitations });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

// PATCH /api/invitations/:id/cancel  — admin only
export async function cancel(req: Request, res: Response) {
  try {
    const invitation = await cancelInvitation(String(req.params.id));
    return res.json({ success: true, invitation });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

// POST /api/invitations/:id/resend  — admin only
export async function resend(req: Request, res: Response) {
  try {
    const invitation = await resendInvitation(String(req.params.id));
    return res.json({ success: true, invitation });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}