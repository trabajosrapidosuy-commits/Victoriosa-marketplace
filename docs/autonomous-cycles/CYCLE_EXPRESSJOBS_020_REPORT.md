# ExpressJobs Director Cycle 020

Canonical project: Victoriosa Marketplace

- Mode: `VICTORIOSA_ADMIN_AUTOPILOT_DISCOVERABILITY`
- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-staging-enable`
- HEAD before commit: `6aeb853`
- Production: `NO-GO_PRODUCTION`

## Result

- Admin email/password login redirects directly to `/admin/autopilot`.
- Admin Google OAuth redirects directly to `/admin/autopilot`.
- The storefront header exposes `Autopilot` only to verified admin roles.
- Mi cuenta exposes `Victoriosa Studio / Autopilot` only to verified admin
  roles.
- Normal users still land on `/account`.
- Existing admin route guards remain mandatory.

## Checks

- `secret:scan`: `PASS`
- `production:check`: `PASS`
- `guard:no-production-deploy`: `PASS`
- `test:rls:static`: `PASS_25_PUBLIC_TABLES`
- `lint`: `PASS`
- `typecheck`: `PASS`
- focused tests: `PASS_4_FILES_25_TESTS`
- full tests: `PASS_34_FILES_121_TESTS`
- `build --debug`: `PASS`
- `git diff --check`: `PASS`
- `staging:check`: `CHECK_NOT_RUN_MISSING_STAGING_VARS`
- `rls:smoke`: `CHECK_NOT_RUN_MISSING_STAGING_VARS`

## Safety

- Production touched: `NO`
- Production deploy: `NO`
- Database mutation: `NO`
- Secrets exposed: `NO`
- Products published: `NO`
- Official brand representation asserted: `NO`

Decision: `GO_ADMIN_AUTOPILOT_DISCOVERABLE`

Next mode: `VICTORIOSA_PREVIEW_ADMIN_DISCOVERABILITY_SMOKE`

## NEXT_CODEX_PROMPT

Repository: `C:\victoriosa-autopilot-admin-control-center`

Suggested branch: `codex/victoriosa-autopilot-staging-enable`

Objective: verify the Preview-only deployment with an existing admin session.

Safety:

- Keep `PRODUCTION_STATUS=NO-GO_PRODUCTION`.
- Preview only; never use `vercel --prod` or `vercel promote`.
- No password, recovery token, cookie or secret disclosure.
- No payments, publication, schema mutation or RLS relaxation.

Tasks:

1. Confirm the deployment is Preview and `production_environment=false`.
2. Login as an existing `marketplace_admin`.
3. Confirm login lands directly on `/admin/autopilot`.
4. Confirm storefront header shows `Autopilot`.
5. Confirm Mi cuenta shows `Victoriosa Studio / Autopilot`.
6. Confirm an unauthenticated session cannot access `/admin/autopilot`.
7. Update Director documentation with evidence.

GO: all role-gated entry points are visible to admins and hidden from normal
users while `/admin` remains protected.

NO-GO: production deployment, role leakage, missing admin navigation,
authorization failure or security regression.
