Market Studio Database Design
1. Database Principles
The database must support:
•	Multiple Market Studio clients
•	Multiple daycare locations per client
•	Multiple users per client
•	Location-level permissions
•	Marketing content
•	Leads and communications
•	Appointments
•	Campaigns
•	AI recommendations
•	Automation logs
•	Audit logs
•	Third-party integrations
PostgreSQL through Supabase will be the initial database.
All primary keys should use UUIDs unless there is a strong technical reason not to.
All tables should normally include:
•	id
•	created_at
•	updated_at
Tables containing client-owned data should include:
•	client_id
Location-specific tables should also include:
•	location_id
Use timestamptz for timestamps.
Use lowercase snake_case for database names.
________________________________________
2. Multi-Tenant Structure
The top-level tenant is a client.
A client may have:
•	Multiple locations
•	Multiple users
•	Multiple campaigns
•	Multiple leads
•	One primary brand profile (MVP; unique per client)
•	Multiple integrations
Every query involving client data must enforce tenant isolation.
Row Level Security must be enabled on all client-owned tables.
________________________________________
3. Authentication and Users
Supabase Authentication should manage authentication identities.
Application-level user information should be stored separately.
Table: profiles
Purpose:
Stores application profiles connected to Supabase authentication users.
Fields:
•	id uuid primary key
•	full_name text
•	email text
•	phone text nullable
•	avatar_url text nullable
•	platform_role text
•	is_active boolean default true
•	last_login_at timestamptz nullable
•	created_at timestamptz
•	updated_at timestamptz
Suggested platform roles:
•	super_admin
•	market_studio_admin
•	account_manager
•	client_user
Do not use profiles.platform_role alone for client-level authorization.
________________________________________
4. Clients and Memberships
Table: clients
Purpose:
Stores each daycare business or Market Studio client.
Fields:
•	id uuid primary key
•	name text
•	legal_name text nullable
•	slug text unique
•	website_url text nullable
•	primary_email text nullable
•	primary_phone text nullable
•	country_code text default 'CA'
•	timezone text
•	status text
•	assigned_account_manager_id uuid nullable
•	subscription_plan text nullable
•	onboarding_status text
•	onboarding_completed_at timestamptz nullable
•	marketing_goals text nullable
•	created_at timestamptz
•	updated_at timestamptz
Suggested statuses:
•	prospect
•	onboarding
•	active
•	paused
•	cancelled
•	archived
Suggested onboarding_status values:
•	not_started
•	in_progress
•	completed
•	blocked
________________________________________
Table: onboarding_tasks
Purpose:
Tracks the per-client onboarding checklist (structured intake; no AI in Phase 4).
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	task_key text
•	title text
•	description text nullable
•	sort_order integer
•	is_required boolean default true
•	status text
•	notes text nullable
•	completed_at timestamptz nullable
•	completed_by uuid nullable (profiles)
•	created_at timestamptz
•	updated_at timestamptz
Suggested task statuses:
•	pending
•	in_progress
•	completed
•	skipped
Add a unique constraint on:
•	client_id
•	task_key
Default task_key values:
•	client_profile
•	locations
•	business_hours
•	brand_profile
•	faqs
•	programs
•	members
•	marketing_goals
________________________________________
Table: client_memberships
Purpose:
Associates users with clients.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	profile_id uuid foreign key
•	role text
•	is_active boolean default true
•	invited_at timestamptz nullable
•	accepted_at timestamptz nullable
•	created_at timestamptz
•	updated_at timestamptz
Suggested roles:
•	client_admin
•	location_manager
•	staff
•	viewer
•	market_studio_account_manager
Add a unique constraint on:
•	client_id
•	profile_id
________________________________________
5. Locations
Table: client_locations
Purpose:
Stores daycare locations.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	name text
•	slug text
•	internal_name text nullable
•	address_line_1 text
•	address_line_2 text nullable
•	city text
•	province_code text
•	postal_code text
•	country_code text default 'CA'
•	latitude numeric nullable
•	longitude numeric nullable
•	phone text nullable
•	email text nullable
•	website_url text nullable
•	google_business_profile_url text nullable
•	timezone text
•	opening_date date nullable
•	status text
•	capacity_status text nullable
•	accepting_registrations boolean default false
•	tour_booking_enabled boolean default false
•	created_at timestamptz
•	updated_at timestamptz
Suggested statuses:
•	planned
•	coming_soon
•	active
•	temporarily_closed
•	closed
•	archived
Add a unique constraint on:
•	client_id
•	slug
________________________________________
Table: location_memberships
Purpose:
Restricts users to specific locations.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid foreign key
•	profile_id uuid foreign key
•	role text
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
Table: location_business_hours
Purpose:
Stores operating and tour hours.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid foreign key
•	day_of_week smallint
•	open_time time nullable
•	close_time time nullable
•	is_closed boolean default false
•	hours_type text default 'operating'
•	created_at timestamptz
•	updated_at timestamptz
Suggested hours_type values:
•	operating
•	tour
•	office
________________________________________
6. Brand Profiles
Table: brand_profiles
Purpose:
Stores the approved marketing identity for a client.
Constraint: unique `client_id` (one profile per client in MVP).
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	name text
•	business_summary text nullable
•	mission_statement text nullable
•	brand_voice text nullable
•	primary_colour text nullable
•	secondary_colour text nullable
•	accent_colour text nullable
•	logo_url text nullable
•	target_audience jsonb
•	unique_selling_points jsonb
•	content_pillars jsonb
•	approved_claims jsonb
•	restricted_claims jsonb
•	approved_ctas jsonb
•	status text
•	approved_by uuid nullable
•	approved_at timestamptz nullable
•	created_at timestamptz
•	updated_at timestamptz
Suggested statuses:
•	draft
•	review
•	approved
•	archived
________________________________________
Table: client_faqs
Purpose:
Stores approved answers used by staff and AI agents.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	question text
•	answer text
•	category text nullable
•	is_ai_usable boolean default false
•	status text
•	approved_by uuid nullable
•	approved_at timestamptz nullable
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
7. Programs
Table: programs
Purpose:
Stores programs offered by a client.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	name text
•	description text nullable
•	minimum_age_months integer nullable
•	maximum_age_months integer nullable
•	status text
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
Table: location_programs
Purpose:
Associates programs with locations.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid foreign key
•	program_id uuid foreign key
•	is_available boolean default true
•	accepting_registrations boolean default false
•	availability_notes text nullable
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
8. Content Management
Table: content_items
Purpose:
Stores all planned and published marketing content.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	content_type text
•	title text nullable
•	objective text nullable
•	caption text nullable
•	body text nullable
•	call_to_action text nullable
•	platforms jsonb
•	status text
•	scheduled_at timestamptz nullable
•	published_at timestamptz nullable
•	created_by uuid nullable
•	generated_by_ai boolean default false
•	ai_generation_id uuid nullable
•	created_at timestamptz
•	updated_at timestamptz
Suggested content types:
•	instagram_post
•	facebook_post
•	reel
•	story
•	carousel
•	google_business_post
•	blog
•	email
•	sms
•	advertisement
Suggested statuses:
•	draft
•	ai_generated
•	internal_review
•	client_review
•	changes_requested
•	approved
•	scheduled
•	published
•	failed
•	archived
________________________________________
Table: content_assets
Purpose:
Stores files associated with content.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	content_item_id uuid foreign key
•	asset_type text
•	storage_path text
•	public_url text nullable
•	mime_type text nullable
•	file_size_bytes bigint nullable
•	width integer nullable
•	height integer nullable
•	alt_text text nullable
•	created_at timestamptz
________________________________________
Table: content_approvals
Purpose:
Stores approval history.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	content_item_id uuid foreign key
•	reviewer_id uuid foreign key
•	decision text
•	comments text nullable
•	created_at timestamptz
Suggested decisions:
•	approved
•	changes_requested
•	rejected
Do not overwrite previous approval records.
________________________________________
Table: content_publications
Purpose:
Stores publication attempts and results.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	content_item_id uuid foreign key
•	platform text
•	platform_account_id text nullable
•	external_post_id text nullable
•	status text
•	published_at timestamptz nullable
•	error_message text nullable
•	response_payload jsonb nullable
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
9. Campaigns
Table: campaigns
Purpose:
Stores marketing campaigns across channels.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	name text
•	channel text
•	campaign_type text
•	objective text nullable
•	status text
•	start_date date nullable
•	end_date date nullable
•	budget numeric nullable
•	currency_code text default 'CAD'
•	external_campaign_id text nullable
•	landing_page_url text nullable
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
Table: campaign_metrics
Purpose:
Stores daily campaign performance.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	campaign_id uuid foreign key
•	metric_date date
•	impressions bigint default 0
•	reach bigint default 0
•	clicks bigint default 0
•	spend numeric default 0
•	leads integer default 0
•	qualified_leads integer default 0
•	tours_booked integer default 0
•	enrolments integer default 0
•	revenue numeric nullable
•	raw_metrics jsonb nullable
•	created_at timestamptz
•	updated_at timestamptz
Add a unique constraint on:
•	campaign_id
•	metric_date
________________________________________
10. Leads
Table: leads
Purpose:
Stores prospective parent or guardian enquiries.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	assigned_to uuid nullable
•	first_name text nullable
•	last_name text nullable
•	email text nullable
•	normalized_email text nullable
•	phone text nullable
•	normalized_phone text nullable
•	preferred_contact_method text nullable
•	child_age_months integer nullable
•	age_group text nullable
•	program_id uuid nullable
•	desired_start_date date nullable
•	schedule_preference text nullable
•	lead_source text
•	campaign_id uuid nullable
•	status text
•	qualification_status text nullable
•	qualification_score integer nullable
•	priority text nullable
•	consent_status text
•	next_action_at timestamptz nullable
•	last_contacted_at timestamptz nullable
•	converted_at timestamptz nullable
•	closed_at timestamptz nullable
•	created_at timestamptz
•	updated_at timestamptz
Do not store detailed medical or developmental information in this table.
Suggested statuses:
•	new, contact_attempted, contacted, qualified, unqualified, tour_offered,
	tour_booked, tour_completed, tour_missed, application_started, waitlisted,
	enrolled, not_interested, no_response, duplicate, closed
