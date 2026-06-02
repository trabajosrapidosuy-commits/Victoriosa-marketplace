# Victoriosa Supplier Intelligence Engine

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Purpose

Victoriosa Autopilot is a private, supplier-agnostic product intelligence
engine. It normalizes products from mock, manual and future provider adapters,
scores them deterministically and leaves every commercial decision behind
human admin review.

No candidate is published automatically. Import creates only
`marketplace_products.publication_status='draft'` with
`compliance_status='needs_review'`.

## Core

- `src/lib/autopilot/core/types.ts`: `NormalizedSupplierProduct`.
- `pricing.ts`: deterministic landed cost, markup, psychological price, margin
  and estimated profit.
- `risk.ts`: compliance flags and `approve_candidate`, `needs_review` or
  `reject` recommendation.
- `brand-fit.ts`: Victoriosa beauty and self-care affinity.
- `viral.ts`: visual, demonstrable and demand heuristics without paid AI.
- `scoring.ts`: explainable 0-100 composite score.
- `import-draft.ts`: draft-only marketplace row constructor.

## Providers

- `mock-provider.ts`: private realistic beauty fixtures plus a risky fixture.
- `manual-provider.ts`: validates and evaluates admin-entered candidates.
- Future adapters: CJ Dropshipping, AliExpress, Alibaba and local suppliers.
  No live provider is connected in this cycle.

## Persistence

Existing tables remain canonical:

- `autopilot_supplier_connectors`: source registry.
- `autopilot_discovery_runs`: discovery execution history.
- `autopilot_product_candidates`: candidate queue.
- `autopilot_logs`: internal operational log.

Migration `20260602000500_victoriosa_supplier_agnostic_autopilot_core.sql`
adds normalized scoring fields, `autopilot_review_events` and
`autopilot_settings`.

## Access Boundary

Autopilot is rendered only under private admin routes and owner aliases. Server
actions call `requireAdmin`. Database tables have RLS enabled, anonymous access
is revoked and authenticated access remains filtered by the strict Autopilot
admin helper accepting only `admin` and `marketplace_admin`.

## Authenticated Staging Smoke

The controlled staging smoke passed with reversible masked customer and admin
identities. It verified RLS rejection for customer reads, writes and role
escalation; admin mock discovery; manual candidate creation; review events;
draft import; public draft invisibility; and zero temporary residue after
cleanup.

Optional empty form fields are normalized before Zod validation so blank
filters and optional manual URLs do not break Server Actions.
