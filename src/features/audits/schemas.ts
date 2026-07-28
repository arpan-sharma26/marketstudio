import { z } from "zod";

export const auditInputSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  websiteUrl: z.string().url("Enter a valid website URL"),
  gbpUrl: z.string().url("Enter a valid GBP URL").optional().or(z.literal("")),
  reviewCount: z.number().int().min(0).optional(),
  averageRating: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
});

export type AuditInputSchema = z.infer<typeof auditInputSchema>;
