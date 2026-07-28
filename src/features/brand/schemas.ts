import { z } from "zod";

export const brandStatuses = ["draft", "review", "approved", "archived"] as const;
export type BrandStatus = (typeof brandStatuses)[number];

export const faqStatuses = ["draft", "review", "approved", "archived"] as const;
export type FaqStatus = (typeof faqStatuses)[number];

export const programStatuses = ["draft", "active", "archived"] as const;
export type ProgramStatus = (typeof programStatuses)[number];

const hexColourSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, "Use a hex colour like #0A2F3D")
  .optional()
  .or(z.literal(""));

/** Split textarea lines into a clean string array. */
export function linesToList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function listToLines(values: unknown): string {
  if (!Array.isArray(values)) return "";
  return values
    .filter((item): item is string => typeof item === "string")
    .join("\n");
}

export const upsertBrandProfileSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1, "Brand name is required").max(120),
  business_summary: z.string().max(4000).optional().or(z.literal("")),
  mission_statement: z.string().max(2000).optional().or(z.literal("")),
  brand_voice: z.string().max(2000).optional().or(z.literal("")),
  primary_colour: hexColourSchema,
  secondary_colour: hexColourSchema,
  accent_colour: hexColourSchema,
  logo_url: z.string().url("Enter a valid logo URL").optional().or(z.literal("")),
  target_audience: z.string().max(4000).optional().or(z.literal("")),
  unique_selling_points: z.string().max(4000).optional().or(z.literal("")),
  content_pillars: z.string().max(4000).optional().or(z.literal("")),
  approved_claims: z.string().max(4000).optional().or(z.literal("")),
  restricted_claims: z.string().max(4000).optional().or(z.literal("")),
  approved_ctas: z.string().max(4000).optional().or(z.literal("")),
  status: z.enum(brandStatuses).default("draft"),
});

export const setBrandStatusSchema = z.object({
  clientId: z.string().uuid(),
  brandProfileId: z.string().uuid(),
  status: z.enum(brandStatuses),
});

export const upsertFaqSchema = z.object({
  clientId: z.string().uuid(),
  faqId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional().or(z.literal("")),
  question: z.string().min(1, "Question is required").max(500),
  answer: z.string().min(1, "Answer is required").max(4000),
  category: z.string().max(120).optional().or(z.literal("")),
  is_ai_usable: z.coerce.boolean().default(false),
  status: z.enum(faqStatuses).default("draft"),
});

export const deleteFaqSchema = z.object({
  clientId: z.string().uuid(),
  faqId: z.string().uuid(),
});

export const upsertProgramSchema = z.object({
  clientId: z.string().uuid(),
  programId: z.string().uuid().optional(),
  name: z.string().min(1, "Program name is required").max(120),
  description: z.string().max(4000).optional().or(z.literal("")),
  minimum_age_months: z.coerce.number().int().min(0).optional().or(z.literal("")),
  maximum_age_months: z.coerce.number().int().min(0).optional().or(z.literal("")),
  status: z.enum(programStatuses).default("draft"),
  locationIds: z.array(z.string().uuid()).default([]),
});

export const deleteProgramSchema = z.object({
  clientId: z.string().uuid(),
  programId: z.string().uuid(),
});

export const setLocationProgramSchema = z.object({
  clientId: z.string().uuid(),
  locationId: z.string().uuid(),
  programId: z.string().uuid(),
  is_available: z.coerce.boolean().default(true),
  accepting_registrations: z.coerce.boolean().default(false),
  availability_notes: z.string().max(1000).optional().or(z.literal("")),
});
