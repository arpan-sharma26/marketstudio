import { z } from "zod";

import { emailSchema } from "@/lib/validation";

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export type SignInInput = z.infer<typeof signInSchema>;
