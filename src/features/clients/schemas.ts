import { z } from "zod";

import { CLIENT_STATUSES } from "@/types/clients";
import { uuidSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";

const optionalText = z.string().trim().optional().or(z.literal(""));

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Enter a valid email address.",
  });

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || z.string().url().safeParse(value).success, {
    message: "Enter a valid URL.",
  });

export const createClientSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(200),
  legal_name: optionalText,
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.")
    .optional()
    .or(z.literal("")),
  website_url: optionalUrl,
  primary_email: optionalEmail,
  primary_phone: optionalText,
  timezone: z.string().trim().min(1).default("America/Edmonton"),
  status: z.enum(CLIENT_STATUSES).default("prospect"),
});

export const updateClientSchema = z.object({
  clientId: uuidSchema,
  name: z.string().trim().min(2, "Name is required.").max(200).optional(),
  legal_name: optionalText,
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.")
    .optional(),
  website_url: optionalUrl,
  primary_email: optionalEmail,
  primary_phone: optionalText,
  timezone: z.string().trim().min(1).optional(),
  status: z.enum(CLIENT_STATUSES).optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export function resolveClientSlug(name: string, slug?: string): string {
  const value = slug?.trim() ? slug.trim() : slugify(name);
  if (!value) {
    throw new Error("A valid slug could not be generated from the name.");
  }
  return value;
}
