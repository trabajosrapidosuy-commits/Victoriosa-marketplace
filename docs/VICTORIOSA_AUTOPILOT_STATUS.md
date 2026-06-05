# Victoriosa Autopilot Status

## Current State

- Build: PASS
- Local Autopilot persistence: IMPLEMENTED
- Fase 0 worktree recovery: IMPLEMENTED
- Fase 1 safety flags: IMPLEMENTED via central config
- Fase 1 contract consolidation: IMPLEMENTED for flags, connectors, candidates,
  scoring, compliance, review events and AI drafts
- Fase 2 safe discovery connectors: IMPLEMENTED for `mock`, `manual` and
  `csv-json`
- Fase 2 provenance normalization: IMPLEMENTED in `raw_payload` and candidate
  contract
- Strict admin-only RLS migration: READY_LOCAL
- Confirmed Victoriosa Supabase ref: `ngliugfcwydnfbpalkpb`
- Blocked Supabase ref: `dpwassnykcrgjwrruckz`
- Remote public tables on confirmed ref: EMPTY
- Remote migration apply: PASS, three reviewed migrations
- Structural RLS audit: PASS
- REST RLS smoke: PASS, seven internal tables expose zero rows to anon
- Outbound email, supplier calls and automatic publication: DISABLED
- Commercial intelligence scoring: IMPLEMENTED
- Admin queue commercial filters: IMPLEMENTED
- Suggested price edit: IMPLEMENTED_REVIEW_ONLY
- Live providers: DISABLED_BY_FLAG_NEEDS_CREDENTIALS
- Automatic publication: DISABLED_BY_FLAG
- Real fulfillment: DISABLED_BY_FLAG
- Supplier purchase: DISABLED_BY_FLAG
- Outbound email: DISABLED_BY_FLAG
- Alerts, sync, tracking and fulfillment sandbox: NOT_IMPLEMENTED_IN_THIS_PHASE
- Realtime function execute hardening: READY_LOCAL_ONLY
- Decision engine explicit pipeline: IMPLEMENTED_LOCAL
- Admin web panel `/admin/autopilot`: IMPLEMENTED_LOCAL_PREVIEW_READY
- Supabase admin web fallback: IMPLEMENTED_SAFE_MESSAGE
- Browser visual smoke: VERIFIED_LOGIN_REDIRECT_NO_ADMIN_SESSION

## Phase 1 Flags

- `AUTOPILOT_ENABLED=true`
- `AUTOPILOT_AI_ENABLED=false`
- `AUTOPILOT_LIVE_CONNECTORS_ENABLED=false`
- `AUTOPILOT_AUTO_PUBLISH_ENABLED=false`
- `AUTOPILOT_REAL_FULFILLMENT_ENABLED=false`
- `AUTOPILOT_SUPPLIER_PURCHASE_ENABLED=false`
- `AUTOPILOT_OUTBOUND_EMAIL_ENABLED=false`

Legacy bridge maintained in this phase:

- `ENABLE_AI_AUTOMATION` -> fallback for `AUTOPILOT_AI_ENABLED`
- `ENABLE_AUTO_PUBLICATION` -> fallback for
  `AUTOPILOT_AUTO_PUBLISH_ENABLED`

## Phase 2 Discovery

- Safe connectors enabled:
  - `mock`
  - `manual`
  - `csv-json`
- External connectors remain `needs_credentials` or `disabled` by flag:
  - `cj`
  - `aliexpress`
  - `alibaba`
  - `zendrop`
  - `dropi`
  - `autods`
  - `dsers`
- Provenance normalized and preserved:
  - `raw_payload`
  - `source_url`
  - `external_id`
  - `provider`
  - `supplier`
  - `price`
  - `shipping`
  - `stock`
  - `rating`
  - `image_rights`
  - `resale_rights`
- Local migration for provenance: NOT_REQUIRED. Existing schema was reused via
  `raw_payload`, `provider`, `external_id`, `source_url` and supplier/pricing
  columns.

## Decision Engine

- Explicit pipeline implemented:
  - `normalize`
  - `compliance gate`
  - `pricing`
  - `scoring`
  - `recommendation`
  - `review`
- Consolidated outputs:
  - `ComplianceDecision`
  - `PricingDecision`
  - `ScoringDecision`
- Recommendation values limited to:
  - `approve_candidate`
  - `review`
  - `reject`
- Compliance veto behavior:
  - medical or regulatory blockers => `reject`
  - incomplete provenance or ambiguous rights/source => `review`
  - safe products can reach `approve_candidate`
- Import behavior unchanged:
  - `draft + needs_review`
  - never auto-publishes

## Admin Web Preview Surface

- Private admin route:
  - `/admin/autopilot`
- Candidate queue routes:
  - `/admin/autopilot/candidates`
  - `/admin/autopilot/review`
- Server-side data source:
  - Supabase SSR client through existing admin guard
- Connected state:
  - real persisted candidates render with
    - `recommendation`
    - `complianceDecision`
    - `blockers`
    - `warnings`
    - `score/risk`
    - `updatedAt/createdAt`
- Fallback state:
  - `Supabase Autopilot data unavailable in this environment`
- Safety badge:
  - `draft + needs_review`
- Publication:
  - never auto-publishes from web surface

## Browser Visual Smoke

- Local URL used:
  - `http://127.0.0.1:3000/admin/autopilot`
- Verified routes:
  - `/admin/autopilot`
  - `/admin/autopilot/candidates`
  - `/admin/autopilot/review`
- Observed result in browser:
  - all three routes redirected to `/auth/login?next=...`
  - login page rendered with no public Autopilot link
- Admin session state:
  - no authenticated admin session was available in the in-app browser
- Manual requirement to reach panel:
  - authenticate with a user whose row exists in `marketplace_profiles`
  - `marketplace_profiles.role` must be `admin` or `marketplace_admin`
- Evidence mode:
  - textual browser evidence recorded
  - screenshot attempts timed out in the embedded browser runtime

## Required Before Authenticated Smoke

1. Create a dedicated non-production admin identity through the secure manual
   Dashboard path.
2. Assign `marketplace_admin` using the staging-only reviewed SQL in the
   access runbook.

## Safety Boundary

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Realtime Hardening Pending Apply

- Local migration prepared:
  - `20260604000100_victoriosa_realtime_function_execute_hardening.sql`
- Purpose:
  - revoke public `EXECUTE` on exposed realtime broadcast helpers detected by
    Supabase Advisor
- Target functions:
  - `public.autopilot_discovery_runs_realtime_broadcast()`
  - `public.marketplace_orders_realtime_broadcast()`
  - `public.marketplace_products_realtime_broadcast()`
- Remote apply: NOT_EXECUTED without explicit authorization
