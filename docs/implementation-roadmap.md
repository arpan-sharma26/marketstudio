# Market Studio Implementation Roadmap

This roadmap breaks Market Studio into small, testable implementation phases. It is
derived from and must remain consistent with:

- `docs/market-studio-product-brief.md`
- `docs/daycare-marketing-workflows.md`
- `docs/database-design.md`
- `.cursor/rules/market-studio.mdc`

The ordering follows the MVP priority list in the Cursor rules. Each phase is designed
to be shippable on its own and to leave the application in a working, secure state.

**Scope of the current task (this repository):** Phases 0 and 1 only. Phases 2+ are
documented here for planning purposes and must not be started until the foundation is
approved. Do **not** begin the lead CRM, content system, integrations, or AI features
as part of the foundation task.

---

## Phase 0 — Project foundation (IN SCOPE)

**Scope**

- Establish a production-quality Next.js App Router + TypeScript (strict) codebase.
- Tailwind, ESLint, Prettier, Vitest, Zod.
- Feature-oriented folder structure per the Cursor rules.
- Four Supabase client utilities (browser, server, middleware, admin).
- Typed, validated environment module and `.env.example`.
- Planning and architecture documentation.

**Database changes**

- None yet (schema begins in Phase 1). Local Supabase config only.

**Pages**

- None (structure only). App renders a placeholder home route.

**Components**

- Base `ui/` primitives introduced as needed by later phases.

**Server actions / API routes**

- None.

**Permissions**

- None enforced yet; permission catalog defined for later use.

**Tests**

- Environment validation unit test.
- Test harness (Vitest) is runnable.

**Dependencies**

- None (first phase).

**Acceptance criteria**

- `npm run typecheck`, `npm run lint`, and `npm run test` all pass.
- No secrets committed. `.env.example` documents every variable.
- Folder structure matches the Cursor rules.

---

## Phase 1 — Authentication shell & tenant foundation (IN SCOPE)

**Scope**

- Email/password authentication via Supabase Auth (no social login).
- Session handling through middleware and server Supabase clients.
- Protected application layout, dashboard placeholder, unauthorized page,
  error boundary, loading states, navigation shell.
- Core multi-tenant schema and Row Level Security.
- Centralized authorization helpers.

**Database changes** (migrations)

- `profiles` (1:1 with `auth.users`).
- `clients`.
- `client_memberships` (unique `client_id + profile_id`).
- `client_locations` (unique `client_id + slug`).
- `location_memberships`.
- `updated_at` triggers, indexes, constraints.
- RLS enabled on all five tables + initial policies.
- `SECURITY DEFINER` helper functions for membership / role checks (avoids RLS recursion).

**Pages**

- `/sign-in`
- `/(app)` protected layout + `/dashboard`
- `/unauthorized`
- Global `error.tsx`, `loading.tsx`, `not-found.tsx`

**Components**

- `SignInForm` (client component).
- App shell: sidebar/topbar navigation, sign-out button.
- `ui/` primitives: `Button`, `Input`, `Label`, `Alert`, `Card`.

**Server actions / API routes**

- `signIn` server action (validated with Zod).
- `signOut` server action.
- `/auth/callback` route handler (session exchange, future-proofing).

**Permissions**

- `getAuthenticatedProfile`, `requireProfile`.
- `getClientMembership`, `requireClientMembership`.
- `hasClientRole`, `hasPlatformRole`.
- `canAccessLocation`.
- `can(permission, context)` named-permission checker.
- `assertSameClient` cross-tenant guard.

**Tests**

- Unauthenticated user cannot reach protected routes.
- User cannot access another client's data (permission-layer unit tests).
- Location-restricted user blocked from unauthorized location.
- Market Studio admin can access permitted client data.
- Invalid sign-in / server-action input rejected by Zod.

**Dependencies**

- Phase 0.

**Acceptance criteria**

- All Definition-of-Done items in the Cursor rules met for auth.
- RLS reviewed; no `client_id` is trusted from the browser.
- Seed data lets a developer log in locally as each role.

---

## Phase 2 — Client & location management (OUT OF SCOPE for foundation)

**Scope:** CRUD for clients and locations, membership management UI, location
business hours.

**Database:** `location_business_hours`; extend RLS write policies.

**Pages:** `/clients`, `/clients/[clientId]`, `/clients/[clientId]/locations`, member admin.

**Components:** data tables with search/filter/sort/pagination, forms, empty states.

**Server actions:** create/update client, create/update location, invite member, set role.

**Permissions:** `client.read/update`, `location.manage`, `membership.manage`.

**Tests:** tenant isolation on writes, role gating, slug uniqueness, invalid input.

**Acceptance:** Account managers manage assigned clients; client admins manage own client only.

---

## Phase 3 — Brand profiles, FAQs & programs

**Scope:** brand profile builder, approved/restricted claims, client FAQs, programs and
location-program availability. **Database:** `brand_profiles`, `client_faqs`, `programs`,
`location_programs`. **Permissions:** `brand.manage`, `brand.approve`.

## Phase 4 — Client onboarding

**Scope:** onboarding checklist + structured intake (no AI yet). **Database:** onboarding
status fields already on `clients`; onboarding tasks table. **Permissions:** `onboarding.manage`.

## Phase 5 — Lead capture & pipeline

**Scope:** manual lead entry, pipeline board, activities, notes, consent, duplicate
detection. **Database:** `leads`, `lead_source_events`, `lead_activities`, `lead_notes`,
`lead_consents`. **Permissions:** `lead.read/update/assign`.

## Phase 6 — Communications & tours

**Scope:** conversations/messages, appointments, reminders. **Database:** `conversations`,
`messages`, `appointments`, `appointment_reminders`. **Permissions:** `appointment.manage`,
`conversation.read`.

## Phase 7 — Content management & approval

**Scope:** content calendar, assets, approval history, publication tracking. **Database:**
`content_items`, `content_assets`, `content_approvals`, `content_publications`.
**Permissions:** `content.read/create/approve`.

## Phase 8 — Campaigns & reporting

**Scope:** campaigns, daily metrics, conversions, funnel reports. **Database:** `campaigns`,
`campaign_metrics`, `conversions`. **Permissions:** `campaign.manage`, `report.read`.

## Phase 9 — Reviews, AI & automation logs

**Scope:** reviews + responses, AI generations/recommendations, automation runs, audit logs,
integrations config. **Database:** `reviews`, `review_responses`, `ai_generations`,
`ai_recommendations`, `automation_runs`, `audit_logs`, `integrations`. **Permissions:**
approval matrix from workflows doc; human-in-the-loop for sensitive actions.

---

## Cross-cutting requirements (every phase)

- Server-side authorization on every mutation; RLS on every client-owned table.
- Zod validation on all forms, params, API payloads, webhooks, AI outputs.
- Loading, empty, and error states for every major view.
- Audit high-risk actions; never expose secrets or service-role key to the browser.
- Update `docs/database-design.md` and regenerate Supabase types on schema change.
- Tests for tenant isolation, role permissions, and invalid input.
