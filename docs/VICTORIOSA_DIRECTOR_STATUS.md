# Victoriosa Director Status

## Current Mode

`VICTORIOSA_ADMIN_AUTOPILOT_DISCOVERABILITY`

## Admin Autopilot Discoverability

Date: 2026-06-08

- Administrators no longer need to know or guess `/admin/autopilot`.
- Email/password and Google OAuth sessions with role `admin` or
  `marketplace_admin` now land directly on `/admin/autopilot`.
- Authenticated administrators see an `Autopilot` entry in the storefront
  header on desktop and mobile.
- The account summary and account navigation expose
  `Victoriosa Studio / Autopilot` only after a server-side role check.
- Normal authenticated users continue to land on `/account`.
- Anonymous and non-admin `/admin` guards remain unchanged and fail closed.
- Focused discoverability and authorization tests: `PASS_25_TESTS`
- Full tests: `PASS_34_FILES_121_TESTS`
- Build: `PASS`
- Production touched: `NO`
- Production deploy: `NO`
- Secrets exposed: `NO`

Decision: `GO_ADMIN_AUTOPILOT_DISCOVERABLE`

## Password Recovery PKCE Fix

Date: 2026-06-08

- Root cause: recovery links redirected directly to `/auth/reset-password`
  with a PKCE authorization code, but that page did not exchange the code for
  a session before calling `updateUser`.
- New recovery emails now redirect through
  `/auth/callback?next=/auth/reset-password`.
- Previously issued links that reach `/auth/reset-password?code=...` are
  forwarded through the same callback.
- Invalid, expired or cross-browser PKCE links fail closed with a generic
  recovery message and do not expose raw verifier errors.
- Local browser smoke with a synthetic invalid code: `PASS_FAIL_CLOSED`
- Focused tests: `PASS_12_TESTS`
- Full tests: `PASS_33_FILES_115_TESTS`
- Build: `PASS`
- Production touched: `NO`
- Deploy executed: `NO`
- Secrets exposed: `NO`

Decision: `GO_PASSWORD_RECOVERY_CODE_FIXED`

## Autopilot Admin Identity Validation

Date: 2026-06-08

- Authorized staging ref: `ngliugfcwydnfbpalkpb`
- Project: `Victoriosa-marketplace`, `ACTIVE_HEALTHY`
- `akuma424424@gmail.com`: confirmed, active, `marketplace_admin`
- `trabajosrapidos.uy@gmail.com`: confirmed, active, promoted from
  `authenticated` to `marketplace_admin`
- Duplicate Auth users for either email: `NO`
- Effective Autopilot admin role for both users: `PASS`
- Autopilot RLS admin gate present: `PASS`
- Production touched: `NO`
- Deploy executed: `NO`
- Secrets exposed: `NO`
- Browser login smoke: `CHECK_NOT_RUN_NO_SECURE_SESSION`

Decision: `GO_ADMIN_IDENTITIES_VERIFIED`

## Current Cycle Gate

- Branch: `codex/victoriosa-autopilot-staging-enable`
- Target Supabase: `ngliugfcwydnfbpalkpb`
- `.env.local`: exists, ignored, not tracked
- Env gate: `PASS`
- Link to staging: `PASS`
- Remote versions reconstructed locally: `20260602003409`, `20260602003504`, `20260602003559`, `20260602165959`, `20260602174851`, `20260602190714`
- Safe placeholders created locally: `YES`
- `migration list`: `PASS` (the six remote versions now align)
- `db pull --linked`: `FAIL` (eight local versions are absent from remote history)
- `db push --dry-run`: `FAIL` (six earlier local migrations require `--include-all`)
- `--include-all` preflight: `NO-GO` (public `with check (true)` policies and
  helper grants to `anon` require security review)
- Remote staging write actions: blocked by `NO-GO_MIGRATION_REVIEW`

## Legacy Policy Hardening Result

- Hardening migration:
  `20260607025035_harden_legacy_public_policies_and_anon_grants.sql`
- Unconstrained legacy insert policies remediated:
  `marketplace_click_events`, `beauty_consultations`
- Anonymous role helper execution revoked:
  `private.current_app_role()`
