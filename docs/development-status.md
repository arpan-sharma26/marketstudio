# Market Studio — Development Status

_Last updated: 2026-07-27 (Phase 4 client onboarding)_

## Database target

**Supabase Cloud** — https://supabase.com/dashboard/project/fzbffrbdbrcqyatxvbol  
Migrations are pushed with `npm run db:push`. Do not rely on a local Docker Supabase stack.

## Current phase

**Phase 4 complete.** Client onboarding checklist + marketing goals intake are live (no AI).

## Status summary

| Area | Status |
| --- | --- |
| Phase 0–1 foundation & auth | Done |
| Phase 2 client / location / membership management | Done |
| Phase 3 brand profiles / FAQs / programs | Done |
| Phase 4 client onboarding checklist | Done |
| AI Presence Audit (ported early) | Done — `audits` table on cloud |
| Tests | Vitest suite for permissions, schemas, brand + onboarding helpers |

## Verification

- `npm run typecheck`
- `npm run test`
- Cloud migrations through `20260728040000_onboarding_tasks`

## How to try it

1. Sign in as `admin@marketstudio.test` / `MarketStudio!Dev123` (or `owner@bloomingsteps.test`)
2. Open **Clients → Blooming Steps → Onboarding**
3. Review the checklist, update task status, edit marketing goals
4. Re-seed with `npm run db:seed` for completed sample onboarding tasks

## Known limitations

- Member invite requires an existing Market Studio user (no email invite flow yet).
- Business hours UI covers **operating** hours only (tour/office types are in the schema for later).
- Client list search is in-memory (fine for MVP scale).
- No pagination yet on clients/locations/members lists.
- Audits are prospect-scoped (no `client_id` yet) and written via service role only.
- Logo upload not built yet (logo URL field only).
- Location-program availability notes are stored but not edited in a dedicated UI yet.
- Onboarding task completion is manual (no auto-detect from related tables).
- Onboarding Agent / AI brand generation is deferred.

## Next task

**Phase 5 — Lead capture & pipeline** (see `docs/implementation-roadmap.md`).
