import { Request, Response } from "express";
import { z } from "zod";
import {
  getCurrentUser,
  refreshAccessToken,
  loginUser,
  logoutUser,
  logoutAllSessions,
  requestPasswordReset,
  resetPassword,
} from "./auth.service.js";
import {
  refreshSchema,
  loginSchema,
  logoutSchema,
} from "./auth.validation.js";

export async function login(req: Request, res: Response) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function me(req: Request, res: Response) {
  const user = await getCurrentUser(req.user!.userId);
  res.json({ success: true, user });
}

export async function refresh(req: Request, res: Response) {
  try {
    const data = refreshSchema.parse(req.body);
    const result = await refreshAccessToken(data);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const data = logoutSchema.parse(req.body);
    const result = await logoutUser(data);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

// ── NEW ───────────────────────────────────────────────────────────────────────

export async function logoutAll(req: Request, res: Response) {
  try {
    const result = await logoutAllSessions(req.user!.userId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = z.object({
      email: z.string().email("Invalid email address"),
    }).parse(req.body);

    const result = await requestPasswordReset(email);
    // Always 200 — never reveal if the email exists (prevents enumeration)
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { token, newPassword } = z.object({
      token:       z.string().min(1, "Token is required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }).parse(req.body);

    const result = await resetPassword(token, newPassword);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}