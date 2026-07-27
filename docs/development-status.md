# Market Studio — Development Status

_Last updated: 2026-07-24 (AI Presence Audit ported from legacy prototype)_

## Database target

**Supabase Cloud** — https://supabase.com/dashboard/project/fzbffrbdbrcqyatxvbol  
Migrations are pushed with `npm run db:push`. Do not rely on a local Docker Supabase stack.

## Current phase

**Phase 2 complete.** AI Presence Audit (legacy Module 1) has been ported into this codebase.

## Status summary

| Area | Status |
| --- | --- |
| Phase 0–1 foundation & auth | Done |
| Phase 2 client / location / membership management | Done |
| AI Presence Audit (ported from `C:\Users\arpan\projects\market-studio`) | Code integrated — **run `npm run db:push` to apply `audits` table** |
| Tests | 40 passing |

## Verification

- `npm run typecheck` — pass
- `npm run test` — 40 tests passing
- Cloud: Phase 1–2 migrations applied; `audits` migration pending push

## How to try it

1. Sign in as `admin@marketstudio.test` / `MarketStudio!Dev123`
2. Open **Clients** or **AI Audit** in the sidebar
3. For the audit tool: enter a prospect's details (or Load sample) and generate

## Known limitations

- Member invite requires an existing Market Studio user (no email invite flow yet).
- Business hours UI covers **operating** hours only (tour/office types are in the schema for later).
- Client list search is in-memory (fine for MVP scale).
- No pagination yet on clients/locations/members lists.
- Audits are prospect-scoped (no `client_id` yet) and written via service role only.

## Next task

1. Run `npm run db:push` then `npm run db:types` to finish the audits table on cloud.
2. **Phase 3 — Brand profiles, FAQs & programs** (see `docs/implementation-roadmap.md`).
