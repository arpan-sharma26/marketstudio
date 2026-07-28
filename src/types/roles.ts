/**
 * Controlled role and permission vocabularies for Market Studio.
 * These union types are the single source of truth in application code and must stay in
 * sync with the database CHECK constraints in the migrations.
 */

export const PLATFORM_ROLES = [
  "super_admin",
  "market_studio_admin",
  "account_manager",
  "client_user",
] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const CLIENT_ROLES = [
  "client_admin",
  "location_manager",
  "staff",
  "viewer",
  "market_studio_account_manager",
] as const;
export type ClientRole = (typeof CLIENT_ROLES)[number];

/**
 * Platform roles that grant Market Studio staff access across clients.
 * `account_manager` only gains access to clients they are assigned to (checked separately).
 */
export const PRIVILEGED_PLATFORM_ROLES = [
  "super_admin",
  "market_studio_admin",
] as const;
export type PrivilegedPlatformRole = (typeof PRIVILEGED_PLATFORM_ROLES)[number];

/**
 * Named, action-based permissions. Components must use these via the permission helpers
 * rather than comparing roles directly.
 */
export const PERMISSIONS = [
  "client.read",
  "client.update",
  "client.manage",
  "location.read",
  "location.manage",
  "membership.manage",
  "brand.manage",
  "brand.approve",
  "lead.read",
  "lead.update",
  "lead.assign",
  "content.read",
  "content.create",
  "content.approve",
  "campaign.manage",
  "appointment.manage",
  "report.read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export function isPlatformRole(value: unknown): value is PlatformRole {
  return (
    typeof value === "string" && (PLATFORM_ROLES as readonly string[]).includes(value)
  );
}

export function isClientRole(value: unknown): value is ClientRole {
  return (
    typeof value === "string" && (CLIENT_ROLES as readonly string[]).includes(value)
  );
}
