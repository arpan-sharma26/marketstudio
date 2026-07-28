# Market Studio — Development Status

_Last updated: 2026-07-27 (Phase 3 brand profiles, FAQs & programs)_

## Database target

**Supabase Cloud** — https://supabase.com/dashboard/project/fzbffrbdbrcqyatxvbol  
Migrations are pushed with `npm run db:push`. Do not rely on a local Docker Supabase stack.

## Current phase

**Phase 3 complete.** Brand profiles, client FAQs, programs, and location-program links are live.

## Status summary

| Area | Status |
| --- | --- |
| Phase 0–1 foundation & auth | Done |
| Phase 2 client / location / membership management | Done |
| Phase 3 brand profiles / FAQs / programs | Done |
| AI Presence Audit (ported early) | Done — `audits` table on cloud |
| Tests | Vitest suite for permissions, schemas, brand helpers |

## Verification

- `npm run typecheck`
- `npm run test`
- Cloud migrations through `20260727184446_brand_profiles_faqs_programs`

## How to try it

1. Sign in as `admin@marketstudio.test` / `MarketStudio!Dev123` (or `owner@bloomingsteps.test`)
2. Open **Clients → Blooming Steps → Brand / FAQs / Programs**
3. Edit brand claims, add FAQs, link programs to locations
4. Re-seed with `npm run db:seed` for sample brand/FAQ/program data

## Known limitations

- Member invite requires an existing Market Studio user (no email invite flow yet).
- Business hours UI covers **operating** hours only (tour/office types are in the schema for later).
- Client list search is in-memory (fine for MVP scale).
- No pagination yet on clients/locations/members lists.
- Audits are prospect-scoped (no `client_id` yet) and written via service role only.
- Logo upload not built yet (logo URL field only).
- Location-program availability notes are stored but not edited in a dedicated UI yet.

## Next task

**Phase 4 — Client onboarding** (see `docs/implementation-roadmap.md`).
