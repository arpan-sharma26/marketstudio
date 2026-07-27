-- Phase 2: location_business_hours for operating / tour / office hours.

create table public.location_business_hours (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  location_id uuid not null references public.client_locations (id) on delete cascade,
  day_of_week smallint not null
    check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  hours_type text not null default 'operating'
    check (hours_type in ('operating', 'tour', 'office')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint location_business_hours_unique
    unique (location_id, day_of_week, hours_type),
  constraint location_business_hours_times_check
    check (
      is_closed = true
      or (open_time is not null and close_time is not null and open_time < close_time)
    )
);

create index location_business_hours_client_id_idx
  on public.location_business_hours (client_id);
create index location_business_hours_location_id_idx
  on public.location_business_hours (location_id);

create trigger location_business_hours_set_updated_at
  before update on public.location_business_hours
  for each row execute function public.set_updated_at();

-- Ensure the location belongs to the same client as the hours row.
create or replace function public.enforce_location_business_hours_client()
returns trigger
language plpgsql
as $$
declare
  loc_client_id uuid;
begin
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

create trigger location_business_hours_enforce_client
  before insert or update on public.location_business_hours
  for each row execute function public.enforce_location_business_hours_client();

alter table public.location_business_hours enable row level security;

create policy "location_business_hours_select"
  on public.location_business_hours for select
  to authenticated
  using (public.has_location_access(location_id));

create policy "location_business_hours_insert"
  on public.location_business_hours for insert
  to authenticated
  with check (public.is_client_manager(client_id));

create policy "location_business_hours_update"
  on public.location_business_hours for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (public.is_client_manager(client_id));

create policy "location_business_hours_delete"
  on public.location_business_hours for delete
  to authenticated
  using (public.is_client_manager(client_id));

grant all on table public.location_business_hours
  to postgres, anon, authenticated, service_role;
