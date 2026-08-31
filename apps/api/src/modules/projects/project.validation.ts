import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3, "Project name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(3, "Project name is required").optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["admin", "member"]).default("member"),
});

export type AddProjectMemberInput = z.infer<
  typeof addProjectMemberSchema
>;