import "server-only";

import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isClientRole, type ClientRole } from "@/types/roles";

export interface MembershipListItem {
  id: string;
  client_id: string;
  profile_id: string;
  role: ClientRole;
  is_active: boolean;
  email: string | null;
  full_name: string | null;
  location_ids: string[];
}

export async function listMemberships(clientId: string): Promise<MembershipListItem[]> {
  await requirePermission("membership.manage", { clientId });

  const supabase = await createClient();
  const { data: memberships, error } = await supabase
    .from("client_memberships")
    .select("id, client_id, profile_id, role, is_active")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const profileIds = [...new Set((memberships ?? []).map((m) => m.profile_id))];
  const admin = createAdminClient();

  const profilesById = new Map<string, { email: string | null; full_name: string | null }>();
  if (profileIds.length > 0) {
    const { data: profiles, error: profileError } = await admin
      .from("profiles")
      .select("id, email, full_name")
      .in("id", profileIds);
    if (profileError) throw profileError;
    for (const profile of profiles ?? []) {
      profilesById.set(profile.id, {
        email: profile.email,
        full_name: profile.full_name,
      });
    }
  }

  const { data: locationMemberships, error: locationError } = await supabase
    .from("location_memberships")
    .select("profile_id, location_id")
    .eq("client_id", clientId);
  if (locationError) throw locationError;

  const locationsByProfile = new Map<string, string[]>();
  for (const row of locationMemberships ?? []) {
    const existing = locationsByProfile.get(row.profile_id) ?? [];
    existing.push(row.location_id);
    locationsByProfile.set(row.profile_id, existing);
  }

  return (memberships ?? []).flatMap((membership) => {
    if (!isClientRole(membership.role)) return [];
    const profile = profilesById.get(membership.profile_id);
    return [
      {
        id: membership.id,
        client_id: membership.client_id,
        profile_id: membership.profile_id,
        role: membership.role,
        is_active: membership.is_active,
        email: profile?.email ?? null,
        full_name: profile?.full_name ?? null,
        location_ids: locationsByProfile.get(membership.profile_id) ?? [],
      },
    ];
  });
}