Suggested lead_source values:
•	manual, website, phone, email, referral, meta, google_ads, google_business,
	walk_in, other
________________________________________
Table: lead_source_events
Purpose:
Stores every form submission or source event associated with a lead.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	lead_id uuid foreign key
•	source text
•	external_event_id text nullable
•	campaign_id uuid nullable
•	raw_payload jsonb nullable
•	received_at timestamptz
•	created_at timestamptz
This table helps preserve duplicate submissions without creating duplicate leads.
________________________________________
Table: lead_activities
Purpose:
Stores the lead timeline.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	lead_id uuid foreign key
•	activity_type text
•	title text nullable
•	description text nullable
•	performed_by uuid nullable
•	performed_by_agent text nullable
•	metadata jsonb nullable
•	created_at timestamptz
Example activity types:
•	lead_created
•	status_changed
•	note_added
•	message_sent
•	message_received
•	tour_booked
•	tour_completed
•	follow_up_scheduled
•	conversion_recorded
________________________________________
Table: lead_notes
Purpose:
Stores internal notes.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	lead_id uuid foreign key
•	author_id uuid
•	note text
•	is_pinned boolean default false
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
11. Consent
Table: lead_consents
Purpose:
Stores consent history.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	lead_id uuid foreign key
•	consent_type text
•	status text
•	source text
•	form_version text nullable
•	consent_text text nullable
•	ip_address inet nullable
•	user_agent text nullable
•	captured_at timestamptz
•	withdrawn_at timestamptz nullable
•	created_at timestamptz
Suggested consent types:
•	email_marketing
•	sms_marketing
•	phone_contact
•	privacy_policy
•	general_enquiry_follow_up
Never delete prior consent history.
________________________________________
12. Communications
Table: conversations
Purpose:
Groups communication threads.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	lead_id uuid foreign key
•	channel text
•	external_thread_id text nullable
•	status text
•	assigned_to uuid nullable
•	last_message_at timestamptz nullable
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
Table: messages
Purpose:
Stores individual messages.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	conversation_id uuid foreign key
•	lead_id uuid foreign key
•	direction text
•	channel text
•	sender_type text
•	sender_id uuid nullable
•	body text
•	status text
•	external_message_id text nullable
•	generated_by_ai boolean default false
•	requires_human_review boolean default false
•	approved_by uuid nullable
•	sent_at timestamptz nullable
•	delivered_at timestamptz nullable
•	failed_at timestamptz nullable
•	error_message text nullable
•	created_at timestamptz
________________________________________
13. Appointments
Table: appointments
Purpose:
Stores daycare tours and related appointments.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid foreign key
•	lead_id uuid foreign key
•	assigned_staff_id uuid nullable
•	appointment_type text default 'tour'
•	start_at timestamptz
•	end_at timestamptz
•	status text
•	meeting_location text nullable
•	external_calendar_event_id text nullable
•	cancellation_reason text nullable
•	outcome text nullable
•	notes text nullable
•	created_at timestamptz
•	updated_at timestamptz
Suggested statuses:
•	requested
•	confirmed
•	rescheduled
•	cancelled
•	completed
•	no_show
________________________________________
Table: appointment_reminders
Purpose:
Tracks reminder delivery.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	appointment_id uuid foreign key
•	channel text
•	scheduled_at timestamptz
•	sent_at timestamptz nullable
•	status text
•	error_message text nullable
•	created_at timestamptz
________________________________________
14. Conversions
Table: conversions
Purpose:
Stores measurable business outcomes.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	lead_id uuid foreign key
•	campaign_id uuid nullable
•	conversion_type text
•	conversion_date timestamptz
•	value numeric nullable
•	currency_code text default 'CAD'
•	source text nullable
•	external_sync_status text nullable
•	created_at timestamptz
•	updated_at timestamptz
Suggested conversion types:
•	qualified_lead
•	tour_booked
•	tour_completed
•	application_started
•	waitlisted
•	enrolled
________________________________________
15. Reviews
Table: reviews
Purpose:
Stores public reviews.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	platform text
•	external_review_id text nullable
•	reviewer_name text nullable
•	rating numeric nullable
•	review_text text nullable
•	sentiment text nullable
•	category text nullable
•	published_at timestamptz nullable
•	response_status text
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
Table: review_responses
Purpose:
Stores drafted and published review responses.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	review_id uuid foreign key
•	response_text text
•	generated_by_ai boolean default false
•	status text
•	approved_by uuid nullable
•	published_at timestamptz nullable
•	created_at timestamptz
•	updated_at timestamptz
________________________________________
16. AI and Automation
Table: ai_generations
Purpose:
Records AI-generated outputs.
Fields:
•	id uuid primary key
•	client_id uuid nullable
•	location_id uuid nullable
•	agent_type text
•	task_type text
•	model_identifier text nullable
•	prompt_version text nullable
•	input_data jsonb
•	output_data jsonb
•	status text
•	requires_approval boolean default false
•	approved_by uuid nullable
•	approved_at timestamptz nullable
•	created_at timestamptz
Avoid storing hidden model reasoning. Store only necessary inputs, outputs, decisions, and summaries.
________________________________________
Table: ai_recommendations
Purpose:
Stores actionable AI recommendations.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	recommendation_type text
•	title text
•	description text
•	supporting_data jsonb nullable
•	priority text
•	status text
•	approved_by uuid nullable
•	approved_at timestamptz nullable
•	executed_at timestamptz nullable
•	created_at timestamptz
•	updated_at timestamptz
Suggested statuses:
•	pending
•	approved
•	rejected
•	executed
•	expired
________________________________________
Table: automation_runs
Purpose:
Tracks every workflow execution.
Fields:
•	id uuid primary key
•	client_id uuid nullable
•	location_id uuid nullable
•	workflow_name text
•	workflow_version text nullable
•	trigger_type text
•	related_entity_type text nullable
•	related_entity_id uuid nullable
•	status text
•	input_data jsonb nullable
•	output_data jsonb nullable
•	error_message text nullable
•	retry_count integer default 0
•	started_at timestamptz
•	completed_at timestamptz nullable
•	created_at timestamptz
________________________________________
Table: audit_logs
Purpose:
Stores important user, system, and AI actions.
Fields:
•	id uuid primary key
•	client_id uuid nullable
•	actor_type text
•	actor_id uuid nullable
•	action text
•	entity_type text
•	entity_id uuid nullable
•	old_values jsonb nullable
•	new_values jsonb nullable
•	ip_address inet nullable
•	created_at timestamptz
Client users should not be allowed to modify audit logs.
________________________________________
17. Integrations
Table: integrations
Purpose:
Stores integration configuration without storing raw secrets.
Fields:
•	id uuid primary key
•	client_id uuid foreign key
•	location_id uuid nullable
•	provider text
•	integration_type text
•	status text
•	external_account_id text nullable
•	configuration jsonb nullable
•	secret_reference text nullable
•	last_synced_at timestamptz nullable
•	last_error text nullable
•	created_at timestamptz
•	updated_at timestamptz
Credentials must be stored through a secure secret-management system.
Do not store raw access tokens in this table.
________________________________________
18. Indexing Recommendations
Create indexes for frequently filtered fields, including:
•	client_id
•	location_id
•	status
•	created_at
•	scheduled_at
•	assigned_to
•	normalized_email
•	normalized_phone
•	lead_id
•	campaign_id
•	external_message_id
•	external_event_id
Consider composite indexes such as:
•	leads(client_id, status)
•	leads(client_id, location_id, status)
•	content_items(client_id, status, scheduled_at)
•	appointments(location_id, start_at)
•	messages(conversation_id, created_at)
•	campaign_metrics(campaign_id, metric_date)
________________________________________
19. Row Level Security
All client-owned tables must have Row Level Security enabled.
Basic policy concept:
A user may access a record only when:
1.	The record’s client_id is associated with an active client_memberships record for the authenticated user, or
2.	The authenticated user has an authorized Market Studio platform role.
Location-restricted users must also have an active location_memberships record.
Never rely only on front-end route protection.
Authorization must be enforced at the database and server levels.
________________________________________
20. Data Safety
•	Never expose service-role credentials to the browser.
•	Never store secrets in source control.
•	Validate every webhook.
•	Verify webhook signatures when supported.
•	Sanitize uploaded filenames.
•	Restrict storage-bucket access.
•	Use signed URLs for private assets.
•	Minimize collection of child information.
•	Encrypt sensitive configuration.
•	Log important authorization failures.
•	Implement retention and deletion processes.
•	Avoid placing sensitive personal information in automation logs.
________________________________________
21. Implementation Status

