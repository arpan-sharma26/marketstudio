import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { clientEnv, getServerEnv } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Trusted, service-role Supabase client. BYPASSES Row Level Security.
 *
 * Use ONLY in trusted server contexts (seeding, webhooks, background jobs, deliberate
 * admin operations). The `server-only` import guarantees a build error if this module is
 * ever imported into client code, and `getServerEnv()` throws in the browser as a second
 * guard. Never expose the service-role key to the browser.
 */
export function createAdminClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  return createSupabaseClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
