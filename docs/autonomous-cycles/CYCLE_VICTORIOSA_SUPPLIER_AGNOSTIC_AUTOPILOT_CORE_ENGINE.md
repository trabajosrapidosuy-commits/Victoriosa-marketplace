# Cycle: Victoriosa Supplier-Agnostic Autopilot Core Engine

## Mode

`VICTORIOSA_SUPPLIER_AGNOSTIC_AUTOPILOT_CORE_ENGINE`

## Safety

- `PRODUCTION_STATUS=NO-GO_PRODUCTION`
- No Production mutation, live provider connection, payment, outbound email or
  automatic publication.
- No client-side privileged key.
- RLS remains enabled and Autopilot remains admin-only.

## Delivered

- Deterministic supplier-agnostic core: pricing, risk, brand fit, viral
  potential and explainable scoring.
- Mock and manual providers.
- Incremental migration reusing existing Autopilot tables and adding review
  events and safe settings.
- Private admin views for candidates, imports, runs and settings with owner
  aliases.
- Draft-only import constructor and human decision audit events.
- Focused tests for core scoring and publication prohibition.

## Checks

- `npm run ci`: PASS, 44 tests, 21 public tables and 52 pages plus Middleware.
- `git diff --check`: PASS.
- Staging migration apply: PASS on authorized ref `ngliugfcwydnfbpalkpb`.
- Remote metadata RLS: PASS for `autopilot_review_events` and
  `autopilot_settings`; zero `anon` grants.
- Local anonymous HTTP: PASS, public storefront does not discover Autopilot
  and all `/owner/autopilot/*` aliases redirect to login.
- `npm run staging:check` and `npm run rls:smoke`: CHECK_NOT_RUN because
  `.env.rls` lacks the two staging smoke values in this shell.
