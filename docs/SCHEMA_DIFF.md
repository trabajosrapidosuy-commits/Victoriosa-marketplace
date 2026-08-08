# Schema Diff — Victoriosa Marketplace

Estado: **local GitHub audit complete; remote Supabase audit blocked**.

## Evidence source

- Local migrations through `20260807000200_catalog_intelligence_audit.sql`.
- Remote schema, data counts, functions, triggers, advisors and applied migration history were **not queried** because the configured Vercel environments do not inject the required Supabase variables into the audit process.
- This document is not permission to apply SQL or infer remote state.

## Local canonical model

| Domain | Local tables | Classification |
| --- | --- | --- |
| Storefront and commerce | `marketplace_profiles`, `marketplace_suppliers`, `marketplace_products`, `marketplace_orders`, `marketplace_order_items`, `marketplace_reviews_queue` | Core current storefront/commerce contract |
| Supplier ingestion | `suppliers`, `supplier_products`, `catalog_products`, `catalog_sync_runs`, `catalog_sync_errors`, `catalog_margin_rules` | Core catalog pipeline, pending remote confirmation |
| Catalog Intelligence | `catalog_ai_runs`, `catalog_ai_results` | Core review-only enrichment, pending remote confirmation |
| Discovery and review | `autopilot_*` tables | Core retained; discovery and review are distinct from commercial catalog |
| Historical prototype | `products`, `orders`, `order_items`, `user_profiles`, `supplier_imports`, `analytics_events` in `docs/supabase-schema.sql` | Legacy documentation/prototype; do not target new code |

## Confirmed local constraints

- `supplier_products` has unique `(supplier_id, external_id)`.
- `catalog_products` has a unique `supplier_product_id` relation.
- `catalog_ai_results` stores source snapshot, fingerprint and review state separately from supplier source data.
- Marketplace publication remains constrained to approved, low-risk products.
- All tables declared in local migrations enable RLS; catalog, Catalog Intelligence and Autopilot policies are admin-only.

## Remote verification required before any migration

1. Applied migration history and extension list.
2. Public tables, columns, constraints, foreign keys and indexes.
3. RLS/policies, grants, functions, triggers and advisor findings.
4. Counts: marketplace products/suppliers/orders, catalog rows, Autopilot candidates/drafts and user profiles.
5. Existence and compatibility of all local catalog and AI tables.

## Shopify status

There is no Shopify client, SDK, endpoint or webhook in the local runtime. Historical migration/type/document references remain and require an additive, remote-verified retirement plan; they must not be removed by editing migration history or destructive SQL.