- Anonymous boolean admin helper retained:
  `private.is_marketplace_admin()`, required for safe evaluation of mixed
  public/admin RLS policies and returns no role data
- Helper `search_path`: hardened to empty with fully qualified references
- Public catalog contract preserved:
  `published`, `approved`, `low`
- K-beauty tables remain RLS-enabled and explicitly revoked from `anon` in
  local migrations
- Planned migration SQL destructive scan: `PASS`
- `db push --dry-run --include-all`: `PASS`, nine migrations reviewable
- Real `db push`: `NO`
- Staging smoke: `FAIL`, the four K-beauty tables return HTTP 404 because their
  migration is not applied remotely
- Production: `NO-GO_PRODUCTION`

Decision: `GO_HARDENING_DRY_RUN_REVIEWABLE`

## Staging Canonical Apply Review

- Authorized ref relinked: `ngliugfcwydnfbpalkpb`
- `migration list`: `PASS`
- Final `db push --dry-run --include-all`: `PASS`
- Pending plan: nine migrations, unchanged from the hardening review
- SQL destructive operations: `NONE`
- Effective RLS relaxation: `NO`
- Effective dangerous grants to `anon`: `NO`
- Public catalog boundary preserved: `published`, `approved`, `low`
- Post-apply smoke plan: all 13 Autopilot tables
- Apply runbook:
  `docs/VICTORIOSA_STAGING_CANONICAL_APPLY_RUNBOOK.md`
- Real `db push`: `NO`
- Seed: `NO`
- Production/deploy: `NO`

Decision: `GO_STAGING_APPLY_RUNBOOK_READY`

## Staging Apply Authorization Gate

- Authorized staging ref: `ngliugfcwydnfbpalkpb`
- Project status: `ACTIVE_HEALTHY`
- Env gate: `PASS`
- Link: `PASS`
- `migration list`: `PASS`
- Physical backup available: `YES`
- Latest completed backup observed: `2026-06-06T11:28:54.763Z`
- PITR: `DISABLED`
- Current `db push --dry-run --include-all`: `FAIL`
- Failure: temporary CLI role authentication and Supabase pooler
  `ECIRCUITBREAKER`
- `SUPABASE_DB_PASSWORD`: `MISSING`
- Plan without drift: `UNKNOWN_CURRENT_RUN`
- Post-apply smoke prepared: `YES`, 13 Autopilot tables
- Real `db push`: `NO`
- Seed: `NO`
- Production/deploy: `NO`

Decision: `NO-GO_CHECKS_FAILING`

Blocker: `BLOCKED_SUPABASE_ACCESS`

## Staging Migration Idempotency Reconciliation

- Original duplicate policy reconciled:
  `profiles own read or admin`
- Policy recreation guards added: `39`
- Pending migration files changed: `6`
- Automated idempotency test added: `YES`
- SQL destructive operations: `NO`
- RLS relaxed: `NO`
- Dangerous effective grants to `anon`: `NO`
- `migration list`: `PASS`
- `db push --dry-run --include-all`: `PASS`
- Plan drift: `NO`
- Pending plan: exact same nine migrations
- Real `db push`: `NO`
- Seed: `NO`
- Production/deploy: `NO`

Decision: `GO_IDEMPOTENT_MIGRATIONS_READY_FOR_APPLY_RETRY`

## Staging Idempotent Apply Retry Result

- Literal authorization detected: `YES`
- Authorized ref: `ngliugfcwydnfbpalkpb`
- Physical backup confirmed: `YES`
- Final dry-run: `PASS`, exact nine-migration plan
- Plan drift: `NO`
- Real apply: `PASS`
- Remote migration history aligned: `PASS`
- `staging:check`: `PASS`
- `rls:smoke`: `PASS`, anonymous boundary and 13 Autopilot tables
- K-beauty persistence: `PASS`
- First seed attempt: `FAIL`, partial unique-index conflict inference
- Seed implementation corrected: `efaa299`
- Final seed review-only: `PASS`
- K-beauty candidates: `8`, all `pending_admin_review`
- Research status: `6 needs_review`, `2 needs_supplier_validation`
- Representation status: `8 not_official`
- Imported candidates: `0`
- Published marketplace products: `0`
- Supplier contacts contacted: `0`
- Campaign sends enabled: `0`
- Failed partial research run reconciled to `failed`: `YES`
- Unauthenticated admin route guard: `PASS`
- Authenticated browser smoke: `CHECK_NOT_RUN`, integrated browser unavailable
- Production/deploy/payment: `NO`

