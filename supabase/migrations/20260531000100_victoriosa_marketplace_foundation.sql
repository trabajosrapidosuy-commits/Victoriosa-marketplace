-- Victoriosa Marketplace foundation
-- Production remains NO-GO until credentials, payments, suppliers and compliance are reviewed.

create extension if not exists "pgcrypto";

create table if not exists public.marketplace_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'authenticated' check (role in ('authenticated','admin','marketplace_admin','reviewer','support','internal_job')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.marketplace_profiles where id = auth.uid()), auth.role(), 'anon')
$$;

create or replace function public.is_marketplace_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in ('admin','marketplace_admin','reviewer','support','internal_job')
$$;

create table if not exists public.marketplace_suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('amazon','aliexpress','temu','cj_dropshipping','dropshipman','dsers','autods','zendrop','manual','csv','local','other')),
  website_url text,
  api_enabled boolean not null default false,
  api_config jsonb not null default '{}'::jsonb,
  trust_level text not null default 'unknown' check (trust_level in ('unknown','low','medium','high','verified')),
  allows_dropshipping boolean not null default false,
  allows_resale boolean not null default false,
  allows_image_use boolean not null default false,
  allows_branding boolean not null default false,
  return_policy_url text,
  average_shipping_days_min int,
  average_shipping_days_max int,
  risk_notes text,
  status text not null default 'needs_review' check (status in ('active','paused','blocked','needs_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.marketplace_suppliers(id),
  title text not null,
  slug text not null unique,
  description text not null default '',
  short_description text not null default '',
  brand text,
  category text not null,
  subcategory text,
  tags text[] not null default '{}',
  source_url text,
  source_platform text,
  external_product_id text,
  external_sku text,
  image_urls text[] not null default '{}',
  main_image_url text,
  image_rights_status text not null default 'needs_review' check (image_rights_status in ('unknown','allowed','not_allowed','own_image','needs_review')),
  cost_price numeric not null default 0,
  shipping_cost numeric not null default 0,
  platform_fee_estimate numeric not null default 0,
  target_margin_percent numeric not null default 55,
  target_margin_amount numeric not null default 0,
  sale_price numeric not null default 0,
  compare_at_price numeric,
  currency text not null default 'USD',
  local_currency text not null default 'UYU',
  fx_rate numeric not null default 1,
  stock_status text not null default 'unknown' check (stock_status in ('unknown','in_stock','out_of_stock','limited','preorder')),
  fulfillment_type text not null default 'direct_dropship' check (fulfillment_type in ('direct_dropship','affiliate','manual_resale','local_stock','service_bundle')),
  compliance_status text not null default 'needs_review' check (compliance_status in ('draft','needs_review','approved','rejected','blocked')),
  publication_status text not null default 'draft' check (publication_status in ('draft','published','archived','hidden')),
  risk_level text not null default 'medium' check (risk_level in ('low','medium','high','blocked')),
  review_notes text,
  supplier_rating numeric,
  estimated_delivery_min_days int,
  estimated_delivery_max_days int,
  return_window_days int,
  warranty_notes text,
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_products_publication_safety check (
    publication_status <> 'published' or (compliance_status = 'approved' and risk_level = 'low')
  )
);

create table if not exists public.marketplace_product_import_batches (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  supplier_id uuid references public.marketplace_suppliers(id),
  file_name text,
  source_url text,
  imported_by uuid references auth.users(id),
  total_rows int not null default 0,
  accepted_rows int not null default 0,
  rejected_rows int not null default 0,
  status text not null default 'uploaded' check (status in ('uploaded','processing','completed','failed','partially_completed')),
  errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.marketplace_product_import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.marketplace_product_import_batches(id) on delete cascade,
  raw_payload jsonb not null,
  normalized_payload jsonb,
  product_id uuid references public.marketplace_products(id),
  status text not null default 'pending' check (status in ('pending','created','updated','rejected','duplicate','needs_review')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid references auth.users(id),
  buyer_email text,
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','supplier_pending','supplier_ordered','shipped','delivered','cancelled','refunded','disputed')),
  payment_provider text,
  payment_provider_order_id text,
  subtotal numeric not null default 0,
  shipping_total numeric not null default 0,
  tax_total numeric not null default 0,
  total numeric not null default 0,
  currency text not null default 'UYU',
  customer_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  product_id uuid references public.marketplace_products(id),
  supplier_id uuid references public.marketplace_suppliers(id),
  title_snapshot text not null,
  source_url_snapshot text,
  cost_price_snapshot numeric not null default 0,
  sale_price_snapshot numeric not null default 0,
  quantity int not null default 1,
  supplier_order_status text,
  supplier_order_reference text,
  tracking_number text,
  tracking_url text,
  estimated_delivery_min_days int,
  estimated_delivery_max_days int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_click_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.marketplace_products(id),
  supplier_id uuid references public.marketplace_suppliers(id),
  user_id uuid references auth.users(id),
  event_type text not null check (event_type in ('view','source_click','affiliate_click','cart_add','checkout_start','purchase')),
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_reviews_queue (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.marketplace_products(id) on delete cascade,
  assigned_to uuid references auth.users(id),
  status text not null default 'open' check (status in ('open','approved','rejected','blocked','needs_changes')),
  checklist jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.beauty_consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email text,
  name text,
  status text not null default 'submitted' check (status in ('draft','submitted','reviewing','answered','closed')),
  skin_type text,
  concern_tags text[] not null default '{}',
  budget_range text,
  routine_goal text,
  answers jsonb not null default '{}'::jsonb,
  recommended_product_ids uuid[] not null default '{}',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.marketplace_profiles enable row level security;
alter table public.marketplace_suppliers enable row level security;
alter table public.marketplace_products enable row level security;
alter table public.marketplace_product_import_batches enable row level security;
alter table public.marketplace_product_import_rows enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.marketplace_order_items enable row level security;
alter table public.marketplace_click_events enable row level security;
alter table public.marketplace_reviews_queue enable row level security;
alter table public.beauty_consultations enable row level security;
alter table public.marketplace_settings enable row level security;

create policy "profiles own read or admin" on public.marketplace_profiles for select using (id = auth.uid() or public.is_marketplace_admin());
create policy "profiles admin write" on public.marketplace_profiles for all using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());

create policy "suppliers admin all" on public.marketplace_suppliers for all using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());
create policy "suppliers public minimal through published product" on public.marketplace_suppliers for select using (
  status = 'active' and exists (
    select 1 from public.marketplace_products p where p.supplier_id = marketplace_suppliers.id and p.publication_status = 'published' and p.compliance_status = 'approved' and p.risk_level = 'low'
  )
);

create policy "products public approved published" on public.marketplace_products for select using (publication_status = 'published' and compliance_status = 'approved' and risk_level = 'low');
create policy "products admin all" on public.marketplace_products for all using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());

create policy "import batches admin all" on public.marketplace_product_import_batches for all using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());
create policy "import rows admin all" on public.marketplace_product_import_rows for all using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());

