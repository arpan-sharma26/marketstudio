# Market Studio Architecture

This document describes the technical architecture of the Market Studio platform. It is
the source of truth for structural decisions and must remain consistent with the product
brief, workflows, database design, and `.cursor/rules/market-studio.mdc`.

---

## 1. Application architecture

Market Studio is a multi-tenant web application built on the **Next.js App Router**.

- **Runtime:** Next.js (App Router) + React, TypeScript in strict mode.
- **Styling:** Tailwind CSS with a small set of accessible `ui/` primitives.
- **Backend:** Supabase (PostgreSQL, Auth, Storage) accessed only from the server.
- **Validation:** Zod for all runtime input validation and typed environment parsing.
- **Testing:** Vitest for unit and integration tests.

### High-level request flow

```
Browser ──▶ Next.js middleware (refresh Supabase session cookie)
        ──▶ Server Component / Server Action / Route Handler
              ├─ authorization helpers (lib/auth, lib/permissions)
              ├─ Supabase server client (RLS-enforced, user context)
              └─ Supabase admin client (service role, trusted server only)
        ──▶ PostgreSQL (Row Level Security enforced as defense-in-depth)
```

Two independent authorization layers protect every request:

1. **Application layer** — centralized helpers verify the authenticated user, their
   client membership, role, and location access before any query runs.
2. **Database layer** — Row Level Security ensures that even a mistaken query cannot
   read or write another client's data.

Front-end route protection is treated as UX only and is **never** the sole guard.

### Folder structure (feature-oriented)

```
src/
├── app/                      # App Router routes, layouts, error/loading boundaries
│   ├── (auth)/sign-in/       # public auth routes
│   ├── (app)/                # protected application shell + dashboard
│   ├── unauthorized/
│   └── auth/callback/        # session exchange route handler
├── components/
│   ├── ui/                   # low-level accessible primitives
│   └── shared/               # cross-feature composites (app shell, nav)
├── features/                 # feature modules (auth, clients, locations, ...)
│   └── auth/                 # actions, components, schemas for auth
├── lib/
│   ├── supabase/             # browser / server / middleware / admin clients
│   ├── auth/                 # authenticated profile + session helpers
│   ├── permissions/          # roles, permission catalog, guards
│   └── validation/           # shared Zod schemas & helpers
├── hooks/
├── types/                    # shared domain types + generated DB types
└── config/                   # env validation, app constants
```

Provider-specific integration logic (Meta, Google, email, SMS) will live under
`features/integrations` / `lib/integrations` and convert external payloads into domain
models. No third-party field names leak into the rest of the app.

---

## 2. Authentication flow

Authentication uses **Supabase Auth with email/password**. Social login is intentionally
out of scope until explicitly required.

1. A user submits the sign-in form (client component).
2. The `signIn` **server action** validates input with Zod and calls
   `signInWithPassword` on the **server** Supabase client. Session tokens are written to
   HTTP-only cookies by Supabase's SSR helpers — never exposed to client JS.
3. **Middleware** runs on every matched request and refreshes the session cookie so
   Server Components always see a valid session (or none).
4. Protected layouts call `requireProfile()`; if there is no authenticated user they
   redirect to `/sign-in`.
5. `signOut` is a server action that clears the Supabase session cookies and redirects.
6. A `profiles` row is linked 1:1 to `auth.users.id`. A database trigger
   (`handle_new_user`) creates the profile automatically on sign-up so the app always
   has an application profile to authorize against.

The `/auth/callback` route handler exists to exchange auth codes (used later for email
confirmation / password reset flows) and to keep the auth surface centralized.

---

## 3. Multi-tenant authorization model

The top-level tenant is a **client** (a daycare business). Authorization is resolved
**from the authenticated user's memberships**, never from a browser-supplied `client_id`.

### Roles

**Platform roles** (`profiles.platform_role`):

- `super_admin` — full platform access.
- `market_studio_admin` — platform administration.
- `account_manager` — Market Studio staff assigned to specific clients.
- `client_user` — external daycare user; all client access comes from memberships.

**Client roles** (`client_memberships.role`):

- `client_admin`, `location_manager`, `staff`, `viewer`,
  `market_studio_account_manager`.

`profiles.platform_role` alone is **never** sufficient for client-level authorization,
per the database design. A privileged platform role (super_admin / market_studio_admin /
assigned account_manager) can access client data through platform rules; everyone else
requires an active `client_memberships` row.

### Access resolution rules

For any client-scoped operation a user may proceed only if **either**:

1. They have an **active `client_memberships`** row for that `client_id` with a role that
   permits the action; **or**
2. They hold an **authorized platform role** (super_admin / market_studio_admin, or an
   `account_manager` assigned to that client).

Location-restricted users (those given `location_memberships`) may only access the
locations they are members of. Users without any location membership but with a
client-wide role (e.g. `client_admin`) can access all locations of that client.

