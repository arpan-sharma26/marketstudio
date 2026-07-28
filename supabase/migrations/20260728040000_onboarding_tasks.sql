-- Phase 4: onboarding checklist + structured intake (no AI).

-- ---------------------------------------------------------------------------
-- clients: constrain onboarding_status + marketing goals intake field
-- ---------------------------------------------------------------------------
update public.clients
set onboarding_status = 'not_started'
where onboarding_status is null
   or onboarding_status not in ('not_started', 'in_progress', 'completed', 'blocked');

alter table public.clients
  drop constraint if exists clients_onboarding_status_check;

alter table public.clients
  add constraint clients_onboarding_status_check
  check (
    onboarding_status in ('not_started', 'in_progress', 'completed', 'blocked')
  );

alter table public.clients
  add column if not exists marketing_goals text;

-- ---------------------------------------------------------------------------
-- onboarding_tasks
-- ---------------------------------------------------------------------------
create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  task_key text not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_required boolean not null default true,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'skipped')),
  notes text,
  completed_at timestamptz,
  completed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint onboarding_tasks_client_task_key_unique unique (client_id, task_key)
);

create index onboarding_tasks_client_id_idx on public.onboarding_tasks (client_id);
create index onboarding_tasks_client_status_idx
  on public.onboarding_tasks (client_id, status);

create trigger onboarding_tasks_set_updated_at
  before update on public.onboarding_tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.onboarding_tasks enable row level security;

create policy "onboarding_tasks_select"
  on public.onboarding_tasks for select
  to authenticated
  using (public.has_client_access(client_id));

create policy "onboarding_tasks_insert"
  on public.onboarding_tasks for insert
  to authenticated
  with check (public.is_client_manager(client_id));

create policy "onboarding_tasks_update"
  on public.onboarding_tasks for update
  to authenticated
  using (public.is_client_manager(client_id))
  with check (public.is_client_manager(client_id));

create policy "onboarding_tasks_delete"
  on public.onboarding_tasks for delete
  to authenticated
  using (public.is_client_manager(client_id));

grant all on table public.onboarding_tasks
  to postgres, anon, authenticated, service_role;
