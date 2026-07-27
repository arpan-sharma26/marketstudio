import { z } from "zod";

import { CLIENT_ROLES } from "@/types/roles";
import { emailSchema, uuidSchema } from "@/lib/validation";

export const addMembershipSchema = z.object({
  clientId: uuidSchema,
  email: emailSchema,
  role: z.enum(CLIENT_ROLES),
  locationIds: z.array(uuidSchema).default([]),
});

export const updateMembershipRoleSchema = z.object({
  clientId: uuidSchema,
  membershipId: uuidSchema,
  role: z.enum(CLIENT_ROLES),
});

export const setMembershipActiveSchema = z.object({
  clientId: uuidSchema,
  membershipId: uuidSchema,
  isActive: z.coerce.boolean(),
});

export const setLocationMembershipsSchema = z.object({
  clientId: uuidSchema,
  profileId: uuidSchema,
  locationIds: z.array(uuidSchema),
  role: z.enum(CLIENT_ROLES),
});

export type AddMembershipInput = z.infer<typeof addMembershipSchema>;
