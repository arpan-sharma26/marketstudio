import { describe, expect, it } from "vitest";

import { normalizeEmail, normalizePhone } from "./constants";
import { createLeadSchema } from "./schemas";

describe("lead normalization", () => {
  it("normalizes email", () => {
    expect(normalizeEmail("  Parent@Example.COM ")).toBe("parent@example.com");
  });

  it("normalizes Canadian phone numbers to 10 digits", () => {
    expect(normalizePhone("+1 (403) 555-1212")).toBe("4035551212");
  });
});

describe("createLeadSchema", () => {
  it("requires some contact identity", () => {
    const result = createLeadSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      lead_source: "manual",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal email lead", () => {
    const result = createLeadSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      email: "parent@example.com",
      lead_source: "website",
    });
    expect(result.success).toBe(true);
  });
});
