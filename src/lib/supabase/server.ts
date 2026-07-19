import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { clientEnv } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Server Supabase client bound to the request's cookies. Runs with the authenticated
 * user's identity, so Row Level Security applies. Use this in Server Components, Server
 * Actions, and Route Handlers for all normal (RLS-enforced) data access.
 */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  // `@supabase/ssr` resolves the Schema generic to `any`, which strips query result
  // typing. Casting to `SupabaseClient<Database>` restores correct end-to-end types.
  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `setAll` can be called from a Server Component where cookies are read-only.
            // Session refresh is handled by middleware, so this is safe to ignore.
          }
        },
      },
    },
  );
}
