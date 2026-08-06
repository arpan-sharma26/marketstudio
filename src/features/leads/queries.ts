import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, loadAuthContext } from "@/lib/auth";
import { canAccessLocation } from "@/lib/permissions";
import type { Database } from "@/types/database";
import { normalizeEmail, normalizePhone } from "./constants";

export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
export type LeadNoteRow = Database["public"]["Tables"]["lead_notes"]["Row"];
export type LeadActivityRow =
  Database["public"]["Tables"]["lead_activities"]["Row"];
export type LeadConsentRow =
  Database["public"]["Tables"]["lead_consents"]["Row"];

export interface ListLeadsOptions {
  status?: string;
  locationId?: string;
  q?: string;
}

export async function listLeads(
  clientId: string,
  options: ListLeadsOptions = {},
): Promise<LeadRow[]> {
  await requirePermission("lead.read", { clientId });
  const ctx = await loadAuthContext();
  if (!ctx) return [];

  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  if (options.status) query = query.eq("status", options.status);
  if (options.locationId) query = query.eq("location_id", options.locationId);

  const { data, error } = await query;
  if (error) throw error;

  let leads = data ?? [];
  leads = leads.filter(
    (lead) =>
      !lead.location_id || canAccessLocation(ctx, clientId, lead.location_id),
  );

  const q = options.q?.trim().toLowerCase();
  if (q) {
    leads = leads.filter((lead) => {
      const haystack = [
        lead.first_name,
        lead.last_name,
        lead.email,
        lead.phone,
        lead.lead_source,
        lead.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return leads;
}

export async function getLead(
  clientId: string,
  leadId: string,
): Promise<LeadRow | null> {
  await requirePermission("lead.read", { clientId });
  const ctx = await loadAuthContext();
  if (!ctx) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("client_id", clientId)
    .eq("id", leadId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (data.location_id && !canAccessLocation(ctx, clientId, data.location_id)) {
    return null;
  }
  return data;
}

export async function findDuplicateLeads(
  clientId: string,
  input: { email?: string | null; phone?: string | null; excludeLeadId?: string },
): Promise<LeadRow[]> {
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  if (!email && !phone) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("client_id", clientId)
    .neq("status", "closed");
  if (error) throw error;

  return (data ?? []).filter((lead) => {
    if (input.excludeLeadId && lead.id === input.excludeLeadId) return false;
    if (email && lead.normalized_email === email) return true;
    if (phone && lead.normalized_phone === phone) return true;
    return false;
  });
}

export async function listLeadNotes(
  clientId: string,
  leadId: string,
): Promise<LeadNoteRow[]> {
  await requirePermission("lead.read", { clientId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("client_id", clientId)
    .eq("lead_id", leadId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listLeadActivities(
  clientId: string,
  leadId: string,
): Promise<LeadActivityRow[]> {
  await requirePermission("lead.read", { clientId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("client_id", clientId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function listLeadConsents(
  clientId: string,
  leadId: string,
): Promise<LeadConsentRow[]> {
  await requirePermission("lead.read", { clientId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_consents")
    .select("*")
    .eq("client_id", clientId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAssignableMembers(
  clientId: string,
): Promise<Array<{ profile_id: string; label: string }>> {
  await requirePermission("lead.read", { clientId });
  const supabase = await createClient();
  const { data: memberships, error } = await supabase
    .from("client_memberships")
    .select("profile_id")
    .eq("client_id", clientId)
    .eq("is_active", true);
  if (error) throw error;

  const ids = [...new Set((memberships ?? []).map((m) => m.profile_id))];
  if (ids.length === 0) return [];

  const admin = createAdminClient();
  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", ids);
  if (profileError) throw profileError;

  return (profiles ?? []).map((profile) => ({
    profile_id: profile.id,
    label: profile.full_name || profile.email || profile.id,
  }));
}
