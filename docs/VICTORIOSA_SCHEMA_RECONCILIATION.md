# Victoriosa Schema Reconciliation

## Decision

Use the `marketplace_*` schema in
`supabase/migrations/20260531000100_victoriosa_marketplace_foundation.sql` as the
canonical direction. It contains the compliance, publication, supplier and RLS
controls required for autonomous commerce.

The older `products`, `orders`, `order_items`, `user_profiles`,
`supplier_imports` and `analytics_events` API layer remains a legacy prototype.
Do not apply it to production and do not treat it as the final contract.

## Current Gap

- Public demo routes use local seed products and are build-safe.
- `/api/marketplace/import` uses the controlled marketplace import services.
- Several `/api/products`, `/api/orders` and `/api/admin/products` handlers still
  target legacy table names.
- Admin marketplace pages are explicitly demo-only.
- Staging RLS behavior has not been proven against a linked Supabase project.

## Safe Migration Sequence

1. Keep `PRODUCTION_STATUS=NO-GO_PRODUCTION`.
2. Add staging-only RLS smoke credentials through secure environment loading.
3. Validate the canonical migration in staging without destructive SQL.
4. Replace legacy API handlers with `marketplace_*` repositories or retire them.
5. Add authenticated admin guards and tests for read/write boundaries.
6. Verify import always creates `needs_review` and `draft`.
7. Verify public catalog only exposes `approved`, `low`, `published` products.
8. Verify browser flows with staging data before any preview release decision.

## Autonomous Publication Boundary

Autonomous discovery, scoring, copy generation and draft creation are allowed in
staging. Automatic public publication remains disabled until provider rights,
compliance rules, RLS smoke tests and an auditable publication gate exist.
