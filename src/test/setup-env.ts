// Provides safe placeholder environment variables so modules that validate env at import
// time (e.g. src/config/env.ts) can be loaded under Vitest. These are not real
// credentials and are only used to satisfy schema validation during tests.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";
