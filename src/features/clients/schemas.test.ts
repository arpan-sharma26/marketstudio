import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slug";
import { can, isPlatformAdmin } from "@/lib/permissions";
import type { AuthContext } from "@/lib/permissions/types";
import { createClientSchema, resolveClientSlug } from "./schemas";

const CLIENT_A = "11111111-1111-1111-1111-111111111111";
const CLIENT_B = "22222222-2222-2222-2222-222222222222";

function baseCtx(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    profile: {
      id: "profile-1",
      platform_role: "client_user",
      is_active: true,
    },
    memberships: [],
    locationMemberships: [],
    assignedClientIds: [],
    ...overrides,
  };
}

describe("client schemas", () => {
  it("accepts a valid create payload and defaults status", () => {
    const result = createClientSchema.safeParse({
      name: "Sunny Days Daycare",
      timezone: "America/Edmonton",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("prospect");
      expect(result.data.timezone).toBe("America/Edmonton");
    }
  });

  it("rejects an invalid slug", () => {
    const result = createClientSchema.safeParse({
      name: "Test",
      slug: "Invalid Slug!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = createClientSchema.safeParse({
      name: "Test Client",
      primary_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("generates a slug from the name when omitted", () => {
    expect(resolveClientSlug("Sunny Days Daycare")).toBe("sunny-days-daycare");
    expect(slugify("  Hello World!  ")).toBe("hello-world");
  });
});

describe("client write authorization", () => {
  it("allows only platform admins to create clients (client.manage)", () => {
    const admin = baseCtx({
      profile: {
        id: "admin",
        platform_role: "market_studio_admin",
        is_active: true,
      },
    });
    const clientAdmin = baseCtx({
      memberships: [{ client_id: CLIENT_A, role: "client_admin", is_active: true }],
    });

    expect(isPlatformAdmin(admin)).toBe(true);
    expect(can(admin, "client.manage", { clientId: CLIENT_A })).toBe(true);
    expect(can(clientAdmin, "client.manage", { clientId: CLIENT_A })).toBe(false);
  });

  it("allows client admins to update their own client only", () => {
    const clientAdmin = baseCtx({
      memberships: [{ client_id: CLIENT_A, role: "client_admin", is_active: true }],
    });

    expect(can(clientAdmin, "client.update", { clientId: CLIENT_A })).toBe(true);
    expect(can(clientAdmin, "client.update", { clientId: CLIENT_B })).toBe(false);
    expect(can(clientAdmin, "membership.manage", { clientId: CLIENT_A })).toBe(true);
    expect(can(clientAdmin, "location.manage", { clientId: CLIENT_A })).toBe(true);
  });

  it("blocks location managers from membership and location management", () => {
    const locationManager = baseCtx({
      memberships: [{ client_id: CLIENT_A, role: "location_manager", is_active: true }],
      locationMemberships: [
        {
          client_id: CLIENT_A,
          location_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          role: "location_manager",
        },
      ],
    });

    expect(can(locationManager, "client.read", { clientId: CLIENT_A })).toBe(true);
    expect(can(locationManager, "location.manage", { clientId: CLIENT_A })).toBe(false);
    expect(can(locationManager, "membership.manage", { clientId: CLIENT_A })).toBe(false);
  });

  it("allows assigned account managers to manage their clients", () => {
    const am = baseCtx({
      profile: {
        id: "am",
        platform_role: "account_manager",
        is_active: true,
      },
      assignedClientIds: [CLIENT_A],
    });

    expect(can(am, "client.update", { clientId: CLIENT_A })).toBe(true);
    expect(can(am, "location.manage", { clientId: CLIENT_A })).toBe(true);
    expect(can(am, "client.update", { clientId: CLIENT_B })).toBe(false);
  });
});
