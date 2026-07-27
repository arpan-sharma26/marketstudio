import { z } from "zod";

import { HOURS_TYPES, LOCATION_STATUSES } from "@/types/clients";
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

export const createLocationSchema = z.object({
  clientId: uuidSchema,
  name: z.string().trim().min(2, "Name is required.").max(200),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.")
    .optional()
    .or(z.literal("")),
  internal_name: optionalText,
  address_line_1: z.string().trim().min(1, "Address is required.").max(200),
  address_line_2: optionalText,
  city: z.string().trim().min(1, "City is required.").max(100),
  province_code: z
    .string()
    .trim()
    .length(2, "Use a 2-letter province code.")
    .transform((value) => value.toUpperCase()),
  postal_code: z.string().trim().min(3, "Postal code is required.").max(12),
  phone: optionalText,
  email: optionalEmail,
  website_url: optionalUrl,
  timezone: z.string().trim().min(1).default("America/Edmonton"),
  status: z.enum(LOCATION_STATUSES).default("planned"),
  accepting_registrations: z.boolean().default(false),
  tour_booking_enabled: z.boolean().default(false),
});

export const updateLocationSchema = z.object({
  clientId: uuidSchema,
  locationId: uuidSchema,
  name: z.string().trim().min(2).max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.")
    .optional(),
  internal_name: optionalText,
  address_line_1: z.string().trim().min(1).max(200).optional(),
  address_line_2: optionalText,
  city: z.string().trim().min(1).max(100).optional(),
  province_code: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase())
    .optional(),
  postal_code: z.string().trim().min(3).max(12).optional(),
  phone: optionalText,
  email: optionalEmail,
  website_url: optionalUrl,
  timezone: z.string().trim().min(1).optional(),
  status: z.enum(LOCATION_STATUSES).optional(),
  accepting_registrations: z.boolean().optional(),
  tour_booking_enabled: z.boolean().optional(),
});

export const businessHoursDaySchema = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  hours_type: z.enum(HOURS_TYPES).default("operating"),
  is_closed: z.boolean().default(false),
  open_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:MM format.")
    .optional()
    .or(z.literal("")),
  close_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:MM format.")
    .optional()
    .or(z.literal("")),
});

export const saveBusinessHoursSchema = z.object({
  clientId: uuidSchema,
  locationId: uuidSchema,
  hours_type: z.enum(HOURS_TYPES).default("operating"),
  days: z.array(businessHoursDaySchema).length(7),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type SaveBusinessHoursInput = z.infer<typeof saveBusinessHoursSchema>;

export function resolveLocationSlug(name: string, slug?: string): string {
  const value = slug?.trim() ? slug.trim() : slugify(name);
  if (!value) {
    throw new Error("A valid slug could not be generated from the name.");
  }
  return value;
}
