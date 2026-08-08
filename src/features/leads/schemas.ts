import { z } from "zod";

import {
  CONSENT_STATUSES,
  CONSENT_TYPES,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
} from "./constants";

const optionalUuid = z.string().uuid().optional().or(z.literal(""));
const optionalText = z.string().max(200).optional().or(z.literal(""));

export const createLeadSchema = z
  .object({
    clientId: z.string().uuid(),
    locationId: optionalUuid,
    assignedTo: optionalUuid,
    first_name: optionalText,
    last_name: optionalText,
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    phone: z.string().max(40).optional().or(z.literal("")),
    preferred_contact_method: z
      .enum(["email", "phone", "sms", "any"])
      .optional()
      .or(z.literal("")),
    child_age_months: z.coerce.number().int().min(0).optional().or(z.literal("")),
    age_group: optionalText,
    programId: optionalUuid,
    desired_start_date: z.string().optional().or(z.literal("")),
    schedule_preference: z
      .enum(["full_time", "part_time", "flexible", "unknown"])
      .optional()
      .or(z.literal("")),
    lead_source: z.enum(LEAD_SOURCES).default("manual"),
    status: z.enum(LEAD_STATUSES).default("new"),
    priority: z.enum(LEAD_PRIORITIES).optional().or(z.literal("")),
    consent_follow_up: z.enum(["granted", "denied", ""]).optional(),
    allowDuplicate: z.coerce.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone && !data.first_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a name, email, or phone number.",
        path: ["first_name"],
      });
    }
  });

export const updateLeadSchema = z.object({
  clientId: z.string().uuid(),
  leadId: z.string().uuid(),
  locationId: optionalUuid,
  assignedTo: optionalUuid,
  first_name: optionalText,
  last_name: optionalText,
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  preferred_contact_method: z
    .enum(["email", "phone", "sms", "any"])
    .optional()
    .or(z.literal("")),
  child_age_months: z.coerce.number().int().min(0).optional().or(z.literal("")),
  age_group: optionalText,
  programId: optionalUuid,
  desired_start_date: z.string().optional().or(z.literal("")),
  schedule_preference: z
    .enum(["full_time", "part_time", "flexible", "unknown"])
    .optional()
    .or(z.literal("")),
  lead_source: z.enum(LEAD_SOURCES),
  status: z.enum(LEAD_STATUSES),
  priority: z.enum(LEAD_PRIORITIES).optional().or(z.literal("")),
  next_action_at: z.string().optional().or(z.literal("")),
});

export const updateLeadStatusSchema = z.object({
  clientId: z.string().uuid(),
  leadId: z.string().uuid(),
  status: z.enum(LEAD_STATUSES),
});

export const deleteLeadSchema = z.object({
  clientId: z.string().uuid(),
  leadId: z.string().uuid(),
});

export const addLeadNoteSchema = z.object({
  clientId: z.string().uuid(),
  leadId: z.string().uuid(),
  note: z.string().min(1, "Note is required").max(4000),
  is_pinned: z.coerce.boolean().optional().default(false),
});

export const recordLeadConsentSchema = z.object({
  clientId: z.string().uuid(),
  leadId: z.string().uuid(),
  consent_type: z.enum(CONSENT_TYPES),
  status: z.enum(CONSENT_STATUSES),
  source: z.string().max(120).optional().or(z.literal("")),
});
