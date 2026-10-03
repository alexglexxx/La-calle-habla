create table if not exists public.work_orders (
  id text primary key,
  report_id text not null references public.reports(id) on delete cascade,
  status text not null default 'draft',
  area_slug text not null,
  area_name text not null,
  recipient_email text,
  contact_name text,
  instructions text,
  due_at timestamptz,
  sent_at timestamptz,
  received_at timestamptz,
  completed_at timestamptz,
  validated_at timestamptz,
  validation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists work_orders_report_unique on public.work_orders(report_id);
create index if not exists work_orders_status_idx on public.work_orders(status);
create index if not exists work_orders_area_idx on public.work_orders(area_slug);

create table if not exists public.work_order_evidence (
  id uuid primary key default gen_random_uuid(),
  work_order_id text not null references public.work_orders(id) on delete cascade,
  storage_key text not null,
  mime_type text not null,
  size_bytes bigint not null,
  caption text,
  received_at timestamptz not null default now()
);

create index if not exists work_order_evidence_order_idx on public.work_order_evidence(work_order_id);

alter table public.work_orders enable row level security;
alter table public.work_order_evidence enable row level security;

-- Server-side service-role access only until definitive admin roles and department
-- identities are activated. No client-facing policies are created in this task.
