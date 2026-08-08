-- Catalog Intelligence audit trail. Additive, admin-only, and never mutates supplier_products.

create table if not exists public.catalog_ai_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running' check (status in ('running','completed','failed','partial')),
  product_count integer not null default 0 check (product_count >= 0),
  model text not null,
  requested_by uuid references auth.users(id),
  total_tokens integer,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_ai_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.catalog_ai_runs(id) on delete cascade,
  catalog_product_id uuid not null references public.catalog_products(id),
  supplier_product_id uuid not null references public.supplier_products(id),
  input_fingerprint text not null,
  source_snapshot jsonb not null,
  model text not null,
  output jsonb,
  quality_score integer check (quality_score between 0 and 100),
  recommendation text check (recommendation in ('PUBLISH','REVIEW','REJECT')),
  status text not null default 'pending' check (status in ('pending','completed','failed','approved','rejected','skipped')),
  error text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catalog_ai_results_product_fingerprint_idx on public.catalog_ai_results(catalog_product_id, input_fingerprint);
create index if not exists catalog_ai_results_run_idx on public.catalog_ai_results(run_id);

alter table public.catalog_ai_runs enable row level security;
alter table public.catalog_ai_results enable row level security;

create policy "catalog ai runs strict admin" on public.catalog_ai_runs for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "catalog ai results strict admin" on public.catalog_ai_results for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());

revoke all on public.catalog_ai_runs, public.catalog_ai_results from anon;
grant select, insert, update, delete on public.catalog_ai_runs, public.catalog_ai_results to authenticated;
