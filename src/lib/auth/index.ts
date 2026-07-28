import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ForbiddenError } from "@/lib/errors";
import {
  can,
  canAccessLocation,
  hasClientAccess,
  isSameClient,
} from "@/lib/permissions/access";
import type { AuthContext, ProfileSummary } from "@/lib/permissions/types";
import type { Database } from "@/types/database";
import { isClientRole, isPlatformRole, type Permission } from "@/types/roles";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Server-side authorization surface. All functions resolve access from the database using
 * the authenticated user's identity. Browser-provided client ids are never trusted.
 */

/** Returns the authenticated user's profile row, or null when unauthenticated. */
export const getAuthenticatedProfile = cache(async (): Promise<ProfileRow | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile ?? null;
});

/** Requires an authenticated, active profile. Redirects to sign-in otherwise. */
export async function requireProfile(): Promise<ProfileRow> {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.is_active) redirect("/unauthorized");
  return profile;
}

/**
 * Loads the full authorization context (memberships, location memberships, assigned
 * clients) for the authenticated user. Returns null when unauthenticated.
 * Cached per request so layout + page + query helpers do not re-hit Auth/DB.
 */
export const loadAuthContext = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: memberships }, { data: locationMemberships }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("client_memberships")
        .select("client_id, role, is_active")
        .eq("profile_id", user.id)
        .eq("is_active", true),
      supabase
        .from("location_memberships")
        .select("client_id, location_id, role")
        .eq("profile_id", user.id),
    ]);

  if (!profile) return null;
  if (!isPlatformRole(profile.platform_role)) return null;

  let assignedClientIds: string[] = [];
  if (profile.platform_role === "account_manager") {
    const { data: assigned } = await supabase
      .from("clients")
      .select("id")
      .eq("assigned_account_manager_id", user.id);
    assignedClientIds = (assigned ?? []).map((row) => row.id);
  }

  const profileSummary: ProfileSummary = {
    id: profile.id,
    platform_role: profile.platform_role,
    is_active: profile.is_active,
  };

  return {
    profile: profileSummary,
    memberships: (memberships ?? []).flatMap((membership) =>
      isClientRole(membership.role)
        ? [
            {
              client_id: membership.client_id,
              role: membership.role,
              is_active: membership.is_active,
            },
          ]
        : [],
    ),
    locationMemberships: (locationMemberships ?? []).flatMap((membership) =>
      isClientRole(membership.role)
        ? [
            {
              client_id: membership.client_id,
              location_id: membership.location_id,
              role: membership.role,
            },
          ]
        : [],
    ),
    assignedClientIds,
  };
});

/** Requires an authorization context; redirects to sign-in when unauthenticated. */
export async function requireAuthContext(): Promise<AuthContext> {
  const ctx = await loadAuthContext();
  if (!ctx) redirect("/sign-in");
  if (!ctx.profile.is_active) redirect("/unauthorized");
  return ctx;
}

/** Requires that the user can access the given client. */
export async function requireClientAccess(clientId: string): Promise<AuthContext> {
  const ctx = await requireAuthContext();
  if (!hasClientAccess(ctx, clientId)) {
    throw new ForbiddenError();
  }
  return ctx;
}

/** Requires that the user can access the given location within a client. */
export async function requireLocationAccess(
  clientId: string,
  locationId: string,
): Promise<AuthContext> {
  const ctx = await requireAuthContext();
  if (!canAccessLocation(ctx, clientId, locationId)) {
    throw new ForbiddenError();
  }
  return ctx;
}

/** Requires that the user holds a named permission for the target client/location. */
export async function requirePermission(
  permission: Permission,
  target: { clientId: string; locationId?: string },
): Promise<AuthContext> {
  const ctx = await requireAuthContext();
  if (!can(ctx, permission, target)) {
    throw new ForbiddenError();
  }
  return ctx;
}

/**
 * Guards against cross-client access. Throws when a record's client id does not match the
 * authorized client id. Use before touching any record referenced by a request.
 */
export function assertSameClient(expectedClientId: string, actualClientId: string): void {
  if (!isSameClient(expectedClientId, actualClientId)) {
    throw new ForbiddenError("Cross-client access is not permitted.");
  }
}
