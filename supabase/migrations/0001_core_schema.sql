-- Market Studio — Phase 1 core schema.
-- Tables: profiles, clients, client_memberships, client_locations, location_memberships.
-- Includes foreign keys, indexes, constraints, and updated_at triggers.
-- Row Level Security policies are added in migration 0002.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Shared trigger: maintain updated_at.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — application profile linked 1:1 to auth.users.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  platform_role text not null default 'client_user'
    check (platform_role in (
      'super_admin', 'market_studio_admin', 'account_manager', 'client_user'
    )),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_platform_role_idx on public.profiles (platform_role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- clients — the top-level tenant (a daycare business).
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  slug text not null unique,
  website_url text,
  primary_email text,
  primary_phone text,
  country_code text not null default 'CA',
  timezone text not null default 'America/Edmonton',
  status text not null default 'prospect'
    check (status in (
      'prospect', 'onboarding', 'active', 'paused', 'cancelled', 'archived'
    )),
  assigned_account_manager_id uuid references public.profiles (id) on delete set null,
  subscription_plan text,
  onboarding_status text not null default 'not_started',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_status_idx on public.clients (status);
create index clients_assigned_am_idx on public.clients (assigned_account_manager_id);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- client_memberships — associates users with clients (client-level roles).
-- ---------------------------------------------------------------------------
create table public.client_memberships (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null
    check (role in (
      'client_admin', 'location_manager', 'staff', 'viewer',
      'market_studio_account_manager'
    )),
  is_active boolean not null default true,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_memberships_client_profile_key unique (client_id, profile_id)
);

create index client_memberships_client_id_idx on public.client_memberships (client_id);
create index client_memberships_profile_id_idx on public.client_memberships (profile_id);
create index client_memberships_active_idx
  on public.client_memberships (profile_id, is_active);

create trigger client_memberships_set_updated_at
  before update on public.client_memberships
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- client_locations — daycare locations belonging to a client.
-- ---------------------------------------------------------------------------
create table public.client_locations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  slug text not null,
  internal_name text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  province_code text not null,
  postal_code text not null,
  country_code text not null default 'CA',
  latitude numeric,
  longitude numeric,
  phone text,
  email text,
  website_url text,
  google_business_profile_url text,
  timezone text not null default 'America/Edmonton',
  opening_date date,
  status text not null default 'planned'
    check (status in (
      'planned', 'coming_soon', 'active', 'temporarily_closed', 'closed', 'archived'
    )),
  capacity_status text,
  accepting_registrations boolean not null default false,
  tour_booking_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_locations_client_slug_key unique (client_id, slug)
);

create index client_locations_client_id_idx on public.client_locations (client_id);
create index client_locations_status_idx on public.client_locations (client_id, status);

create trigger client_locations_set_updated_at
  before update on public.client_locations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- location_memberships — restricts users to specific locations.
-- ---------------------------------------------------------------------------
create table public.location_memberships (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  location_id uuid not null references public.client_locations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null
    check (role in (
      'client_admin', 'location_manager', 'staff', 'viewer',
      'market_studio_account_manager'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint location_memberships_location_profile_key unique (location_id, profile_id)
);

create index location_memberships_client_id_idx
  on public.location_memberships (client_id);
create index location_memberships_location_id_idx
  on public.location_memberships (location_id);
create index location_memberships_profile_id_idx
  on public.location_memberships (profile_id);

create trigger location_memberships_set_updated_at
  before update on public.location_memberships
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile whenever a new auth user is created.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, platform_role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'client_user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
