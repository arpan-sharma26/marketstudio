import { describe, expect, it } from "vitest";

import { auditInputSchema } from "@/features/audits/schemas";

describe("auditInputSchema", () => {
  it("accepts a valid daycare audit payload", () => {
    const result = auditInputSchema.safeParse({
      businessName: "Sunshine Early Learning",
      city: "Calgary, AB",
      websiteUrl: "https://example.com",
      gbpUrl: "https://maps.google.com",
      reviewCount: 12,
      averageRating: 4.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing business name", () => {
    const result = auditInputSchema.safeParse({
      businessName: "",
      city: "Calgary, AB",
      websiteUrl: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("allows an empty GBP URL", () => {
    const result = auditInputSchema.safeParse({
      businessName: "Sunshine Early Learning",
      city: "Calgary, AB",
      websiteUrl: "https://example.com",
      gbpUrl: "",
    });
    expect(result.success).toBe(true);
  });
});
