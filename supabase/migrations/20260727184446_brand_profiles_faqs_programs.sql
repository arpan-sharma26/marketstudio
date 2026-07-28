-- Phase 3: brand_profiles, client_faqs, programs, location_programs.

-- ---------------------------------------------------------------------------
-- brand_profiles (one active marketing identity per client)
-- ---------------------------------------------------------------------------
create table public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  business_summary text,
  mission_statement text,
  brand_voice text,
  primary_colour text,
  secondary_colour text,
  accent_colour text,
  logo_url text,
  target_audience jsonb not null default '[]'::jsonb,
  unique_selling_points jsonb not null default '[]'::jsonb,
  content_pillars jsonb not null default '[]'::jsonb,
  approved_claims jsonb not null default '[]'::jsonb,
  restricted_claims jsonb not null default '[]'::jsonb,
  approved_ctas jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'archived')),
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brand_profiles_client_id_unique unique (client_id)
);

create index brand_profiles_client_id_idx on public.brand_profiles (client_id);
create index brand_profiles_status_idx on public.brand_profiles (status);

create trigger brand_profiles_set_updated_at
  before update on public.brand_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- client_faqs
-- ---------------------------------------------------------------------------
create table public.client_faqs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  location_id uuid references public.client_locations (id) on delete cascade,
  question text not null,
  answer text not null,
  category text,
  is_ai_usable boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'archived')),
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_faqs_client_id_idx on public.client_faqs (client_id);
create index client_faqs_location_id_idx on public.client_faqs (location_id);
create index client_faqs_status_idx on public.client_faqs (status);

create trigger client_faqs_set_updated_at
  before update on public.client_faqs
  for each row execute function public.set_updated_at();

create or replace function public.enforce_client_faqs_location_client()
returns trigger
language plpgsql
as $$
declare
  loc_client_id uuid;
begin
  if new.location_id is null then
    return new;
  end if;

  select client_id into loc_client_id
  from public.client_locations
  where id = new.location_id;

  if loc_client_id is null then
    raise exception 'location_id % does not exist', new.location_id;
  end if;

  if new.client_id <> loc_client_id then
    raise exception 'client_id must match the location''s client';
  end if;

  return new;
end;
$$;

create trigger client_faqs_enforce_location_client
  before insert or update on public.client_faqs
  for each row execute function public.enforce_client_faqs_location_client();

-- ---------------------------------------------------------------------------
-- programs
-- ---------------------------------------------------------------------------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  description text,
  minimum_age_months integer
    check (minimum_age_months is null or minimum_age_months >= 0),
  maximum_age_months integer
    check (maximum_age_months is null or maximum_age_months >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programs_age_range_check
    check (
      minimum_age_months is null
      or maximum_age_months is null
      or minimum_age_months <= maximum_age_months
    ),
  constraint programs_client_name_unique unique (client_id, name)
);

create index programs_client_id_idx on public.programs (client_id);
create index programs_status_idx on public.programs (status);

create trigger programs_set_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- location_programs
-- ---------------------------------------------------------------------------
create table public.location_programs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  location_id uuid not null references public.client_locations (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  is_available boolean not null default true,
  accepting_registrations boolean not null default false,
  availability_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint location_programs_unique unique (location_id, program_id)
);

create index location_programs_client_id_idx on public.location_programs (client_id);
create index location_programs_location_id_idx on public.location_programs (location_id);
create index location_programs_program_id_idx on public.location_programs (program_id);

create trigger location_programs_set_updated_at
  before update on public.location_programs
  for each row execute function public.set_updated_at();

create or replace function public.enforce_location_programs_client()
returns trigger
language plpgsql
as $$
declare
  loc_client_id uuid;
  prog_client_id uuid;
begin
  select client_id into loc_client_id
  from public.client_locations
  where id = new.location_id;

  select client_id into prog_client_id
  from public.programs
  where id = new.program_id;

  if loc_client_id is null then
    raise exception 'location_id % does not exist', new.location_id;
  end if;

  if prog_client_id is null then
    raise exception 'program_id % does not exist', new.program_id;
  end if;

  if new.client_id <> loc_client_id or new.client_id <> prog_client_id then
    raise exception 'client_id must match both the location and program client';
  end if;

  return new;
end;
$$;

create trigger location_programs_enforce_client
  before insert or update on public.location_programs
  for each row execute function public.enforce_location_programs_client();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.brand_profiles enable row level security;
alter table public.client_faqs enable row level security;
alter table public.programs enable row level security;
alter table public.location_programs enable row level security;

-- brand_profiles
create policy "brand_profiles_select"
  on public.brand_profiles for select
  to authenticated
  using (public.has_client_access(client_id));

create policy "brand_profiles_insert"
  on public.brand_profiles for insert
  to authenticated
  with check (public.is_client_manager(client_id));

create policy "brand_profiles_update"
  on public.brand_profiles for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (public.is_client_manager(client_id));

create policy "brand_profiles_delete"
  on public.brand_profiles for delete
  to authenticated
  using (public.is_client_manager(client_id));

-- client_faqs
create policy "client_faqs_select"
  on public.client_faqs for select
  to authenticated
  using (
    public.has_client_access(client_id)
    and (
      location_id is null
      or public.has_location_access(location_id)
    )
  );

create policy "client_faqs_insert"
  on public.client_faqs for insert
  to authenticated
  with check (
    public.is_client_manager(client_id)
    and (
      location_id is null
      or public.has_location_access(location_id)
    )
  );

create policy "client_faqs_update"
  on public.client_faqs for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (
    public.is_client_manager(client_id)
    and (
      location_id is null
      or public.has_location_access(location_id)
    )
  );

create policy "client_faqs_delete"
  on public.client_faqs for delete
  to authenticated
  using (public.is_client_manager(client_id));

-- programs
create policy "programs_select"
  on public.programs for select
  to authenticated
  using (public.has_client_access(client_id));

create policy "programs_insert"
  on public.programs for insert
  to authenticated
  with check (public.is_client_manager(client_id));

create policy "programs_update"
  on public.programs for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (public.is_client_manager(client_id));

create policy "programs_delete"
  on public.programs for delete
  to authenticated
  using (public.is_client_manager(client_id));

-- location_programs
create policy "location_programs_select"
  on public.location_programs for select
  to authenticated
  using (public.has_location_access(location_id));

create policy "location_programs_insert"
  on public.location_programs for insert
  to authenticated
  with check (public.is_client_manager(client_id));

create policy "location_programs_update"
  on public.location_programs for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (public.is_client_manager(client_id));

create policy "location_programs_delete"
  on public.location_programs for delete
  to authenticated
  using (public.is_client_manager(client_id));

grant all on table public.brand_profiles
  to postgres, anon, authenticated, service_role;
grant all on table public.client_faqs
  to postgres, anon, authenticated, service_role;
grant all on table public.programs
  to postgres, anon, authenticated, service_role;
grant all on table public.location_programs
  to postgres, anon, authenticated, service_role;
