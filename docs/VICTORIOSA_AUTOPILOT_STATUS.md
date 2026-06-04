# Victoriosa Autopilot Status

## Current State

- Build: PASS
- Local Autopilot persistence: IMPLEMENTED
- Fase 0 worktree recovery: IMPLEMENTED
- Fase 1 safety flags: IMPLEMENTED via central config
- Fase 1 contract consolidation: IMPLEMENTED for flags, connectors, candidates,
  scoring, compliance, review events and AI drafts
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

## Required Before Authenticated Smoke

1. Create a dedicated non-production admin identity through the secure manual
   Dashboard path.
2. Assign `marketplace_admin` using the staging-only reviewed SQL in the
   access runbook.

## Safety Boundary

`PRODUCTION_STATUS=NO-GO_PRODUCTION`
