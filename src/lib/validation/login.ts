import { z } from "zod";

/** Login form shape. Field-level messages stay vague on purpose (see loginAction). */
export const loginSchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(200),
  next: z.string().max(2048).optional(),
});
