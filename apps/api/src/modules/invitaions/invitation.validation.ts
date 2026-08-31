import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z.email("Invalid email"),

  name: z.string().min(2, "Name is too short"),

  systemRole: z
    .enum(["admin", "member"])
    .default("member"),

  projectId: z.string().optional(),

  role: z
    .enum(["owner", "admin", "member"])
    .default("member"),
});

export const acceptInvitationSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});