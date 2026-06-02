-- Supplier-agnostic Autopilot core. Admin-only, review-only and never auto-publishes.
-- Existing autopilot_supplier_connectors remains the canonical source registry.

alter table public.autopilot_supplier_connectors
  add column if not exists provider text,
  add column if not exists mode text not null default 'mock',
  add column if not exists config jsonb not null default '{}'::jsonb,
  add column if not exists last_success_at timestamptz,
  add column if not exists last_error text;

alter table public.autopilot_product_candidates
  add column if not exists provider text,
  add column if not exists provider_variant_id text,
  add column if not exists provider_sku text,
  add column if not exists subtitle text,
  add column if not exists image_url text,
  add column if not exists niche text not null default 'beauty',
  add column if not exists source_country text,
  add column if not exists target_country text not null default 'UY',
  add column if not exists landed_cost numeric not null default 0,
  add column if not exists inventory_total int not null default 0,
  add column if not exists verified_inventory int not null default 0,
  add column if not exists demand_signal numeric not null default 0,
  add column if not exists brand_fit_score numeric not null default 0,
  add column if not exists risk_score numeric not null default 0,
  add column if not exists content_quality_score numeric not null default 0,
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists strengths jsonb not null default '[]'::jsonb,
  add column if not exists weaknesses jsonb not null default '[]'::jsonb;

create unique index if not exists autopilot_product_candidates_provider_external_id_unique
  on public.autopilot_product_candidates(provider, external_id)
  where external_id is not null;

create table if not exists public.autopilot_review_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.autopilot_product_candidates(id) on delete cascade,
  event_type text not null check (event_type in ('discovered','scored','shortlisted','approved','rejected','imported_draft','note_added','risk_flag_added','needs_review')),
  previous_status text,
  new_status text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.autopilot_settings (
  id boolean primary key default true check (id = true),
  base_markup_percent numeric not null default 65,
  minimum_margin_percent numeric not null default 35,
  target_country text not null default 'UY',
  currency text not null default 'USD',
  primary_niche text not null default 'beauty',
  minimum_score numeric not null default 55,
  risk_threshold numeric not null default 60,
  mode text not null default 'mock' check (mode in ('mock','manual','disabled')),
  updated_at timestamptz not null default now()
);

insert into public.autopilot_settings(id) values (true) on conflict (id) do nothing;

alter table public.autopilot_review_events enable row level security;
alter table public.autopilot_settings enable row level security;

create policy "autopilot review events strict admin all" on public.autopilot_review_events
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot settings strict admin all" on public.autopilot_settings
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());

revoke all on public.autopilot_review_events from anon;
revoke all on public.autopilot_settings from anon;
grant select, insert, update, delete on public.autopilot_review_events to authenticated;
grant select, insert, update, delete on public.autopilot_settings to authenticated;
