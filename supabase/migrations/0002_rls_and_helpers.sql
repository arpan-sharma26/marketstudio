-- Market Studio — Phase 1 Row Level Security helpers and policies.
--
-- All helper functions are SECURITY DEFINER and owned by the migration role, so their
-- internal queries bypass RLS. This is intentional and REQUIRED to avoid infinite
-- recursion (e.g. a client_memberships policy that itself reads client_memberships).
-- Each function is locked to a fixed search_path and references auth.uid().

-- ---------------------------------------------------------------------------
-- Helper: is the current user an active platform admin (super_admin / ms_admin)?
-- ---------------------------------------------------------------------------
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active
      and p.platform_role in ('super_admin', 'market_studio_admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- Helper: is the current user the assigned account manager for a client?
-- ---------------------------------------------------------------------------
create or replace function public.is_assigned_account_manager(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    join public.profiles p on p.id = auth.uid()
    where c.id = target_client_id
      and c.assigned_account_manager_id = auth.uid()
      and p.is_active
      and p.platform_role = 'account_manager'
  );
$$;

-- ---------------------------------------------------------------------------
-- Helper: may the current user access this client at all?
-- ---------------------------------------------------------------------------
create or replace function public.has_client_access(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or public.is_assigned_account_manager(target_client_id)
    or exists (
      select 1
      from public.client_memberships m
      where m.client_id = target_client_id
        and m.profile_id = auth.uid()
        and m.is_active
    );
$$;

-- ---------------------------------------------------------------------------
-- Helper: may the current user manage this client (roles / locations)?
-- ---------------------------------------------------------------------------
create or replace function public.is_client_manager(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or public.is_assigned_account_manager(target_client_id)
    or exists (
      select 1
      from public.client_memberships m
      where m.client_id = target_client_id
        and m.profile_id = auth.uid()
        and m.is_active
        and m.role in ('client_admin', 'market_studio_account_manager')
    );
$$;

-- ---------------------------------------------------------------------------
-- Helper: may the current user access this specific location?
-- Location-restricted users (those with any location membership for the client) are
-- limited to their assigned locations; client-wide members can access all locations.
-- ---------------------------------------------------------------------------
create or replace function public.has_location_access(target_location_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  loc_client_id uuid;
  has_restrictions boolean;
begin
  select client_id into loc_client_id
  from public.client_locations
  where id = target_location_id;

  if loc_client_id is null then
    return false;
  end if;

  if not public.has_client_access(loc_client_id) then
    return false;
  end if;

  if public.is_platform_admin() or public.is_assigned_account_manager(loc_client_id) then
    return true;
  end if;

  select exists (
    select 1
    from public.location_memberships lm
    where lm.client_id = loc_client_id
      and lm.profile_id = auth.uid()
  ) into has_restrictions;

  if not has_restrictions then
    -- Client-wide member: access to all locations of the client.
    return true;
  end if;

  return exists (
    select 1
    from public.location_memberships lm
    where lm.location_id = target_location_id
      and lm.profile_id = auth.uid()
  );
end;
$$;

-- ===========================================================================
-- Enable RLS on all client-owned tables.
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_memberships enable row level security;
alter table public.client_locations enable row level security;
alter table public.location_memberships enable row level security;

-- ---------------------------------------------------------------------------
-- profiles policies.
-- ---------------------------------------------------------------------------
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_platform_admin());

create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_platform_admin());

-- Only platform admins may update profiles (prevents self role-escalation via the anon
-- key). Self-service profile edits will be added later via a whitelisted RPC.
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- clients policies.
-- ---------------------------------------------------------------------------
create policy "clients_select_with_access"
  on public.clients for select
  to authenticated
  using (public.has_client_access(id));

create policy "clients_insert_platform_admin"
  on public.clients for insert
  to authenticated
  with check (public.is_platform_admin());

create policy "clients_update_manager"
  on public.clients for update
  to authenticated
  using (public.is_client_manager(id))
  with check (public.is_client_manager(id));

create policy "clients_delete_platform_admin"
  on public.clients for delete
  to authenticated
  using (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- client_memberships policies.
-- ---------------------------------------------------------------------------
create policy "client_memberships_select"
  on public.client_memberships for select
  to authenticated
  using (profile_id = auth.uid() or public.has_client_access(client_id));

create policy "client_memberships_insert_manager"
  on public.client_memberships for insert
  to authenticated
  with check (public.is_client_manager(client_id));

create policy "client_memberships_update_manager"
  on public.client_memberships for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (public.is_client_manager(client_id));

create policy "client_memberships_delete_manager"
  on public.client_memberships for delete
  to authenticated
  using (public.is_client_manager(client_id));

-- ---------------------------------------------------------------------------
-- client_locations policies.
-- ---------------------------------------------------------------------------
create policy "client_locations_select_with_access"
  on public.client_locations for select
  to authenticated
  using (public.has_client_access(client_id));

create policy "client_locations_insert_manager"
  on public.client_locations for insert
  to authenticated
  with check (public.is_client_manager(client_id));

create policy "client_locations_update_manager"
  on public.client_locations for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (public.is_client_manager(client_id));

create policy "client_locations_delete_manager"
  on public.client_locations for delete
  to authenticated
  using (public.is_client_manager(client_id));

-- ---------------------------------------------------------------------------
-- location_memberships policies.
-- ---------------------------------------------------------------------------
create policy "location_memberships_select"
  on public.location_memberships for select
  to authenticated
  using (profile_id = auth.uid() or public.has_client_access(client_id));

create policy "location_memberships_insert_manager"
  on public.location_memberships for insert
  to authenticated
  with check (public.is_client_manager(client_id));

create policy "location_memberships_update_manager"
  on public.location_memberships for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (public.is_client_manager(client_id));

create policy "location_memberships_delete_manager"
  on public.location_memberships for delete
  to authenticated
  using (public.is_client_manager(client_id));

-- ---------------------------------------------------------------------------
-- Function execution grants.
-- ---------------------------------------------------------------------------
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_assigned_account_manager(uuid) to authenticated;
grant execute on function public.has_client_access(uuid) to authenticated;
grant execute on function public.is_client_manager(uuid) to authenticated;
grant execute on function public.has_location_access(uuid) to authenticated;
