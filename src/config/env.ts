import { z } from "zod";

/**
 * Typed, validated environment access.
 *
 * - Client-safe variables use the `NEXT_PUBLIC_` prefix and are inlined by Next.js.
 * - Server-only secrets (e.g. the Supabase service-role key) are validated lazily and
 *   must never be imported into a Client Component.
 */

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

/**
 * Pure parser exposed for testing. Throws a readable error listing every problem.
 */
export function parseClientEnv(source: Record<string, string | undefined>): ClientEnv {
  const result = clientEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid client environment variables:\n${formatIssues(result.error)}`,
    );
  }
  return result.data;
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid server environment variables:\n${formatIssues(result.error)}`,
    );
  }
  return result.data;
}

// Reference `NEXT_PUBLIC_` variables explicitly so Next.js can statically inline them.
export const clientEnv: ClientEnv = parseClientEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

let cachedServerEnv: ServerEnv | null = null;

/**
 * Validates and returns server-only secrets. Guards against accidental browser usage.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerEnv() must not be called in the browser — server secrets would be exposed.",
    );
  }
  if (!cachedServerEnv) {
    cachedServerEnv = parseServerEnv({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }
  return cachedServerEnv;
}
