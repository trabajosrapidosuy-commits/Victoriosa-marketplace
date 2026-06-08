# ExpressJobs Director Cycle 018

Canonical project: Victoriosa Marketplace

- Mode: `VICTORIOSA_AUTOPILOT_ADMIN_IDENTITY_VALIDATION`
- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-staging-enable`
- HEAD: `6aeb853`
- Supabase staging: `ngliugfcwydnfbpalkpb`
- `akuma424424@gmail.com`: confirmed, active, `marketplace_admin`
- `trabajosrapidos.uy@gmail.com`: confirmed, active, promoted to
  `marketplace_admin`
- Autopilot RLS admin gate: `PASS`
- Duplicate Auth identities: `NO`
- Production: `NO-GO_PRODUCTION`

## Checks

- `secret:scan`: `PASS`
- `production:check`: `PASS`
- `guard:no-production-deploy`: `PASS`
- `test:rls:static`: `PASS_25_PUBLIC_TABLES`
- `lint`: `PASS`
- `typecheck`: `PASS`
- `test`: `PASS_32_FILES_111_TESTS`
- `build`: `PASS_DEBUG_RETRY_AFTER_TRANSIENT_PAGE_COLLECTION_FAILURE`
- `git diff --check`: `PASS`
- `staging:check`: `CHECK_NOT_RUN_MISSING_STAGING_VARS`
- `rls:smoke`: `CHECK_NOT_RUN_MISSING_STAGING_VARS`
- Authenticated browser smoke: `CHECK_NOT_RUN_NO_SECURE_SESSION`

## Safety

- Production touched: `NO`
- Deploy executed: `NO`
- Secrets exposed: `NO`
- Products published: `NO`
- Official brand representation asserted: `NO`

Decision: `GO_ADMIN_IDENTITIES_VERIFIED`

Next mode: `VICTORIOSA_AUTOPILOT_STAGING_AUTHENTICATED_ADMIN_SMOKE`

## NEXT_CODEX_PROMPT

Repository: `C:\victoriosa-autopilot-admin-control-center`

Suggested branch: `codex/victoriosa-autopilot-staging-enable`

Objective: run an authenticated staging browser smoke for the two verified
`marketplace_admin` users and confirm `/admin/autopilot` access.

Context:

- Authorized staging ref: `ngliugfcwydnfbpalkpb`.
- Both requested emails are confirmed, active and `marketplace_admin`.
- Autopilot RLS uses the expected admin gate.
- No secure reusable browser session is currently available to Codex.

Safety:

- Keep `PRODUCTION_STATUS=NO-GO_PRODUCTION`.
- No production, deploy, payments, publication, schema changes, seed writes,
  secret output, client service role or RLS relaxation.
- Never request passwords or tokens in chat.
- Preserve unrelated `tsconfig.json` and `.vscode` changes.

Tasks:

1. Revalidate worktree, staging target and production gates.
2. Use an existing secure authenticated browser session.
3. Verify `/admin`, `/admin/autopilot`, candidates, review, drafts and runs.
4. Confirm unauthenticated and non-admin access remains blocked.
5. Run required checks and update Director documentation.

GO: both verified administrators can access Autopilot and guards remain intact.

NO-GO: no secure session, invalid credentials, authorization failure, security
regression or production risk.
