import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { canAccessLocation } from "@/lib/permissions";
import { loadAuthContext } from "@/lib/auth";
import type { Database } from "@/types/database";

export type LocationRow = Database["public"]["Tables"]["client_locations"]["Row"];
export type BusinessHoursRow =
  Database["public"]["Tables"]["location_business_hours"]["Row"];

export async function listLocations(clientId: string): Promise<LocationRow[]> {
  await requirePermission("location.read", { clientId });
  const ctx = await loadAuthContext();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_locations")
    .select("*")
    .eq("client_id", clientId)
    .order("name", { ascending: true });
  if (error) throw error;

  return (data ?? []).filter((location) =>
    canAccessLocation(ctx, clientId, location.id),
  );
}

export async function getLocation(
  clientId: string,
  locationId: string,
): Promise<LocationRow | null> {
  await requirePermission("location.read", { clientId, locationId });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_locations")
    .select("*")
    .eq("id", locationId)
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listBusinessHours(
  clientId: string,
  locationId: string,
): Promise<BusinessHoursRow[]> {
  await requirePermission("location.read", { clientId, locationId });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("location_business_hours")
    .select("*")
    .eq("client_id", clientId)
    .eq("location_id", locationId)
    .order("day_of_week", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
