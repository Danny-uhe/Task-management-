import { z } from "zod";

export const updateProfileSchema = z.object({
  bio: z.string().max(300).optional(),
  position: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>;