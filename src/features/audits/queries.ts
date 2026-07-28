import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditInput, AuditResult, SavedAudit } from "@/features/audits/types";
import type { Json } from "@/types/database";

/**
 * Persists a generated audit using the service-role client. The `audits` table has RLS
 * enabled with no authenticated policies, so writes only happen through this trusted
 * server path. Prospect audits are not (yet) tied to a client tenant.
 */
export async function saveAudit(
  input: AuditInput,
  result: AuditResult,
): Promise<SavedAudit> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("audits")
    .insert({
      business_name: input.businessName,
      city: input.city,
      website_url: input.websiteUrl,
      gbp_url: input.gbpUrl || null,
      review_count: input.reviewCount ?? null,
      average_rating: input.averageRating ?? null,
      // Competitors are AI-discovered; persist named insights from the result when available.
      competitors:
        result.competitorInsights.length > 0
          ? result.competitorInsights.join(" | ")
          : null,
      notes: input.notes || null,
      visibility_score: result.visibilityScore,
      result: result as unknown as Json,
    })
    .select("id, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to save audit: ${error.message}`);
  }

  return {
    id: data.id,
    createdAt: data.created_at,
  };
}
