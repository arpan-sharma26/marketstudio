import { describe, expect, it } from "vitest";

import { toFieldErrors } from "@/lib/validation";
import { signInSchema } from "./schemas";

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    const result = signInSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email with a field error", () => {
    const result = signInSchema.safeParse({ email: "nope", password: "secret" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = toFieldErrors(result.error);
      expect(fieldErrors.email?.[0]).toMatch(/valid email/i);
    }
  });

  it("rejects a missing password", () => {
    const result = signInSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = toFieldErrors(result.error);
      expect(fieldErrors.password?.[0]).toMatch(/required/i);
    }
  });

  it("rejects entirely missing input", () => {
    const result = signInSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
