-- Autopilot remains admin-only. Discovery never publishes products automatically.
create table if not exists public.autopilot_supplier_connectors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  connector_type text not null,
  status text not null default 'disabled' check (status in ('disabled','enabled','needs_credentials','sandbox','error')),
  capabilities jsonb not null default '[]'::jsonb,
  required_env_vars text[] not null default '{}',
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.autopilot_discovery_runs (
  id uuid primary key default gen_random_uuid(),
  connector_id uuid references public.autopilot_supplier_connectors(id),
  status text not null default 'pending' check (status in ('pending','running','completed','needs_credentials','failed')),
  filters jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.autopilot_product_candidates (
  id uuid primary key default gen_random_uuid(),
  discovery_run_id uuid references public.autopilot_discovery_runs(id),
  connector_id uuid references public.autopilot_supplier_connectors(id),
  supplier_name text not null,
  title text not null,
  description text,
  source_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  scoring jsonb not null default '{}'::jsonb,
  risk_flags text[] not null default '{}',
  status text not null default 'pending_admin_review' check (status in ('pending_admin_review','approved','rejected','imported_to_draft','archived')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.autopilot_supplier_connectors enable row level security;
alter table public.autopilot_discovery_runs enable row level security;
alter table public.autopilot_product_candidates enable row level security;

create policy "autopilot connectors admin all" on public.autopilot_supplier_connectors for all using (private.is_marketplace_admin()) with check (private.is_marketplace_admin());
create policy "autopilot discovery runs admin all" on public.autopilot_discovery_runs for all using (private.is_marketplace_admin()) with check (private.is_marketplace_admin());
create policy "autopilot candidates admin all" on public.autopilot_product_candidates for all using (private.is_marketplace_admin()) with check (private.is_marketplace_admin());
