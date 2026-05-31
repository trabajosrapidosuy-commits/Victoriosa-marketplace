-- Migration: create products and supplier cache tables for sourcing
-- Run with supabase migrations or psql against the project's DB

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  supplier text,
  supplier_product_id text,
  supplier_url text,
  title text,
  slug text,
  short_description text,
  long_description text,
  category text,
  subcategory text,
  tags text[],
  status text,
  score int,
  risk_level text,
  cost_price numeric,
  shipping_cost numeric,
  sale_price numeric,
  compare_at_price numeric,
  estimated_margin numeric,
  currency text,
  stock_status text,
  variants jsonb,
  images text[],
  seo_title text,
  seo_description text,
  meta_keywords text[],
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists supplier_products_cache (
  id uuid primary key default gen_random_uuid(),
  supplier text,
  external_id text,
  raw_payload jsonb,
  score int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists product_import_logs (
  id uuid primary key default gen_random_uuid(),
  supplier text,
  query text,
  products_found int,
  products_imported int,
  products_published int,
  errors jsonb,
  created_at timestamptz default now()
);
