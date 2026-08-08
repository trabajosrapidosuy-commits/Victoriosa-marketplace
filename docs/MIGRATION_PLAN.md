# Safe Migration Plan — Victoriosa Marketplace

Status: **planning only. No migration has been applied.**

## Guardrails

- No `DROP TABLE`, `DROP COLUMN`, bulk delete or data reset.
- Preserve marketplace, Autopilot, catalog, profiles, orders, suppliers and configuration data.
- Do not connect suppliers, enable AI in production, publish products, enable payments or deploy production.
- Run every candidate migration first as a reviewed dry-run against the authorized staging project.

## Target responsibilities

```text
Autopilot: discovery → supplier/product candidates → human qualification
Catalog: supplier_products → normalization → commercial rules → catalog_products
Catalog Intelligence: catalog_products → AI proposal → human review
Storefront: published marketplace-compatible catalog product → cart → manual order → fulfillment tracking
```

## Proposed additive sequence

### 0. Read-only baseline

Export remote metadata and counts, then update `SCHEMA_DIFF.md` with factual differences. Stop if a table name conflicts with a different remote contract.

### 1. Preserve and bridge catalog

If remote catalog tables are missing, apply only the existing additive catalog migrations after review. If they exist, add a compatibility view or repository mapping rather than copying/deleting products. The storefront must continue to hide cost, supplier, internal score and AI audit data.

### 2. Preserve approvals across supplier sync

Use the existing `supplier_products` fingerprint/availability model. Supplier sync may update original source facts and availability; it must not erase selected AI results or manually approved commercial state.

### 3. Retire Shopify references safely

Do not edit historical migrations. First verify that no remote data or deployed code depends on Shopify fields. Then create a new additive compatibility migration and code cleanup plan; retain historical fields until an explicit, reviewed archival decision.

### 4. Complete manual commerce

Use `marketplace_orders` and item snapshots for manual order requests. Maintain no-payment/no-provider-purchase gates until sandbox workflows and user acceptance are complete.

### 5. Supplier connectors

Add one authorized provider only after legal permission and secure server-only credential configuration. Use isolated fetcher/parser/validator/normalizer/repository modules with HTTPS, SSRF, size, timeout and product-count controls.

## Required preservation checks

Before/after any future migration, record counts for:

- `marketplace_products`, `marketplace_suppliers`, `marketplace_orders`
- `supplier_products`, `catalog_products`
- `autopilot_product_candidates`, `autopilot_ai_product_drafts`
- `marketplace_profiles`, `beauty_consultations`

## Explicit stop condition

Do not generate executable SQL until remote schema metadata and these counts are captured from the authorized Supabase project in read-only mode.
