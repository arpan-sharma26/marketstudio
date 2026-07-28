import { describe, expect, it } from "vitest";

import {
  linesToList,
  listToLines,
  upsertBrandProfileSchema,
  upsertFaqSchema,
  upsertProgramSchema,
} from "./schemas";

describe("brand schemas", () => {
  it("parses a brand profile and converts list fields later via helpers", () => {
    const result = upsertBrandProfileSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      name: "Blooming Steps",
      primary_colour: "#0A2F3D",
      unique_selling_points: "Safe spaces\nOutdoor play",
      status: "draft",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(linesToList(result.data.unique_selling_points)).toEqual([
        "Safe spaces",
        "Outdoor play",
      ]);
    }
  });

  it("rejects invalid hex colours", () => {
    const result = upsertBrandProfileSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      name: "Test",
      primary_colour: "navy",
    });
    expect(result.success).toBe(false);
  });

  it("round-trips list helpers", () => {
    expect(listToLines(["a", "b"])).toBe("a\nb");
    expect(linesToList("a\n\nb\n")).toEqual(["a", "b"]);
  });

  it("requires FAQ question and answer", () => {
    const result = upsertFaqSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      question: "",
      answer: "Yes",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a program with location ids", () => {
    const result = upsertProgramSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      name: "Toddler",
      minimum_age_months: 12,
      maximum_age_months: 24,
      locationIds: ["33333333-3333-3333-3333-333333333333"],
      status: "active",
    });
    expect(result.success).toBe(true);
  });
});
