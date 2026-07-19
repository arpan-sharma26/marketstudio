# 3. Supabase client separation and secret handling

- **Status:** Accepted
- **Date:** 2026-07-19

## Context

Supabase exposes a public anon key (safe for the browser) and a service-role key (bypasses
RLS, must stay server-only). The Cursor rules require separate browser and server clients
and forbid exposing the service-role key to the browser.

## Decision

We maintain four Supabase client utilities, each with a single responsibility:

- `lib/supabase/client.ts` — browser client (anon key only).
- `lib/supabase/server.ts` — server client bound to request cookies (RLS in user context).
- `lib/supabase/middleware.ts` — session refresh in Next.js middleware.
- `lib/supabase/admin.ts` — service-role client, guarded so it throws if evaluated in the
  browser; only imported by trusted server code (seeding, webhooks, admin tasks).

The service-role key is read from a **server-only** environment variable
(`SUPABASE_SERVICE_ROLE_KEY`, no `NEXT_PUBLIC_` prefix). Public variables use the
`NEXT_PUBLIC_` prefix. The typed env module separates client and server schemas.

## Consequences

- The service-role key can never be bundled into client JavaScript.
- Clear, greppable boundaries make review straightforward.
- Admin operations are explicit and auditable because they use a distinct client.
