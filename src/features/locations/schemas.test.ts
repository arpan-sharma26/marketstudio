import { describe, expect, it } from "vitest";

import { createLocationSchema, resolveLocationSlug } from "./schemas";

const CLIENT_ID = "11111111-1111-1111-1111-111111111111";

describe("location schemas", () => {
  it("accepts a valid location payload", () => {
    const result = createLocationSchema.safeParse({
      clientId: CLIENT_ID,
      name: "Downtown",
      address_line_1: "100 Main St",
      city: "Calgary",
      province_code: "ab",
      postal_code: "T2P 1A1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.province_code).toBe("AB");
      expect(result.data.status).toBe("planned");
      expect(resolveLocationSlug(result.data.name)).toBe("downtown");
    }
  });

  it("rejects a missing address", () => {
    const result = createLocationSchema.safeParse({
      clientId: CLIENT_ID,
      name: "Downtown",
      address_line_1: "",
      city: "Calgary",
      province_code: "AB",
      postal_code: "T2P 1A1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid client id", () => {
    const result = createLocationSchema.safeParse({
      clientId: "not-a-uuid",
      name: "Downtown",
      address_line_1: "100 Main St",
      city: "Calgary",
      province_code: "AB",
      postal_code: "T2P 1A1",
    });
    expect(result.success).toBe(false);
  });
});
