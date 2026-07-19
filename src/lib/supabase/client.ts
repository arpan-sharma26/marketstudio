import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { clientEnv } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Browser Supabase client. Uses ONLY the public anon key and is subject to Row Level
 * Security. Safe to import into Client Components. Never use the service-role key here.
 */
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
