import { describe, expect, it } from "vitest";

import { parseClientEnv, parseServerEnv } from "./env";

describe("client env validation", () => {
  it("accepts valid values and applies defaults", () => {
    const env = parseClientEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_APP_URL: undefined,
    });
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("rejects an invalid Supabase URL", () => {
    expect(() =>
      parseClientEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("rejects a missing anon key", () => {
    expect(() =>
      parseClientEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });
});

describe("server env validation", () => {
  it("accepts a service-role key", () => {
    const env = parseServerEnv({ SUPABASE_SERVICE_ROLE_KEY: "service-role-key" });
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe("service-role-key");
  });

  it("rejects a missing service-role key", () => {
    expect(() => parseServerEnv({ SUPABASE_SERVICE_ROLE_KEY: undefined })).toThrow(
      /SUPABASE_SERVICE_ROLE_KEY/,
    );
  });
});
