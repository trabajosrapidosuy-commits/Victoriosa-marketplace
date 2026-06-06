-- Local-only migration for K-beauty research and review-only candidate preparation.
-- Do not apply remotely without explicit authorization.

create table if not exists public.autopilot_research_runs (
  id uuid primary key default gen_random_uuid(),
  mode text not null default 'manual_research' check (mode in ('manual_research', 'supplier_research', 'market_research')),
  title text not null,
  summary jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.autopilot_brand_candidates (
  id uuid primary key default gen_random_uuid(),
  research_run_id uuid references public.autopilot_research_runs(id) on delete set null,
  name text not null,
  country text,
  official_site_url text,
  brand_type text not null default 'professional',
  professional_fit numeric not null default 0,
  retail_fit numeric not null default 0,
  clinic_cabin_fit numeric not null default 0,
  reputation_notes text,
  evidence_urls jsonb not null default '[]'::jsonb,
  certifications_claimed jsonb not null default '[]'::jsonb,
  certifications_validation_status text not null default 'pending_validation',
  international_presence text,
  supplier_contact_url text,
  supplier_contact_email text,
  uruguay_representation_potential text not null default 'unknown',
  regulatory_risk numeric not null default 0,
  claims_risk numeric not null default 0,
  counterfeit_risk numeric not null default 0,
  estimated_margin_potential numeric not null default 0,
  differentiation_score numeric not null default 0,
  trust_score numeric not null default 0,
  profitability_score numeric not null default 0,
  total_score numeric not null default 0,
  recommendation_status text not null default 'watchlist' check (recommendation_status in ('reject', 'watchlist', 'shortlist', 'priority')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists autopilot_brand_candidates_name_unique
  on public.autopilot_brand_candidates ((lower(name)));

create table if not exists public.autopilot_supplier_contacts (
  id uuid primary key default gen_random_uuid(),
  brand_candidate_id uuid not null references public.autopilot_brand_candidates(id) on delete cascade,
  contact_channel text not null default 'web' check (contact_channel in ('email', 'web', 'instagram', 'linkedin', 'distributor')),
  contact_name text,
  contact_value text not null,
  source_url text,
  outreach_status text not null default 'not_contacted' check (outreach_status in ('not_contacted', 'draft_ready', 'contacted', 'waiting_reply', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists autopilot_supplier_contacts_brand_value_unique
  on public.autopilot_supplier_contacts(brand_candidate_id, contact_value);

create table if not exists public.autopilot_import_requirements (
  id uuid primary key default gen_random_uuid(),
  brand_candidate_id uuid not null references public.autopilot_brand_candidates(id) on delete cascade,
  country text not null default 'UY',
  checklist_status text not null default 'pending_review' check (checklist_status in ('pending_review', 'needs_legal_review', 'ready_for_supplier_validation', 'blocked')),
  requirements jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists autopilot_import_requirements_brand_country_unique
  on public.autopilot_import_requirements(brand_candidate_id, country);

alter table public.autopilot_product_candidates
  add column if not exists brand_candidate_id uuid references public.autopilot_brand_candidates(id) on delete set null,
  add column if not exists product_type text,
  add column if not exists target_concern text,
  add column if not exists short_description text,
  add column if not exists detected_claims jsonb not null default '[]'::jsonb,
  add column if not exists claims_validation_status text not null default 'pending_validation',
  add column if not exists highlighted_ingredients jsonb not null default '[]'::jsonb,
  add column if not exists official_source_url text,
  add column if not exists image_source_url text,
  add column if not exists image_permission_status text not null default 'pending_review',
  add column if not exists public_reference_price numeric,
  add column if not exists estimated_margin numeric,
  add column if not exists research_status text not null default 'needs_review',
  add column if not exists supplier_validation_status text not null default 'needs_supplier_validation',
  add column if not exists representation_status text not null default 'not_official';

alter table public.autopilot_product_candidates
  drop constraint if exists autopilot_product_candidates_research_status_check,
  add constraint autopilot_product_candidates_research_status_check
    check (research_status in ('pending_admin_review', 'needs_review', 'needs_supplier_validation', 'rejected'));

alter table public.autopilot_product_candidates
  drop constraint if exists autopilot_product_candidates_supplier_validation_status_check,
  add constraint autopilot_product_candidates_supplier_validation_status_check
    check (supplier_validation_status in ('needs_supplier_validation', 'validated', 'blocked'));

alter table public.autopilot_product_candidates
  drop constraint if exists autopilot_product_candidates_representation_status_check,
  add constraint autopilot_product_candidates_representation_status_check
    check (representation_status in ('not_official'));

alter table public.autopilot_research_runs enable row level security;
alter table public.autopilot_brand_candidates enable row level security;
alter table public.autopilot_supplier_contacts enable row level security;
alter table public.autopilot_import_requirements enable row level security;

create policy "autopilot research runs strict admin all" on public.autopilot_research_runs
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot brand candidates strict admin all" on public.autopilot_brand_candidates
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot supplier contacts strict admin all" on public.autopilot_supplier_contacts
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "autopilot import requirements strict admin all" on public.autopilot_import_requirements
  for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());

revoke all on public.autopilot_research_runs from anon;
revoke all on public.autopilot_brand_candidates from anon;
revoke all on public.autopilot_supplier_contacts from anon;
revoke all on public.autopilot_import_requirements from anon;

grant select, insert, update, delete on public.autopilot_research_runs to authenticated;
grant select, insert, update, delete on public.autopilot_brand_candidates to authenticated;
grant select, insert, update, delete on public.autopilot_supplier_contacts to authenticated;
grant select, insert, update, delete on public.autopilot_import_requirements to authenticated;
