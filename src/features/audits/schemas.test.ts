import { describe, expect, it } from "vitest";

import { filterCities } from "@/features/audits/cities";
import { filterCountries, getAllCountries, getCountryCodeByName } from "@/features/audits/countries";
import { auditInputSchema } from "@/features/audits/schemas";

describe("auditInputSchema", () => {
  it("accepts a valid daycare audit payload", () => {
    const result = auditInputSchema.safeParse({
      businessName: "Blooming Steps Daycare",
      country: "Canada",
      city: "Calgary, AB",
      websiteUrl: "https://example.com",
      gbpUrl: "https://maps.google.com",
      reviewCount: 12,
      averageRating: 4.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing country", () => {
    const result = auditInputSchema.safeParse({
      businessName: "Blooming Steps Daycare",
      country: "",
      city: "Calgary, AB",
      websiteUrl: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing business name", () => {
    const result = auditInputSchema.safeParse({
      businessName: "",
      country: "Canada",
      city: "Calgary, AB",
      websiteUrl: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("allows an empty GBP URL", () => {
    const result = auditInputSchema.safeParse({
      businessName: "Blooming Steps Daycare",
      country: "Canada",
      city: "Calgary, AB",
      websiteUrl: "https://example.com",
      gbpUrl: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("filterCountries", () => {
  it("loads the full world country list", () => {
    expect(getAllCountries().length).toBeGreaterThan(200);
  });

  it("prioritizes Canada and the US when the query is empty", () => {
    const results = filterCountries("");
    expect(results[0]?.name).toBe("Canada");
    expect(results[1]?.name).toBe("United States");
  });

  it("suggests Canada when typing ca", () => {
    const results = filterCountries("ca");
    expect(results.some((c) => c.name === "Canada")).toBe(true);
  });

  it("suggests India when typing india", () => {
    const results = filterCountries("india");
    expect(results[0]?.name).toBe("India");
    expect(getCountryCodeByName("India")).toBe("IN");
  });
});

describe("filterCities", () => {
  it("scopes suggestions to Canada", () => {
    const results = filterCities("cal", "Canada");
    expect(results.some((c) => c.label.startsWith("Calgary"))).toBe(true);
    expect(results.every((c) => c.country === "Canada")).toBe(true);
  });

  it("suggests Winnipeg for Canada", () => {
    const results = filterCities("winnipeg", "Canada");
    expect(results.some((c) => c.label.startsWith("Winnipeg"))).toBe(true);
  });

  it("suggests Mumbai for India", () => {
    const results = filterCities("mumbai", "India");
    expect(results.some((c) => c.label.startsWith("Mumbai"))).toBe(true);
  });

  it("suggests cities for Brazil", () => {
    const results = filterCities("sao paulo", "Brazil");
    expect(results.some((c) => c.label.toLowerCase().includes("paulo"))).toBe(true);
  });
});
