# Market Studio — Development Status

_Last updated: 2026-07-27 (Phase 5 lead capture & pipeline)_

## Database target

**Supabase Cloud** — https://supabase.com/dashboard/project/fzbffrbdbrcqyatxvbol  
Migrations are pushed with `npm run db:push`. Do not rely on a local Docker Supabase stack.

## Current phase

**Phase 5 complete.** Manual lead capture, pipeline board, notes, consent, and duplicate detection are live.

## Status summary

| Area | Status |
| --- | --- |
| Phase 0–1 foundation & auth | Done |
| Phase 2 client / location / membership management | Done |
| Phase 3 brand profiles / FAQs / programs | Done |
| Phase 4 client onboarding checklist | Done |
| Phase 5 lead capture & pipeline | Done |
| AI Presence Audit (ported early) | Done — `audits` table on cloud |
| Tests | Vitest suite for permissions, schemas, brand + onboarding + lead helpers |

## Verification

- `npm run typecheck`
- `npm run test`
- Cloud migrations through `20260728053000_leads_pipeline`

## How to try it

1. Sign in as `owner@bloomingsteps.test` / `MarketStudio!Dev123`
2. Open **Clients → Blooming Steps → Leads**
3. Review the pipeline board, open a lead, add a note, record consent
4. Create a new lead and try a duplicate email to see the guard
5. Re-seed with `npm run db:seed` for sample leads

## Known limitations

- Member invite requires an existing Market Studio user (no email invite flow yet).
- Lead capture is manual only (Meta/Google webhooks come later with campaigns).
- No automated acknowledgement or follow-up sequences yet (Phase 6).
- No tour booking UI yet (Phase 6).
- Onboarding task completion is manual (no auto-detect from related tables).
- Logo upload not built yet (logo URL field only).

## Next task

**Phase 6 — Communications & tours** (see `docs/implementation-roadmap.md`).

Later: Phase 8 Meta/Google Ads campaigns; Phase 10 local SEO & GEO.
