-- Victoriosa is now a first-party catalog and commerce platform.
-- Remove the obsolete Shopify integration path without rewriting historical migrations.

alter table public.suppliers
  drop constraint if exists suppliers_feed_type_check;

alter table public.suppliers
  add constraint suppliers_feed_type_check
  check (feed_type in ('csv','xml','json','api','url_feed'));

alter table public.catalog_products
  drop column if exists shopify_product_id;
