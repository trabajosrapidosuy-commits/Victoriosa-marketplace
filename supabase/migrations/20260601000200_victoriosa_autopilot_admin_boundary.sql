-- Autopilot persistence hardening. Internal data remains admin-only.
alter table public.autopilot_discovery_runs
  add column if not exists query text,
  add column if not exists category text,
  add column if not exists country_target text,
  add column if not exists min_margin numeric,
  add column if not exists max_results int,
  add column if not exists started_at timestamptz,
  add column if not exists error_message text,
  add column if not exists created_by uuid references auth.users(id);

alter table public.autopilot_product_candidates
  add column if not exists external_id text,
  add column if not exists category text,
  add column if not exists supplier_cost numeric not null default 0,
  add column if not exists estimated_shipping_cost numeric not null default 0,
  add column if not exists suggested_price numeric not null default 0,
  add column if not exists margin_percent numeric not null default 0,
  add column if not exists profitability_score int not null default 0,
  add column if not exists viral_score int not null default 0,
  add column if not exists compliance_score int not null default 0,
  add column if not exists logistics_score int not null default 0,
  add column if not exists supplier_score int not null default 0,
  add column if not exists total_score int not null default 0,
  add column if not exists currency text not null default 'USD',
  add column if not exists image_urls text[] not null default '{}',
  add column if not exists review_status text not null default 'pending_admin_review',
  add column if not exists rejection_reason text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists imported_product_id uuid references public.marketplace_products(id);

create table if not exists public.autopilot_ai_product_drafts (
  id uuid primary key default gen_random_uuid(),
  product_candidate_id uuid not null references public.autopilot_product_candidates(id) on delete cascade,
  generated_title text not null,
  generated_subtitle text,
  generated_description text not null default '',
  benefits text[] not null default '{}',
  usage_instructions text,
  seo_title text,
  seo_description text,
  tags text[] not null default '{}',
  instagram_caption text,
  tiktok_caption text,
  whatsapp_text text,
  email_subject text,
  email_body text,
  ad_angle text,
  warnings text[] not null default '{}',
  faq jsonb not null default '[]'::jsonb,
  status text not null default 'draft_review_only' check (status in ('draft_review_only','approved_for_manual_use','rejected','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.autopilot_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.autopilot_discovery_runs(id) on delete cascade,
  candidate_id uuid references public.autopilot_product_candidates(id) on delete cascade,
  level text not null check (level in ('info','warning','error')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.autopilot_campaign_drafts (
  id uuid primary key default gen_random_uuid(),
  product_candidate_id uuid references public.autopilot_product_candidates(id) on delete cascade,
  channel text not null check (channel in ('email','whatsapp')),
  subject text,
  body text not null,
  status text not null default 'draft_review_only' check (status in ('draft_review_only','approved_for_manual_export','archived')),
  requires_verified_opt_in boolean not null default true,
  send_enabled boolean not null default false check (send_enabled = false),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.autopilot_marketing_opt_ins (
  id uuid primary key default gen_random_uuid(),
  contact_hash text not null unique,
  channel text not null check (channel in ('email','whatsapp')),
  consent_source text not null,
  consented_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.autopilot_ai_product_drafts enable row level security;
alter table public.autopilot_logs enable row level security;
alter table public.autopilot_campaign_drafts enable row level security;
alter table public.autopilot_marketing_opt_ins enable row level security;

create or replace function public.is_autopilot_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.marketplace_profiles
    where id = auth.uid() and role in ('admin','marketplace_admin')
  )
$$;

revoke all on function public.is_autopilot_admin() from public;
revoke all on function public.is_autopilot_admin() from anon;
grant execute on function public.is_autopilot_admin() to authenticated;

drop policy if exists "autopilot connectors admin all" on public.autopilot_supplier_connectors;
drop policy if exists "autopilot discovery runs admin all" on public.autopilot_discovery_runs;
drop policy if exists "autopilot candidates admin all" on public.autopilot_product_candidates;

create policy "autopilot connectors strict admin all" on public.autopilot_supplier_connectors for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot discovery runs strict admin all" on public.autopilot_discovery_runs for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot candidates strict admin all" on public.autopilot_product_candidates for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot ai drafts strict admin all" on public.autopilot_ai_product_drafts for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot logs strict admin all" on public.autopilot_logs for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot campaign drafts strict admin all" on public.autopilot_campaign_drafts for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot marketing opt ins strict admin all" on public.autopilot_marketing_opt_ins for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());

revoke all on public.autopilot_supplier_connectors from anon;
revoke all on public.autopilot_discovery_runs from anon;
revoke all on public.autopilot_product_candidates from anon;
revoke all on public.autopilot_ai_product_drafts from anon;
revoke all on public.autopilot_logs from anon;
revoke all on public.autopilot_campaign_drafts from anon;
revoke all on public.autopilot_marketing_opt_ins from anon;

grant select, insert, update, delete on public.autopilot_supplier_connectors to authenticated;
grant select, insert, update, delete on public.autopilot_discovery_runs to authenticated;
grant select, insert, update, delete on public.autopilot_product_candidates to authenticated;
grant select, insert, update, delete on public.autopilot_ai_product_drafts to authenticated;
grant select, insert, update, delete on public.autopilot_logs to authenticated;
grant select, insert, update, delete on public.autopilot_campaign_drafts to authenticated;
grant select, insert, update, delete on public.autopilot_marketing_opt_ins to authenticated;