### Cross-client protection

`assertSameClient(expected, actual)` is called before any operation that references a
record from a request, guaranteeing the record's `client_id` matches the authorized
context. Combined with RLS, this prevents cross-tenant reads and writes.

---

## 4. Supabase client strategy

Four distinct clients, each with a single responsibility (matches the Cursor rules):

| Client | File | Key used | Where it runs | Purpose |
| --- | --- | --- | --- | --- |
| Browser | `lib/supabase/client.ts` | anon | Client Components | Minimal client-side reads/auth UI state |
| Server | `lib/supabase/server.ts` | anon (+ user cookie) | Server Components / actions / route handlers | RLS-enforced access in user context |
| Middleware | `lib/supabase/middleware.ts` | anon (+ cookie) | Edge/middleware | Refresh & propagate session cookies |
| Admin | `lib/supabase/admin.ts` | **service role** | Trusted server only | Seeding, webhooks, admin tasks that bypass RLS |

Rules enforced in code and review:

- The **service-role key is never imported into any client component** and is only read
  from a server-only environment variable. `lib/supabase/admin.ts` guards against browser
  use.
- The server client uses the request's cookies so RLS applies with the user's identity.
- The browser client only ever uses the public anon key.

---

## 5. Server and client component boundaries

- **Server Components are the default.** All data access and authorization happen on the
  server.
- **Client Components** (`"use client"`) are used only for interactivity: forms with
  local state, buttons that invoke server actions, and small UI widgets.
- Mutations are performed with **server actions** (or route handlers for webhooks/OAuth),
  which re-validate authorization and input on every call.
- No database queries and no privileged keys are ever placed in client components.

---

## 6. Data-access patterns

- Feature code accesses the database through the **server Supabase client** obtained per
  request; it does not hold long-lived global clients.
- Every client-owned query filters by the authorized `client_id` (resolved from
  membership) **and** relies on RLS as a backstop.
- Writes go through server actions that: (1) authenticate, (2) authorize
  (membership/role/location), (3) validate input with Zod, (4) perform the mutation,
  (5) audit when the action is high-risk.
- Generated database types (`src/types/database.ts`) provide end-to-end typing; they are
  regenerated after every migration.
- Repeated raw role comparisons in components are forbidden — use permission helpers.

---

## 7. Validation strategy

- **Zod** validates all external input: forms, route params, search params, API/webhook
  payloads, AI outputs, and integration responses.
- Schemas live beside their feature (`features/<x>/schemas.ts`) or in
  `lib/validation` when shared.
- Server actions parse input with `schema.safeParse` and return **field-specific**
  errors; entered values are preserved on error.
- The environment is validated once at startup by `config/env.ts` using Zod; invalid or
  missing variables fail fast with a clear message.

---

## 8. Error-handling strategy

- **Structured errors:** a small `AppError` hierarchy distinguishes `AuthError`,
  `ForbiddenError`, `ValidationError`, and `NotFoundError`.
- Server actions return a typed result (`{ ok: true, data }` or
  `{ ok: false, error }`) rather than throwing across the client boundary.
- UI shows friendly messages; technical details are logged server-side only.
- No credentials, tokens, stack traces, or internal DB details are ever returned to the
  client.
- App Router `error.tsx` / `not-found.tsx` provide global fallbacks; each route segment
  can add its own.
- Automation and integration failures will be recorded in `automation_runs` (Phase 9)
  with idempotency to prevent duplicate execution on retry.

---

## 9. Audit logging strategy

- High-risk and sensitive actions (auth events, membership/role changes, approvals,
  publications, cross-client administrative actions) are recorded.
- The full `audit_logs` table (actor, action, entity, old/new values, ip, timestamp) is
  introduced in Phase 9 per the database design; **client users can never modify audit
  logs** (enforced by RLS: insert/select only, no update/delete for client roles).
- Foundational hooks are structured so that adding audit writes in later phases does not
  require refactoring the authorization layer.
- Sensitive personal information is kept out of logs.

---

## 10. Testing strategy

Testing focuses on high-risk logic identified in the Cursor rules:

- **Tenant isolation** — a user cannot read/write another client's data.
- **Role & permission checks** — the permission catalog returns correct decisions per
  role and context.
- **Location access** — location-restricted users are blocked from other locations.
- **Platform access** — super_admin / market_studio_admin / assigned account_manager can
  access permitted client data.
- **Input validation** — invalid form and API inputs are rejected with field errors.
- **Auth guards** — unauthenticated users are redirected away from protected routes.

Tooling: **Vitest** for unit/integration tests. Pure authorization logic is tested
directly against helper functions with fixture data. RLS policies are documented and
reviewed, and are additionally exercisable against a local Supabase instance. Tests must
cover happy path, unauthorized access, invalid input, and empty states.
