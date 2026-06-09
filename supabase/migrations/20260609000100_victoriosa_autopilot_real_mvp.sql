-- Migration to add review notes, decision logs, compliance checks, and admin actions for Autopilot real MVP.
-- Do not apply to production without explicit authorization.

-- Review notes table
create table if not exists public.autopilot_review_notes (
  id uuid primary key default gen_random_uuid(),
  brand_candidate_id uuid references public.autopilot_brand_candidates(id) on delete cascade,
  product_candidate_id uuid references public.autopilot_product_candidates(id) on delete cascade,
  note_type text not null default 'general' check (note_type in ('general','warning','blocker','action','decision')),
  note text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Decision logs table
create table if not exists public.autopilot_decision_logs (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('brand','product')),
  target_id uuid not null,
  decision_type text not null,
  decision_value text not null,
  rationale jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Compliance checks table
create table if not exists public.autopilot_compliance_checks (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('brand','product')),
  target_id uuid not null,
  compliance_type text not null,
  status text not null default 'pending' check (status in ('pending','passed','failed','blocked')),
  details jsonb not null default '{}'::jsonb,
  evidence_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin actions table
create table if not exists public.autopilot_admin_actions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('brand','product','run')),
  target_id uuid not null,
  action_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Enable row-level security and restrict to admins
alter table public.autopilot_review_notes enable row level security;
alter table public.autopilot_decision_logs enable row level security;
alter table public.autopilot_compliance_checks enable row level security;
alter table public.autopilot_admin_actions enable row level security;

create policy "autopilot review notes admin only" on public.autopilot_review_notes
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot decision logs admin only" on public.autopilot_decision_logs
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot compliance checks admin only" on public.autopilot_compliance_checks
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot admin actions admin only" on public.autopilot_admin_actions
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());

revoke all on public.autopilot_review_notes from anon;
revoke all on public.autopilot_decision_logs from anon;
revoke all on public.autopilot_compliance_checks from anon;
revoke all on public.autopilot_admin_actions from anon;

grant select, insert, update, delete on public.autopilot_review_notes to authenticated;
grant select, insert, update, delete on public.autopilot_decision_logs to authenticated;
grant select, insert, update, delete on public.autopilot_compliance_checks to authenticated;
grant select, insert, update, delete on public.autopilot_admin_actions to authenticated;
