import "server-only";

import { listClients } from "@/features/clients/queries";
import { loadAuthContext } from "@/lib/auth";
import { canAccessLocation } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  AuditClientOption,
  AuditInput,
  AuditResult,
  SavedAudit,
} from "@/features/audits/types";
import type { Json } from "@/types/database";

/**
 * Clients (and their locations) the authenticated user may audit, so the audit form can be
 * pre-filled from existing records instead of retyping prospect details.
 */
export async function listAuditClientOptions(): Promise<AuditClientOption[]> {
  const ctx = await loadAuthContext();
  if (!ctx) return [];

  const clients = await listClients();
  if (clients.length === 0) return [];

  const supabase = await createClient();
  const { data: locations, error } = await supabase
    .from("client_locations")
    .select(
      "id, client_id, name, city, province_code, country_code, website_url, google_business_profile_url",
    )
    .in(
      "client_id",
      clients.map((client) => client.id),
    )
    .order("name", { ascending: true });
  if (error) throw error;

  const accessible = (locations ?? []).filter((location) =>
    canAccessLocation(ctx, location.client_id, location.id),
  );

  return clients.map((client) => ({
    id: client.id,
    name: client.name,
    countryCode: client.country_code,
    websiteUrl: client.website_url,
    locations: accessible
      .filter((location) => location.client_id === client.id)
      .map((location) => ({
        id: location.id,
        name: location.name,
        city: location.city,
        provinceCode: location.province_code,
        countryCode: location.country_code,
        websiteUrl: location.website_url,
        gbpUrl: location.google_business_profile_url,
      })),
  }));
}

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
