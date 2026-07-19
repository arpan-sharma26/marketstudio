# Market Studio

Market Studio is a multi-tenant, AI-powered daycare marketing and lead-management platform
for Canadian daycare businesses. This repository currently contains the **project
foundation and authentication shell** (Phases 0–1). See `docs/implementation-roadmap.md`
for the full plan and `docs/development-status.md` for current status.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth, Storage) with **Row Level Security**
- **Zod** for runtime validation
- **Vitest** for tests
- **ESLint** + **Prettier**

## Project structure

See `docs/architecture.md` for the full description. Key directories:

```
src/
├── app/          # App Router routes, layouts, error/loading boundaries
├── components/   # ui/ primitives + shared/ composites
├── features/     # feature modules (auth, ...)
├── lib/          # supabase clients, auth, permissions, validation, errors
├── types/        # shared domain + generated database types
└── config/       # typed environment validation
supabase/
├── migrations/   # SQL migrations (schema + RLS)
└── seed/         # local development seed data
docs/             # product, workflows, database design, architecture, roadmap, ADRs
```

## Getting started

### 1. Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local database)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example file and fill in values (never commit real credentials):

```bash
cp .env.example .env.local
```

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project/API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon key (RLS-protected) |
| `NEXT_PUBLIC_APP_URL` | public | App base URL for auth redirects |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Service-role key — never sent to the browser |

### 4. Start Supabase and apply migrations

```bash
supabase start
supabase db reset   # applies migrations in supabase/migrations
npm run db:types    # regenerate src/types/database.ts from the local schema
```

Use the local API URL and keys printed by `supabase start` in `.env.local`.

### 5. Seed local development data

```bash
npm run db:seed
```

This creates a Market Studio admin, one daycare client, two locations, a client admin, and
a location manager. Credentials are printed to the console (development only).

### 6. Run the app

```bash
npm run dev
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking (no emit) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run test` | Run Vitest suite |
| `npm run db:types` | Regenerate Supabase types (local) |
| `npm run db:seed` | Seed local development data |

## Security model

- Two authorization layers: centralized server-side permission helpers **and** Row Level
  Security. Front-end route protection is UX only.
- Authorization is resolved from the authenticated user's memberships — a browser-provided
  `client_id` is never trusted.
- The Supabase service-role key is server-only and never bundled into client code.

See `docs/decisions/` for architecture decision records.