Decision: `PENDING_HUMAN_ADMIN_SMOKE`

Blocker: `BLOCKED_MISSING_ACCESS`

## Authenticated Autopilot Smoke Attempt

- Date: `2026-06-07`
- Mode: `VICTORIOSA_AUTOPILOT_STAGING_AUTHENTICATED_ADMIN_SMOKE`
- Authorized staging ref: `ngliugfcwydnfbpalkpb`
- Env gate: `PASS`, eight required variables `SET`
- `staging:check`: `PASS`
- `rls:smoke`: `PASS`, anonymous boundary and 13 Autopilot tables
- K-beauty persistence: `PASS`
- Seeded candidates: `8`
- Candidates `pending_admin_review`: `8`
- Representation `not_official`: `8`
- Published products: `0`
- Draft + needs-review products: `2`
- Supplier contacts sent: `0`
- Campaign sends enabled: `0`
- Unauthenticated guard: `PASS` for `/admin`, Autopilot dashboard,
  candidate detail, runs and drafts
- Server actions protected by `requireAdmin()`: `PASS`, 9 of 9
- Draft import safety: `PASS`, `draft + needs_review`
- Local SSR errors during unauthenticated smoke: `NONE`
- Integrated browser available: `NO`
- Secure admin session available to Codex: `NO`
- Authenticated dashboard, candidate detail, runs and drafts:
  `CHECK_NOT_RUN`
- Non-admin session smoke: `CHECK_NOT_RUN`
- Production/deploy/payment/publication mutation: `NO`

Decision: `PENDING_HUMAN_ADMIN_SESSION`

Blocker: `BLOCKED_MISSING_ACCESS`

## Staging Dry-Run Authentication Recovery

- `SUPABASE_DB_PASSWORD`: `SET`
- Secret location: ignored and untracked `.env.local`
- Supabase link: `PASS`
- `migration list`: `PASS`
- `db push --dry-run --include-all`: `PASS`
- Plan without drift: `YES`
- Pending migrations: exactly nine
- Real `db push`: `NO`
- Seed: `NO`
- Production/deploy: `NO`

Decision: `GO_READY_FOR_EXPLICIT_STAGING_APPLY_AUTHORIZATION`

## Explicit Staging Apply Result

- Literal authorization detected: `YES`
- Backup: `PASS`
- Final dry-run: `PASS`, exact nine-migration plan
- Real apply: `FAIL`
- Failed migration:
  `20260531000100_victoriosa_marketplace_foundation.sql`
- Failure: policy `profiles own read or admin` already exists
- Pending migrations recorded remotely after failure: `NONE`
- `migration repair`: `NO`
- Further apply retries: `NO`
- `staging:check`: `PASS`
- `rls:smoke`: `FAIL`, K-beauty tables remain absent
- K-beauty persistence: `FAIL`
- Seed: `CHECK_NOT_RUN`
- Candidates created: `CHECK_NOT_RUN`
- Products published: `NO`
- Production/deploy: `NO`

Decision: `NO-GO_APPLY_FAILED`

Blocker: `BLOCKED_SUPABASE_ACCESS`

## Context

- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-staging-enable`
- HEAD before cycle: `68f46e7`
- Pull request: `#25`
- PR base: `main`
- PR state: `OPEN_DRAFT`
- PR checks: `PASS`
- `PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Current Risk

`BLOCKED_PRODUCTION_RISK`

GitHub deployment history consistently shows:

- feature and PR commits create Vercel Preview deployments;
- commits integrated into `main` create Vercel Production deployments;
- at least three Vercel scopes are connected to this repository;
- `main` has no branch protection;
- no remote test CI workflow is required before merge.

No remote branch named exactly `integration` or `staging` currently exists.
PR #25 must remain draft and must not be merged or retargeted yet.

## Recommended Strategy

Use a two-lane Git model:

1. `integration` is the normal merge target for reviewed work.
2. `production` is the only Vercel Production branch.
3. `main` remains frozen until every connected Vercel project is audited.
4. Feature branches and `integration` may create Preview deployments only.
5. Production changes require a separate PR from `integration` to `production`,
   explicit human authorization and a release window.
6. `PRODUCTION_STATUS=NO-GO_PRODUCTION` remains active until that authorization.

This is safer than merely retargeting PR #25 because a new branch alone does
not change Vercel Production settings. The branch and all connected Vercel
projects must be configured and verified as one controlled change.

## Manual GitHub Steps

Human execution only:

1. Create `integration` from the current reviewed `main`.
2. Create `production` from the current approved production baseline.
3. Add branch protection to `integration`:
   - require pull requests;
   - require at least one approval;
   - require conversation resolution;
   - require Vercel Preview checks;
   - require the repository CI workflow after it is added;
   - block force pushes and deletion.
4. Add stricter protection to `production`:
   - require pull requests from `integration`;
   - require explicit release approval;
   - block direct pushes, force pushes and deletion;
   - require all checks and resolved conversations.
5. Do not retarget PR #25 until the Vercel verification below passes.

## Manual Vercel Steps

Repeat these steps in every connected project/scope, currently observed as
`akuma424-projects`, `victoriosa-marketplace` and `ads-42d98c21`:

1. Open Vercel Dashboard, select the project, then open `Settings > Git`.
2. Confirm the connected repository is exactly
   `trabajosrapidosuy-commits/Victoriosa-marketplace`.
3. Record the current Production Branch and project owner/scope.
4. Change the Production Branch from `main` to `production`.
5. Confirm `integration` and feature branches remain Preview-only.
6. If the project is a duplicate or unauthorized connection, disconnect its Git
   integration only after a human ownership review.
7. Keep Production environment variables unchanged.
8. Do not use Promote, Redeploy to Production, rollback, alias mutation or CLI.
9. Push a documentation-only test commit to `integration`.
10. Confirm each connected project creates Preview only and that GitHub records
    zero Production deployments for that SHA.

Vercel also supports disabling automatic deployments globally or per branch,
but that is a fallback. It can hide useful Preview feedback and does not solve
the multiple-project ownership problem by itself.

## Strategy Comparison

### Keep PR #25 draft and use Preview only

- Pros: zero Production risk now; already proven.
- Cons: does not provide an integration path.
- Decision: required immediate state.

### Retarget PR #25 to `integration`

- Pros: enables controlled merge and stable Preview branch.
- Cons: unsafe until `integration` exists and all Vercel scopes prove
  Preview-only.
- Decision: preferred after manual setup and verification.

### Keep `main` as Production with release windows

- Pros: minimal branch changes.
- Cons: every merge remains a Production trigger; high operator-error risk.
- Decision: rejected while `NO-GO_PRODUCTION` is active.

### Disable Vercel auto-deploy entirely

- Pros: strongest immediate deployment stop.
- Cons: also disables useful Preview automation and requires manual deployment
  discipline.
- Decision: emergency fallback, not preferred steady state.

### Separate `production` from `main`

- Pros: explicit release boundary and compatible with Preview-based review.
- Cons: requires synchronized configuration across every Vercel project.
- Decision: preferred Production boundary.

### Branch protection only

- Pros: prevents accidental GitHub merges.
- Cons: does not stop an authorized merge from triggering Vercel Production.
- Decision: mandatory defense in depth, insufficient alone.

## GO Conditions For PR #25

PR #25 may be retargeted to `integration` and marked ready only when:

- `integration` exists and is protected;
- every connected Vercel project is inventoried;
- every project uses `production` as its Production Branch or is disconnected;
- one test push to `integration` creates Preview deployments only;
- GitHub records zero Production deployments for the test SHA;
- required remote CI exists and passes;
- PR checks are green and merge state is clean;
- `.env.local` remains ignored and untracked;
- `PRODUCTION_STATUS=NO-GO_PRODUCTION` remains unchanged.

## NO-GO Conditions

- any Vercel project or scope remains unidentified;
- `main` or `integration` remains a Production Branch anywhere;
- a test push creates any Production deployment;
- branch protection or required CI is missing;
- PR checks fail or remain pending;
- a secret, RLS relaxation, payment or automatic publication risk appears.

## Safety

- Production touched: `NO`
- Productive deploy executed: `NO`
- Vercel modified: `NO`
- GitHub branch or PR base modified: `NO`
- PR #25 draft preserved: `YES`
- Secrets exposed: `NO`
- Products published: `NO`
- Official brand representation asserted: `NO`

## Decision

`GO_STRATEGY_DOCUMENTED`

Operational release remains:

`NO-GO_BLOCKED_PRODUCTION_RISK`

## Google OAuth PKCE First-Attempt Fix

Date: 2026-06-07

- Reported behavior: the first Google login returned
  `PKCE code verifier not found in storage`; a second click succeeded.
- Root cause: OAuth started in a server route while the browser completed the
  callback, and configured site URLs could switch the Preview hostname.
- Fix: Google OAuth now starts with the Supabase browser client and uses
  `window.location.origin` for the callback. Callback redirects also preserve
  the request origin, middleware does not refresh the session before the code
  exchange, and raw provider errors are not exposed.
- Local result: focused auth tests, full test suite, lint, typecheck, build,
  secret scan, production guard and static RLS checks pass.
- Browser smoke: login renders one client-side Google button and handles an
  unauthorized localhost callback with a generic visible error.
- Vercel Preview for commit `be8e5c2`: `PASS`, recorded by GitHub as
  `production_environment=false`.
- Pending evidence: first-attempt Google authentication with a fresh account
  selection on the new Preview URL.
- Production remains untouched and blocked:
  `PRODUCTION_STATUS=NO-GO_PRODUCTION`.

Decision: `GO_USER_FIRST_ATTEMPT_SMOKE_REQUIRED`

Next safe mode: `VICTORIOSA_SUPABASE_MISSING_REMOTE_MIGRATIONS_SAFE_RECONSTRUCTION`

## NEXT_CODEX_PROMPT

Repository: `C:\victoriosa-autopilot-admin-control-center`

Suggested branch: `codex/victoriosa-autopilot-staging-enable`

Mode: `VICTORIOSA_AUTOPILOT_STAGING_AUTHENTICATED_ADMIN_SMOKE`

Objective: complete the authenticated staging smoke for the applied and seeded
Autopilot surface without changing production or publishing products.

Context:

- Authorized staging ref: `ngliugfcwydnfbpalkpb`.
- All nine canonical migrations are applied remotely.
- Anonymous RLS smoke passes for all 13 internal Autopilot tables.
- Eight K-beauty candidates exist in review-only state.
- One staging admin profile exists.
- Two consecutive cycles could not run an authenticated browser smoke because
  the integrated browser and a secure reusable admin session were unavailable.

Safety:

- Keep `PRODUCTION_STATUS=NO-GO_PRODUCTION`.
- No production, deploy, payment, publication, seed, schema mutation,
  destructive SQL, secret output, client service role, or RLS relaxation.
- Preserve unrelated `tsconfig.json` and `.vscode` changes.

Tasks:

1. Revalidate worktree, target and production gates.
2. Use an existing secure staging admin session; never request credentials in
   chat or create a new admin automatically.
3. Smoke `/admin/autopilot`, candidate list, one candidate detail, review queue,
   drafts and runs.
4. Verify a non-admin or unauthenticated user cannot access admin routes.
5. Do not approve, reject, import or mutate records unless a separate explicit
   staging authorization is present.
6. Run the mandatory local checks and update Director documentation.

GO: authenticated admin pages render seeded review-only data with no SSR or
Supabase errors, and access guards remain enforced.

NO-GO: missing secure admin session, browser access unavailable, authorization
boundary failure, security regression or production risk.

## Integration Preview-Only Smoke Repeat

Date: 2026-06-07

- Initial smoke commit `0513268`: Preview-only deployment created, build
  failed because three Autopilot admin pages contained partial merge
  regressions.
- Corrective commit `ee73eb9`: local build and all required checks passed.
- Vercel result: `PASS` in both observed scopes.
- Deployment classification: `Preview`, `production_environment=false`.
- Production deployment triggered: `NO`.
- PR #25 remains draft and unchanged.

Decision: `GO_INTEGRATION_PREVIEW_ONLY`.
