import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Task title is required"),
  description: z.string().optional(),

  status: z
    .enum(["todo", "in_progress", "in_review", "done"])
    .default("todo"),

  priority: z
    .enum(["low", "medium", "high"])
    .default("medium"),

  dueDate: z.string()
    .transform((v) => {
      // Accept "YYYY-MM-DD" from date inputs — convert to ISO
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v).toISOString();
      return v;
    })
    .pipe(z.string().datetime())
    .optional(),

  points: z.number().int().min(0).default(0),

  assignedToId: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(3, "Task title is required").optional(),

  description: z.string().optional(),

  status: z
    .enum(["todo", "in_progress", "in_review", "done"])
    .optional(),

  priority: z
    .enum(["low", "medium", "high"])
    .optional(),

  dueDate: z.string()
    .transform((v) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v).toISOString();
      return v;
    })
    .pipe(z.string().datetime())
    .nullable()
    .optional(),

  points: z.number().int().min(0).optional(),

  assignedToId: z.string().nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;