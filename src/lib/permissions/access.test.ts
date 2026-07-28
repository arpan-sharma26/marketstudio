import { describe, expect, it } from "vitest";

import {
  can,
  canAccessLocation,
  getClientRole,
  hasClientAccess,
  hasClientRole,
  isPlatformAdmin,
} from "./access";
import type { AuthContext } from "./types";

const CLIENT_A = "11111111-1111-1111-1111-111111111111";
const CLIENT_B = "22222222-2222-2222-2222-222222222222";
const LOCATION_1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const LOCATION_2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

function baseProfile(overrides: Partial<AuthContext["profile"]> = {}) {
  return {
    id: "profile-1",
    platform_role: "client_user" as const,
    is_active: true,
    ...overrides,
  };
}

const platformAdminCtx: AuthContext = {
  profile: baseProfile({ platform_role: "market_studio_admin" }),
  memberships: [],
  locationMemberships: [],
  assignedClientIds: [],
};

const accountManagerCtx: AuthContext = {
  profile: baseProfile({ platform_role: "account_manager" }),
  memberships: [],
  locationMemberships: [],
  assignedClientIds: [CLIENT_A],
};

const clientAdminCtx: AuthContext = {
  profile: baseProfile(),
  memberships: [{ client_id: CLIENT_A, role: "client_admin", is_active: true }],
  locationMemberships: [],
  assignedClientIds: [],
};

const locationManagerCtx: AuthContext = {
  profile: baseProfile(),
  memberships: [{ client_id: CLIENT_A, role: "location_manager", is_active: true }],
  locationMemberships: [
    { client_id: CLIENT_A, location_id: LOCATION_1, role: "location_manager" },
  ],
  assignedClientIds: [],
};

const viewerCtx: AuthContext = {
  profile: baseProfile(),
  memberships: [{ client_id: CLIENT_A, role: "viewer", is_active: true }],
  locationMemberships: [],
  assignedClientIds: [],
};

describe("tenant isolation", () => {
  it("blocks a client user from accessing another client's data", () => {
    expect(hasClientAccess(clientAdminCtx, CLIENT_A)).toBe(true);
    expect(hasClientAccess(clientAdminCtx, CLIENT_B)).toBe(false);
    expect(can(clientAdminCtx, "lead.read", { clientId: CLIENT_B })).toBe(false);
  });

  it("ignores inactive memberships", () => {
    const ctx: AuthContext = {
      ...clientAdminCtx,
      memberships: [{ client_id: CLIENT_A, role: "client_admin", is_active: false }],
    };
    expect(hasClientAccess(ctx, CLIENT_A)).toBe(false);
    expect(getClientRole(ctx, CLIENT_A)).toBeNull();
  });

  it("denies everything for an inactive profile", () => {
    const ctx: AuthContext = {
      ...clientAdminCtx,
      profile: baseProfile({ is_active: false }),
    };
    expect(hasClientAccess(ctx, CLIENT_A)).toBe(false);
    expect(can(ctx, "lead.read", { clientId: CLIENT_A })).toBe(false);
  });
});

describe("location access", () => {
  it("restricts a location-scoped user to their assigned locations", () => {
    expect(canAccessLocation(locationManagerCtx, CLIENT_A, LOCATION_1)).toBe(true);
    expect(canAccessLocation(locationManagerCtx, CLIENT_A, LOCATION_2)).toBe(false);
  });

  it("allows client-wide members to access all locations", () => {
    expect(canAccessLocation(clientAdminCtx, CLIENT_A, LOCATION_1)).toBe(true);
    expect(canAccessLocation(clientAdminCtx, CLIENT_A, LOCATION_2)).toBe(true);
  });

  it("blocks location access on another client entirely", () => {
    expect(canAccessLocation(locationManagerCtx, CLIENT_B, LOCATION_1)).toBe(false);
  });

  it("enforces location scoping through named permissions", () => {
    expect(
      can(locationManagerCtx, "lead.read", { clientId: CLIENT_A, locationId: LOCATION_1 }),
    ).toBe(true);
    expect(
      can(locationManagerCtx, "lead.read", { clientId: CLIENT_A, locationId: LOCATION_2 }),
    ).toBe(false);
  });
});

describe("platform administrators", () => {
  it("recognizes privileged platform roles", () => {
    expect(isPlatformAdmin(platformAdminCtx)).toBe(true);
    expect(isPlatformAdmin(clientAdminCtx)).toBe(false);
  });

  it("grants a Market Studio admin access to permitted client data", () => {
    expect(hasClientAccess(platformAdminCtx, CLIENT_A)).toBe(true);
    expect(hasClientAccess(platformAdminCtx, CLIENT_B)).toBe(true);
    expect(can(platformAdminCtx, "content.approve", { clientId: CLIENT_A })).toBe(true);
    expect(
      can(platformAdminCtx, "lead.read", { clientId: CLIENT_B, locationId: LOCATION_1 }),
    ).toBe(true);
  });
});

describe("assigned account managers", () => {
  it("only accesses clients they are assigned to", () => {
    expect(hasClientAccess(accountManagerCtx, CLIENT_A)).toBe(true);
    expect(hasClientAccess(accountManagerCtx, CLIENT_B)).toBe(false);
    expect(can(accountManagerCtx, "content.approve", { clientId: CLIENT_A })).toBe(true);
    expect(can(accountManagerCtx, "content.approve", { clientId: CLIENT_B })).toBe(false);
  });
});

describe("named permissions by role", () => {
  it("gives client_admin approval rights", () => {
    expect(hasClientRole(clientAdminCtx, CLIENT_A, ["client_admin"])).toBe(true);
    expect(can(clientAdminCtx, "content.approve", { clientId: CLIENT_A })).toBe(true);
    expect(can(clientAdminCtx, "brand.manage", { clientId: CLIENT_A })).toBe(true);
    expect(can(clientAdminCtx, "brand.approve", { clientId: CLIENT_A })).toBe(true);
    expect(can(clientAdminCtx, "membership.manage", { clientId: CLIENT_A })).toBe(true);
  });

  it("limits viewers to read-only permissions", () => {
    expect(can(viewerCtx, "lead.read", { clientId: CLIENT_A })).toBe(true);
    expect(can(viewerCtx, "lead.update", { clientId: CLIENT_A })).toBe(false);
    expect(can(viewerCtx, "brand.manage", { clientId: CLIENT_A })).toBe(false);
    expect(can(viewerCtx, "content.approve", { clientId: CLIENT_A })).toBe(false);
  });

  it("prevents location managers from approving content", () => {
    expect(can(locationManagerCtx, "content.approve", { clientId: CLIENT_A })).toBe(false);
    expect(can(locationManagerCtx, "brand.approve", { clientId: CLIENT_A })).toBe(false);
    expect(can(locationManagerCtx, "lead.update", { clientId: CLIENT_A })).toBe(true);
  });
});
