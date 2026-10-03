create extension if not exists pgcrypto;

create table if not exists public.reports (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  status text not null default 'new',
  location_text text not null,
  neighborhood text,
  zone text,
  priority text not null default 'normal',
  source text not null,
  source_message_id text,
  received_at timestamptz not null,
  validated_at timestamptz,
  closed_at timestamptz,
  evidence_count integer not null default 0,
  citizen_alias text,
  anonymous_alias text,
  phone_id text,
  location_precision text not null default 'approximate',
  privacy_notice_version text not null default 'mvp-1',
  privacy_acknowledged boolean not null default false,
  privacy_acknowledged_at timestamptz,
  sensitive_data_consent boolean not null default false,
  contains_sensitive_optional_data boolean not null default false,
  classification_status text,
  intake_channel text,
  intake_source text,
  location_details jsonb,
  location_resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists reports_source_message_id_unique
  on public.reports(source_message_id)
  where source_message_id is not null;

create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_category_idx on public.reports(category);
create index if not exists reports_received_at_idx on public.reports(received_at desc);
create index if not exists reports_phone_id_idx on public.reports(phone_id);

create table if not exists public.report_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id text not null references public.reports(id) on delete cascade,
  type text not null,
  storage_key text,
  mime_type text,
  size_bytes bigint,
  sha256 text,
  media_id text,
  message_id text,
  caption text,
  captured_at timestamptz,
  received_at timestamptz not null default now(),
  metadata jsonb
);

create unique index if not exists report_evidence_media_id_unique
  on public.report_evidence(media_id)
  where media_id is not null;

create index if not exists report_evidence_report_id_idx
  on public.report_evidence(report_id);

create table if not exists public.report_history (
  id text primary key,
  report_id text not null references public.reports(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now(),
  actor text not null default 'local_admin',
  note text,
  previous_status text,
  new_status text
);

create index if not exists report_history_report_id_idx
  on public.report_history(report_id, created_at desc);

create table if not exists public.intake_sessions (
  phone_id text primary key,
  state text not null,
  report_id text references public.reports(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists intake_sessions_expires_at_idx
  on public.intake_sessions(expires_at);

create table if not exists public.processed_messages (
  message_id text primary key,
  phone_id text,
  provider text not null,
  report_id text references public.reports(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'processing',
  payload jsonb
);

create index if not exists processed_messages_phone_id_idx
  on public.processed_messages(phone_id);

alter table public.reports enable row level security;
alter table public.report_evidence enable row level security;
alter table public.report_history enable row level security;
alter table public.intake_sessions enable row level security;
alter table public.processed_messages enable row level security;

-- TASK-012 does not create client-facing policies.
-- Server-side access uses SUPABASE_SERVICE_ROLE_KEY only.
-- Never expose that key to browser/client code.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-evidence',
  'report-evidence',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
