import type { ClientRole, Permission, PlatformRole } from "@/types/roles";
import { PRIVILEGED_PLATFORM_ROLES } from "@/types/roles";

import type {
  AccessTarget,
  AuthContext,
  ClientMembershipSummary,
} from "./types";

/**
 * Pure authorization primitives. These operate on a resolved `AuthContext` and contain no
 * I/O, so they are exhaustively unit-testable. Server wrappers in `lib/auth` load the
 * context and call these. Never derive access from a browser-provided client_id.
 */

/** Permissions granted to each client role. */
const CLIENT_ROLE_PERMISSIONS: Record<ClientRole, readonly Permission[]> = {
  client_admin: [
    "client.read",
    "client.update",
    "location.read",
    "location.manage",
    "membership.manage",
    "brand.manage",
    "brand.approve",
    "onboarding.manage",
    "lead.read",
    "lead.update",
    "lead.assign",
    "content.read",
    "content.create",
    "content.approve",
    "campaign.manage",
    "appointment.manage",
    "report.read",
  ],
  market_studio_account_manager: [
    "client.read",
    "client.update",
    "location.read",
    "location.manage",
    "membership.manage",
    "brand.manage",
    "brand.approve",
    "onboarding.manage",
    "lead.read",
    "lead.update",
    "lead.assign",
    "content.read",
    "content.create",
    "content.approve",
    "campaign.manage",
    "appointment.manage",
    "report.read",
  ],
  location_manager: [
    "client.read",
    "location.read",
    "lead.read",
    "lead.update",
    "lead.assign",
    "content.read",
    "content.create",
    "appointment.manage",
    "report.read",
  ],
  staff: [
    "client.read",
    "location.read",
    "lead.read",
    "lead.update",
    "content.read",
    "appointment.manage",
  ],
  viewer: ["client.read", "location.read", "lead.read", "content.read", "report.read"],
};

/** Permissions for a platform account_manager on clients they are assigned to. */
const ASSIGNED_ACCOUNT_MANAGER_PERMISSIONS: readonly Permission[] =
  CLIENT_ROLE_PERMISSIONS.market_studio_account_manager;

export function hasPlatformRole(ctx: AuthContext, role: PlatformRole): boolean {
  return ctx.profile.is_active && ctx.profile.platform_role === role;
}

/** super_admin or market_studio_admin — full cross-client access. */
export function isPlatformAdmin(ctx: AuthContext): boolean {
  return (
    ctx.profile.is_active &&
    (PRIVILEGED_PLATFORM_ROLES as readonly string[]).includes(ctx.profile.platform_role)
  );
}

export function isAssignedAccountManager(ctx: AuthContext, clientId: string): boolean {
  return (
    ctx.profile.is_active &&
    ctx.profile.platform_role === "account_manager" &&
    ctx.assignedClientIds.includes(clientId)
  );
}

export function getClientMembership(
  ctx: AuthContext,
  clientId: string,
): ClientMembershipSummary | null {
  return (
    ctx.memberships.find((m) => m.client_id === clientId && m.is_active) ?? null
  );
}

/** Whether the user may access the given client at all. */
export function hasClientAccess(ctx: AuthContext, clientId: string): boolean {
  if (!ctx.profile.is_active) return false;
  if (isPlatformAdmin(ctx)) return true;
  if (isAssignedAccountManager(ctx, clientId)) return true;
  return getClientMembership(ctx, clientId) !== null;
}

export function getClientRole(ctx: AuthContext, clientId: string): ClientRole | null {
  return getClientMembership(ctx, clientId)?.role ?? null;
}

export function hasClientRole(
  ctx: AuthContext,
  clientId: string,
  roles: readonly ClientRole[],
): boolean {
  const role = getClientRole(ctx, clientId);
  return role !== null && roles.includes(role);
}

/**
 * Whether the user may access a specific location. Location-restricted users (those with
 * any location membership for the client) are limited to their assigned locations.
 * Client-wide members and privileged platform users can access all locations.
 */
export function canAccessLocation(
  ctx: AuthContext,
  clientId: string,
  locationId: string,
): boolean {
  if (!hasClientAccess(ctx, clientId)) return false;
  if (isPlatformAdmin(ctx)) return true;
  if (isAssignedAccountManager(ctx, clientId)) return true;

  const locationMemberships = ctx.locationMemberships.filter(
    (m) => m.client_id === clientId,
  );
  if (locationMemberships.length === 0) {
    // No location restriction: any client member can access all locations of the client.
    return getClientMembership(ctx, clientId) !== null;
  }
  return locationMemberships.some((m) => m.location_id === locationId);
}

/** Resolves the effective permission set for a user on a specific client. */
function effectivePermissions(
  ctx: AuthContext,
  clientId: string,
): readonly Permission[] {
  const membership = getClientMembership(ctx, clientId);
  if (membership) return CLIENT_ROLE_PERMISSIONS[membership.role];
  if (isAssignedAccountManager(ctx, clientId)) {
    return ASSIGNED_ACCOUNT_MANAGER_PERMISSIONS;
  }
  return [];
}

/**
 * Named-permission check. Platform admins are granted every permission. Otherwise the
 * user must have client access, the permission in their effective set, and — when a
 * location is specified — access to that location.
 */
export function can(
  ctx: AuthContext,
  permission: Permission,
  target: AccessTarget,
): boolean {
  if (!ctx.profile.is_active) return false;
  if (isPlatformAdmin(ctx)) return true;
  if (!hasClientAccess(ctx, target.clientId)) return false;

  const permissions = effectivePermissions(ctx, target.clientId);
  if (!permissions.includes(permission)) return false;

  if (target.locationId) {
    return canAccessLocation(ctx, target.clientId, target.locationId);
  }
  return true;
}

/** Throws-free assertion helper returning whether two client ids match. */
export function isSameClient(expected: string, actual: string): boolean {
  return expected === actual && expected.length > 0;
}
