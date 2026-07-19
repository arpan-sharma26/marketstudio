import type { ClientRole, PlatformRole } from "@/types/roles";

/**
 * The minimal, resolved view of an authenticated user used for authorization decisions.
 * It is assembled server-side from the database (never from browser-provided values).
 */

export interface ProfileSummary {
  id: string;
  platform_role: PlatformRole;
  is_active: boolean;
}

export interface ClientMembershipSummary {
  client_id: string;
  role: ClientRole;
  is_active: boolean;
}

export interface LocationMembershipSummary {
  client_id: string;
  location_id: string;
  role: ClientRole;
}

export interface AuthContext {
  profile: ProfileSummary;
  /** Active client memberships for this profile. */
  memberships: ClientMembershipSummary[];
  /** Location-level restrictions for this profile. */
  locationMemberships: LocationMembershipSummary[];
  /** Client ids where this profile is the assigned Market Studio account manager. */
  assignedClientIds: string[];
}

export interface AccessTarget {
  clientId: string;
  locationId?: string;
}
