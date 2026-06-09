# Victoriosa Autopilot Status

## Current State

- Build: PASS
- Local Autopilot persistence: IMPLEMENTED
- Safe discovery connectors: IMPLEMENTED for `mock`, `manual` and `csv-json`
- Decision engine explicit pipeline: IMPLEMENTED_LOCAL
- Realtime function execute hardening: READY_LOCAL_ONLY
- Admin web panel `/admin/autopilot`: IMPLEMENTED_LOCAL_PREVIEW_READY
- Supabase public env hardening: IMPLEMENTED_LOCAL
- K-beauty review-only research assets: IMPLEMENTED_LOCAL
- K-beauty local-only seed script: READY_DRY_RUN
- K-beauty local-only migration: READY_LOCAL_ONLY
- Autopilot real MVP tables and logs (review notes, decision logs, compliance checks, admin actions): IMPLEMENTED_LOCAL
- Real K-beauty brand candidates (Dermafirm, KRX) in seed: IMPLEMENTED_LOCAL
- Automatic publication: DISABLED_BY_FLAG
- Live providers: DISABLED_BY_FLAG_NEEDS_CREDENTIALS
- Real fulfillment: DISABLED_BY_FLAG
- Supplier purchase: DISABLED_BY_FLAG
- Outbound email: DISABLED_BY_FLAG

## K-beauty Review-only Boundary

- Seed script:
  - `npm run seed:autopilot:kbeauty`
  - default mode: dry-run only
  - write mode requires:
    - `SUPABASE_URL=SET`
    - `SUPABASE_SERVICE_ROLE_KEY: SET`
    - `AUTHORIZED_STAGING_TARGET=true`
    - migration applied
    - readiness PASS
    - `PRODUCTION_STATUS=NO-GO_PRODUCTION`
- CLI apply path in this phase:
  - `supabase link --project-ref ngliugfcwydnfbpalkpb`
  - `supabase db push`
- Explicitly blocked:
  - `supabase db push --db-url "$env:SUPABASE_URL"` when `SUPABASE_URL` is only the public HTTPS project URL
- Allowed review states:
  - `pending_admin_review`
  - `needs_review`
  - `needs_supplier_validation`
- Allowed representation state in this phase:
  - `not_official`
- No path to `published`
- No path to official representation in this phase

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
