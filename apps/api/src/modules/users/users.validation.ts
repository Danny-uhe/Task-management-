import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100).optional(),
  email: z.string().email("Invalid email").optional(),
  bio: z.string().max(300).optional(),
  position: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>;