Cloud project: https://supabase.com/dashboard/project/fzbffrbdbrcqyatxvbol

Schema is applied to **Supabase Cloud** via `npm run db:push` (not a local Docker DB).

Phase 1–2 migrations currently on cloud:

•	profiles (0001_core_schema.sql)
•	clients (0001_core_schema.sql)
•	client_memberships (0001_core_schema.sql)
•	client_locations (0001_core_schema.sql)
•	location_memberships (0001_core_schema.sql)
•	location_business_hours (20260720065853_location_business_hours.sql)
•	Table grants for PostgREST roles (20260720063828_grants_and_privileges.sql)
•	audits (20260724120000_create_audits.sql) — AI Presence Audit storage; RLS enabled,
	service-role writes only. Not yet tenant-scoped (prospect audits).

Notes on the implementation:

•	All five tables have Row Level Security enabled with initial policies in
	0002_rls_and_helpers.sql.
•	RLS uses SECURITY DEFINER helper functions (is_platform_admin, has_client_access,
	is_client_manager, is_assigned_account_manager, has_location_access) to avoid policy
	recursion.
•	Each table has created_at/updated_at with a shared set_updated_at() trigger.
•	A handle_new_user() trigger creates a profile row automatically for each new auth user.
•	Role and status values are enforced with CHECK constraints matching the union types in
	src/types/roles.ts.
•	Column defaults added during implementation: clients.timezone defaults to
	'America/Edmonton', clients.onboarding_status defaults to 'not_started'
	with CHECK values not_started|in_progress|completed|blocked,
	clients.marketing_goals is nullable intake text,
	onboarding_tasks unique on (client_id, task_key),
	client_locations.timezone defaults to 'America/Edmonton'.

Remaining tables from this document are implemented in later phases (see
docs/implementation-roadmap.md). Regenerate src/types/database.ts with `npm run db:types`
after each migration.
________________________________________
