-- AI Presence Audit storage.
-- Ported from the earlier audit prototype. Audits describe prospects (not yet clients),
-- so records are not tenant-scoped. RLS is enabled with no authenticated policies:
-- reads/writes only happen through the trusted service-role server path.

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  city text not null,
  website_url text not null,
  gbp_url text,
  review_count integer,
  average_rating numeric(2, 1),
  competitors text,
  notes text,
  visibility_score numeric(3, 1) not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists audits_created_at_idx on public.audits (created_at desc);
create index if not exists audits_business_name_idx on public.audits (business_name);

alter table public.audits enable row level security;

-- Service-role bypasses RLS; grant so the key can operate on the table.
grant all on table public.audits to service_role;
