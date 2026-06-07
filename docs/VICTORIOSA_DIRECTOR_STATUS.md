# Victoriosa Director Status

## Current Mode

`VICTORIOSA_STAGING_EXPLICIT_APPLY_AUTHORIZATION`

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

Mode: `VICTORIOSA_STAGING_MIGRATION_IDEMPOTENCY_RECONCILIATION`

Objective: make the nine pending migrations safely idempotent against the
existing staging schema, starting with duplicate policy handling. Work locally
and produce a reviewable dry-run; do not execute another real apply.

Context:

- Authorized staging ref: `ngliugfcwydnfbpalkpb`.
- The authorized apply stopped in migration 1 because a policy already exists.
- No pending migration was recorded as applied.
- K-beauty tables remain absent and seed stayed blocked.

Safety:

- Keep `PRODUCTION_STATUS=NO-GO_PRODUCTION`.
- No production, deploy, payment, publication, seed, real `db push`, migration
  repair, destructive SQL, secret output, client service role, or RLS
  relaxation.
- Preserve unrelated `tsconfig.json` and `.vscode` changes.

Tasks:

1. Revalidate worktree, target and env as `SET/MISSING`.
2. Inventory every non-idempotent policy, trigger, grant and constraint in the
   nine pending migrations.
3. Add safe `drop ... if exists` or catalog-guarded statements where required.
4. Preserve RLS, review-only states and public catalog constraints.
5. Run all local checks and one expanded dry-run only.
6. Do not use `migration repair` and do not execute a real push.

GO: migrations are idempotent, checks pass and the dry-run remains the exact
reviewed plan.

NO-GO: destructive reconciliation, RLS regression, plan drift or unresolved
existing-object conflicts.

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
