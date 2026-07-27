# Market Studio

Market Studio is a multi-tenant, AI-powered daycare marketing and lead-management platform
for Canadian daycare businesses. See `docs/implementation-roadmap.md` for the plan and
`docs/development-status.md` for current status.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS**
- **Supabase Cloud** (PostgreSQL, Auth, Storage) with **Row Level Security**
- **Zod** for runtime validation
- **Vitest** for tests
- **ESLint** + **Prettier**

This project targets **Supabase Cloud** (not a local Docker stack).

Cloud project: https://supabase.com/dashboard/project/fzbffrbdbrcqyatxvbol

## Project structure

See `docs/architecture.md` for the full description. Key directories:

```
src/
├── app/          # App Router routes, layouts, error/loading boundaries
├── components/   # ui/ primitives + shared/ composites
├── features/     # feature modules (auth, clients, locations, ...)
├── lib/          # supabase clients, auth, permissions, validation, errors
├── types/        # shared domain + generated database types
└── config/       # typed environment validation
supabase/
├── migrations/   # SQL migrations (schema + RLS) — pushed to cloud
└── seed/         # development seed data (runs against cloud via service role)
docs/             # product, workflows, database design, architecture, roadmap, ADRs
```

## Getting started

### 1. Prerequisites

- Node.js 20+
- Access to the Market Studio Supabase cloud project

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example file and fill in **cloud** values from the dashboard
(**Project Settings → API**):

```bash
cp .env.example .env.local
```

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | `https://fzbffrbdbrcqyatxvbol.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon / publishable key (RLS-protected) |
| `NEXT_PUBLIC_APP_URL` | public | App base URL for auth redirects |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Service-role key — never sent to the browser |

Also add `http://localhost:3000/**` under **Authentication → URL Configuration → Redirect URLs**.

### 4. Link CLI and push migrations (already done for Phase 1–2)

```bash
npx supabase link --project-ref fzbffrbdbrcqyatxvbol
npm run db:push
```

### 5. Seed development data (against cloud)

```bash
npm run db:seed
```

Creates a Market Studio admin, one daycare client, two locations, a client admin, and a
location manager. Credentials are printed to the console (development only).

### 6. Run the app

```bash
npm run dev
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js app |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run test` | Vitest suite |
| `npm run db:push` | Push migrations to **cloud** |
| `npm run db:types` | Regenerate types (linked remote / local schema) |
| `npm run db:seed` | Seed development data into the configured project |

## Security model

- Two authorization layers: centralized server-side permission helpers **and** Row Level
  Security. Front-end route protection is UX only.
- Authorization is resolved from the authenticated user's memberships — a browser-provided
  `client_id` is never trusted.
- The Supabase service-role key is server-only and never bundled into client code.

See `docs/decisions/` for architecture decision records.