create policy "orders buyer read own" on public.marketplace_orders for select using (buyer_user_id = auth.uid() or public.is_marketplace_admin());
create policy "orders buyer create own" on public.marketplace_orders for insert with check (buyer_user_id = auth.uid() or buyer_user_id is null or public.is_marketplace_admin());
create policy "orders admin update" on public.marketplace_orders for update using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());

create policy "order items buyer read own" on public.marketplace_order_items for select using (
  public.is_marketplace_admin() or exists (select 1 from public.marketplace_orders o where o.id = marketplace_order_items.order_id and o.buyer_user_id = auth.uid())
);
create policy "order items admin all" on public.marketplace_order_items for all using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());

create policy "click events public insert" on public.marketplace_click_events for insert with check (true);
create policy "click events admin read" on public.marketplace_click_events for select using (public.is_marketplace_admin());

create policy "reviews queue admin all" on public.marketplace_reviews_queue for all using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());

create policy "consultations own read or admin" on public.beauty_consultations for select using (user_id = auth.uid() or public.is_marketplace_admin());
create policy "consultations public insert" on public.beauty_consultations for insert with check (true);
create policy "consultations admin update" on public.beauty_consultations for update using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());

create policy "settings admin all" on public.marketplace_settings for all using (public.is_marketplace_admin()) with check (public.is_marketplace_admin());
create policy "settings public safe read" on public.marketplace_settings for select using (key in ('brand','public_contact','commerce_disclaimers'));
