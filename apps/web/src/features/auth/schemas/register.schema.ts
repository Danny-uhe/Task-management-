import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters"),

  email: z
    .string()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  agree: z.boolean().refine((value) => value === true, {
    message: "You must accept the Terms & Privacy Policy",
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;