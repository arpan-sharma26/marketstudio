-- Phase 5: lead capture & pipeline (manual entry, activities, notes, consent).

-- ---------------------------------------------------------------------------
-- Helper: may the current user create/update leads for this client?
-- Broader than is_client_manager — includes location_manager and staff.
-- ---------------------------------------------------------------------------
create or replace function public.can_edit_leads(target_client_id uuid)
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
        and m.role in (
          'client_admin',
          'market_studio_account_manager',
          'location_manager',
          'staff'
        )
    );
$$;

revoke all on function public.can_edit_leads(uuid) from public;
grant execute on function public.can_edit_leads(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  location_id uuid references public.client_locations (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  first_name text,
  last_name text,
  email text,
  normalized_email text,
  phone text,
  normalized_phone text,
  preferred_contact_method text
    check (
      preferred_contact_method is null
      or preferred_contact_method in ('email', 'phone', 'sms', 'any')
    ),
  child_age_months integer
    check (child_age_months is null or child_age_months >= 0),
  age_group text,
  program_id uuid references public.programs (id) on delete set null,
  desired_start_date date,
  schedule_preference text
    check (
      schedule_preference is null
      or schedule_preference in ('full_time', 'part_time', 'flexible', 'unknown')
    ),
  lead_source text not null default 'manual'
    check (
      lead_source in (
        'manual',
        'website',
        'phone',
        'email',
        'referral',
        'meta',
        'google_ads',
        'google_business',
        'walk_in',
        'other'
      )
    ),
  status text not null default 'new'
    check (
      status in (
        'new',
        'contact_attempted',
        'contacted',
        'qualified',
        'unqualified',
        'tour_offered',
        'tour_booked',
        'tour_completed',
        'tour_missed',
        'application_started',
        'waitlisted',
        'enrolled',
        'not_interested',
        'no_response',
        'duplicate',
        'closed'
      )
    ),
  qualification_status text
    check (
      qualification_status is null
      or qualification_status in ('unreviewed', 'qualified', 'unqualified', 'needs_info')
    ),
  qualification_score integer
    check (
      qualification_score is null
      or (qualification_score >= 0 and qualification_score <= 100)
    ),
  priority text
    check (
      priority is null
      or priority in ('low', 'normal', 'high', 'urgent')
    ),
  consent_status text not null default 'unknown'
    check (consent_status in ('unknown', 'granted', 'denied', 'withdrawn')),
  next_action_at timestamptz,
  last_contacted_at timestamptz,
  converted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_client_id_idx on public.leads (client_id);
create index leads_client_status_idx on public.leads (client_id, status);
create index leads_client_location_status_idx
  on public.leads (client_id, location_id, status);
create index leads_normalized_email_idx on public.leads (client_id, normalized_email);
create index leads_normalized_phone_idx on public.leads (client_id, normalized_phone);
create index leads_assigned_to_idx on public.leads (assigned_to);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create or replace function public.enforce_leads_location_client()
returns trigger
language plpgsql
as $$
declare
  loc_client_id uuid;
  prog_client_id uuid;
begin
  if new.location_id is not null then
    select client_id into loc_client_id
    from public.client_locations
    where id = new.location_id;

    if loc_client_id is null then
      raise exception 'location_id % does not exist', new.location_id;
    end if;
    if new.client_id <> loc_client_id then
      raise exception 'client_id must match the location''s client';
    end if;
  end if;

  if new.program_id is not null then
    select client_id into prog_client_id
    from public.programs
    where id = new.program_id;

    if prog_client_id is null then
      raise exception 'program_id % does not exist', new.program_id;
    end if;
    if new.client_id <> prog_client_id then
      raise exception 'client_id must match the program''s client';
    end if;
  end if;

  return new;
end;
$$;

create trigger leads_enforce_location_client
  before insert or update on public.leads
  for each row execute function public.enforce_leads_location_client();

-- ---------------------------------------------------------------------------
-- lead_source_events
-- ---------------------------------------------------------------------------
create table public.lead_source_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  source text not null,
  external_event_id text,
  raw_payload jsonb,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index lead_source_events_lead_id_idx on public.lead_source_events (lead_id);
create index lead_source_events_client_id_idx on public.lead_source_events (client_id);

-- ---------------------------------------------------------------------------
-- lead_activities
-- ---------------------------------------------------------------------------
create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  activity_type text not null
    check (
      activity_type in (
        'lead_created',
        'status_changed',
        'note_added',
        'assigned',
        'consent_updated',
        'source_event',
        'follow_up_scheduled',
        'contact_logged',
        'conversion_recorded',
        'other'
      )
    ),
  title text,
  description text,
  performed_by uuid references public.profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index lead_activities_lead_id_idx
  on public.lead_activities (lead_id, created_at desc);
create index lead_activities_client_id_idx on public.lead_activities (client_id);

-- ---------------------------------------------------------------------------
-- lead_notes
-- ---------------------------------------------------------------------------
create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  note text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lead_notes_lead_id_idx on public.lead_notes (lead_id, created_at desc);

create trigger lead_notes_set_updated_at
  before update on public.lead_notes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- lead_consents
-- ---------------------------------------------------------------------------
create table public.lead_consents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  consent_type text not null
    check (
      consent_type in (
        'email_marketing',
        'sms_marketing',
        'phone_contact',
        'privacy_policy',
        'general_enquiry_follow_up'
      )
    ),
  status text not null
    check (status in ('granted', 'denied', 'withdrawn')),
  source text,
  form_version text,
  consent_text text,
  captured_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now()
);

create index lead_consents_lead_id_idx on public.lead_consents (lead_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.leads enable row level security;
alter table public.lead_source_events enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_consents enable row level security;

-- leads
create policy "leads_select"
  on public.leads for select
  to authenticated
  using (
    public.has_client_access(client_id)
    and (
      location_id is null
      or public.has_location_access(location_id)
    )
  );

create policy "leads_insert"
  on public.leads for insert
  to authenticated
  with check (
    public.can_edit_leads(client_id)
    and (
      location_id is null
      or public.has_location_access(location_id)
    )
  );

create policy "leads_update"
  on public.leads for update
  to authenticated
  using (
    public.can_edit_leads(client_id)
    and (
      location_id is null
      or public.has_location_access(location_id)
    )
  )
  with check (
    public.can_edit_leads(client_id)
    and (
      location_id is null
      or public.has_location_access(location_id)
    )
  );

create policy "leads_delete"
  on public.leads for delete
  to authenticated
  using (public.is_client_manager(client_id));

-- Child tables: access via parent lead client + can_edit for writes
create policy "lead_source_events_select"
  on public.lead_source_events for select
  to authenticated
  using (public.has_client_access(client_id));

create policy "lead_source_events_insert"
  on public.lead_source_events for insert
  to authenticated
  with check (public.can_edit_leads(client_id));

create policy "lead_activities_select"
  on public.lead_activities for select
  to authenticated
  using (public.has_client_access(client_id));

create policy "lead_activities_insert"
  on public.lead_activities for insert
  to authenticated
  with check (public.can_edit_leads(client_id));

create policy "lead_notes_select"
  on public.lead_notes for select
  to authenticated
  using (public.has_client_access(client_id));

create policy "lead_notes_insert"
  on public.lead_notes for insert
  to authenticated
  with check (public.can_edit_leads(client_id));

create policy "lead_notes_update"
  on public.lead_notes for update
  to authenticated
  using (public.can_edit_leads(client_id))
  with check (public.can_edit_leads(client_id));

create policy "lead_notes_delete"
  on public.lead_notes for delete
  to authenticated
  using (public.can_edit_leads(client_id));

create policy "lead_consents_select"
  on public.lead_consents for select
  to authenticated
  using (public.has_client_access(client_id));

create policy "lead_consents_insert"
  on public.lead_consents for insert
  to authenticated
  with check (public.can_edit_leads(client_id));

grant all on table public.leads to postgres, anon, authenticated, service_role;
grant all on table public.lead_source_events to postgres, anon, authenticated, service_role;
grant all on table public.lead_activities to postgres, anon, authenticated, service_role;
grant all on table public.lead_notes to postgres, anon, authenticated, service_role;
grant all on table public.lead_consents to postgres, anon, authenticated, service_role;
