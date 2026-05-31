-- Migration: extend products for autonomous commerce agent and add agent tables

alter table if exists products
  add column if not exists risk_reasons text[],
  add column if not exists total_cost numeric,
  add column if not exists platform_fee_estimate numeric,
  add column if not exists estimated_profit numeric,
  add column if not exists estimated_margin_percent numeric,
  add column if not exists raw_supplier_payload jsonb;

create unique index if not exists idx_products_supplier_product_id on products (supplier_product_id);
create unique index if not exists idx_products_supplier_url on products (supplier_url);

create table if not exists product_import_runs (
  id uuid primary key default gen_random_uuid(),
  source text,
  query text,
  category text,
  status text,
  products_found integer,
  products_imported integer,
  products_published integer,
  products_rejected integer,
  errors jsonb,
  started_at timestamptz default now(),
  finished_at timestamptz
);

create table if not exists product_agent_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid null,
  run_id uuid null,
  agent_name text,
  action text,
  decision text,
  message text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists agent_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique,
  value jsonb,
  updated_at timestamptz default now()
);
