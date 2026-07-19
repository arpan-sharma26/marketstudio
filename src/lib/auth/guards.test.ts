import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Verifies the server-side auth guard behaviour with a mocked Supabase client:
 * - an unauthenticated user is redirected to /sign-in
 * - an inactive account is redirected to /unauthorized
 * - an active account is returned
 */

class RedirectSignal extends Error {
  constructor(public readonly to: string) {
    super(`REDIRECT:${to}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new RedirectSignal(to);
  },
}));

type FakeUser = { id: string } | null;
type FakeProfile = { id: string; is_active: boolean } | null;

let fakeUser: FakeUser = null;
let fakeProfile: FakeProfile = null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: fakeUser } }),
    },
    from: () => {
      const builder = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: async () => ({ data: fakeProfile }),
      };
      return builder;
    },
  }),
}));

import { getAuthenticatedProfile, requireProfile } from "./index";

beforeEach(() => {
  fakeUser = null;
  fakeProfile = null;
});

describe("requireProfile", () => {
  it("redirects unauthenticated users to sign-in", async () => {
    fakeUser = null;
    await expect(requireProfile()).rejects.toMatchObject({ to: "/sign-in" });
  });

  it("redirects inactive accounts to unauthorized", async () => {
    fakeUser = { id: "user-1" };
    fakeProfile = { id: "user-1", is_active: false };
    await expect(requireProfile()).rejects.toMatchObject({ to: "/unauthorized" });
  });

  it("returns the profile for an active authenticated user", async () => {
    fakeUser = { id: "user-1" };
    fakeProfile = { id: "user-1", is_active: true };
    await expect(requireProfile()).resolves.toMatchObject({
      id: "user-1",
      is_active: true,
    });
  });
});

describe("getAuthenticatedProfile", () => {
  it("returns null when there is no session", async () => {
    fakeUser = null;
    await expect(getAuthenticatedProfile()).resolves.toBeNull();
  });
});
