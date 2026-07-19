# Market Studio — Development Status

_Last updated: 2026-07-19 (foundation complete)_

This document tracks what has been built, what is verified, and what comes next. It is
updated at the end of every task.

## Current phase

**Phase 0–1: Project foundation & authentication shell — COMPLETE** (see
`docs/implementation-roadmap.md`).

## Status summary

| Area | Status |
| --- | --- |
| Planning & architecture docs | Done |
| Project scaffold (Next.js/TS strict/Tailwind/ESLint/Prettier/Vitest) | Done |
| Supabase clients (browser/server/middleware/admin) | Done |
| Typed environment validation + `.env.example` | Done |
| Authentication shell (sign-in, sign-out, session, protected layout, dashboard) | Done |
| Unauthorized / error / loading / not-found states + nav shell | Done |
| Core schema migrations (5 tables) + RLS + helper functions | Done |
| Centralized authorization helpers | Done |
| Tests (26 passing) | Done |
| Local development seed data | Done |
| Verification (typecheck / lint / test / build) | Done |

## Verification results

- `npm run typecheck` — passes (0 errors).
- `npm run lint` — passes (0 warnings/errors).
- `npm run test` — 26 tests passing across 4 files.
- `npm run build` — production build succeeds; all routes compile.

## Out of scope (not started, by design)

Lead CRM, content system, tours/communications, campaigns, reporting, reviews, AI agents,
and external integrations. These are planned in later phases of the roadmap.

## Known limitations

- `src/types/database.ts` is hand-authored for the Phase 1 schema. Regenerate it with
  `npm run db:types` once a local Supabase instance is running so it stays authoritative.
- RLS policies have been written and reviewed statically. They should also be exercised
  against a running local Supabase instance (`supabase db reset` + `npm run db:seed`)
  before relying on them in a shared environment.
- Self-service profile editing is intentionally disabled at the RLS layer (only platform
  admins can update `profiles`) to prevent role escalation via the anon key. A whitelisted
  RPC for self-edits will be added when profile settings UI is built.
- `next lint` is used and works, but is deprecated in Next.js 16; migrate to the ESLint
  CLI in a future maintenance task.
- No email confirmation / password reset UI yet (the `/auth/callback` handler is in place
  for when those flows are added). Email/password sign-in only; no social login.
- Tests focus on pure authorization logic, validation, and guard redirects. Full
  database-backed RLS integration tests are deferred until feature phases add data access.

## Next task

**Phase 2 — Client & location management** (see `docs/implementation-roadmap.md`): build
client and location CRUD, membership management UI, and `location_business_hours`, reusing
the authorization helpers and RLS foundation established here.
