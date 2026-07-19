import { z } from "zod";

/**
 * Shared validation helpers. Feature-specific schemas live beside their feature; put
 * only genuinely shared primitives here.
 */

export const uuidSchema = z.string().uuid("A valid identifier is required.");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

/** Flattens a ZodError into `{ field: [messages] }` for form display. */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}
