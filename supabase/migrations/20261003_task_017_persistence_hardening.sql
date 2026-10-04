-- TASK 017
-- Supabase becomes the production persistence contract for citizen reports.
-- This migration only hardens the existing TASK-012 schema.
-- It does NOT enable institutional communication, work orders, acknowledgements,
-- departmental delivery, or any resolved/repair workflow.

create index if not exists reports_created_at_idx
  on public.reports(created_at desc);

create index if not exists reports_location_details_gin_idx
  on public.reports using gin(location_details);

create index if not exists reports_active_category_created_idx
  on public.reports(category, created_at desc)
  where status not in ('closed', 'duplicate');

create index if not exists reports_active_neighborhood_created_idx
  on public.reports(neighborhood, created_at desc)
  where status not in ('closed', 'duplicate');

create index if not exists report_evidence_received_at_idx
  on public.report_evidence(received_at desc);

create index if not exists processed_messages_status_idx
  on public.processed_messages(status);

-- Defense in depth: citizen-facing roles receive no direct table access here.
-- The server-side REST client uses SUPABASE_SERVICE_ROLE_KEY only.
-- Never expose that key through NEXT_PUBLIC_* variables.
