# Catalog Storefront Transition

The public storefront currently reads `marketplace_products`, the remote-verified commerce contract. The catalog ingestion model remains review-only until the remote Supabase schema audit confirms parity.

`mapCatalogStorefrontProduct` is a pure compatibility adapter for a future `catalog_products` read path. It permits only products with:

- `status = approved`
- `approved = true`
- positive stock
- slug and price present

The adapter maps public fields only. It never exposes supplier data, source payload, cost, margin, score or AI audit data.

Activating a `catalog_products` query is deferred to a reviewed migration/audit PR. No storefront query or Supabase schema was changed in this phase.
