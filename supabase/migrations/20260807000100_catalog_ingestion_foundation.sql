-- External catalog ingestion foundation. Review-only; no provider credentials or automatic publication.

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  status text not null default 'draft' check (status in ('draft','active','paused','blocked')),
  feed_type text not null default 'json' check (feed_type in ('csv','xml','json','api','url_feed','shopify')),
  feed_url text,
  api_base_url text,
  api_key_reference text,
  country text,
  currency text not null default 'USD',
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_feed_location_check check (feed_url is not null or api_base_url is not null or status = 'draft'),
  constraint suppliers_key_reference_only check (api_key_reference is null or api_key_reference !~* '(key|token|secret)_[a-z0-9]{12,}')
);

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id),
  external_id text not null,
  sku text,
  ean text,
  brand text,
  original_title text not null,
  original_description text,
  category text,
  cost numeric,
  currency text not null default 'USD',
  stock integer,
  image_urls jsonb not null default '[]'::jsonb,
  product_url text,
  raw_data jsonb not null default '{}'::jsonb,
  availability_status text not null default 'available' check (availability_status in ('available','unavailable','inactive')),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_id, external_id)
);

create table if not exists public.catalog_margin_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  currency text not null default 'USD',
  min_cost numeric not null default 0,
  max_cost numeric,
  multiplier numeric not null check (multiplier > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (max_cost is null or max_cost > min_cost)
);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  supplier_product_id uuid not null unique references public.supplier_products(id),
  sku text,
  title text not null,
  description text,
  short_description text,
  brand text,
  category text,
  subcategory text,
  price numeric,
  cost numeric,
  margin numeric,
  currency text not null default 'USD',
  stock integer,
  images jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  slug text unique,
  status text not null default 'review' check (status in ('publish','review','reject','approved','rejected','unavailable','inactive')),
  ai_processed boolean not null default false,
  approved boolean not null default false,
  shopify_product_id text,
  ai_result jsonb not null default '{}'::jsonb,
  score jsonb not null default '{}'::jsonb,
  missing_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_products_no_automatic_approval check (approved = false or status = 'approved')
);

create table if not exists public.catalog_sync_runs (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id),
  trigger_type text not null check (trigger_type in ('manual','cron','test')),
  status text not null default 'running' check (status in ('running','completed','failed','partial')),
  received_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  unavailable_count integer not null default 0,
  error_count integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.catalog_sync_errors (
  id uuid primary key default gen_random_uuid(),
  sync_run_id uuid not null references public.catalog_sync_runs(id) on delete cascade,
  external_id text,
  error_code text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;
alter table public.catalog_margin_rules enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_sync_runs enable row level security;
alter table public.catalog_sync_errors enable row level security;

create policy "catalog suppliers strict admin" on public.suppliers for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "supplier products strict admin" on public.supplier_products for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "catalog margin rules strict admin" on public.catalog_margin_rules for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "catalog products strict admin" on public.catalog_products for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "catalog sync runs strict admin" on public.catalog_sync_runs for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());
create policy "catalog sync errors strict admin" on public.catalog_sync_errors for all using (public.is_autopilot_admin()) with check (public.is_autopilot_admin());

revoke all on public.suppliers, public.supplier_products, public.catalog_margin_rules, public.catalog_products, public.catalog_sync_runs, public.catalog_sync_errors from anon;
grant select, insert, update, delete on public.suppliers, public.supplier_products, public.catalog_margin_rules, public.catalog_products, public.catalog_sync_runs, public.catalog_sync_errors to authenticated;
