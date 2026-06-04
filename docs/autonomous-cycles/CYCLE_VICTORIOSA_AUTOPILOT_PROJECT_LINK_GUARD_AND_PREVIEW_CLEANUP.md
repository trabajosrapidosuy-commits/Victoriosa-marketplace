# Cycle: Victoriosa Autopilot Project Link Guard And Preview Cleanup

Date: 2026-06-03

Mode: `VICTORIOSA_AUTOPILOT_PROJECT_LINK_GUARD_AND_PREVIEW_CLEANUP`

Branch: `codex/victoriosa-autopilot-admin-control-center`

## Goal

Prevent future Preview deploys from targeting the wrong Vercel project and
document the human-only cleanup path for the isolated production-target
deployment incident.

## Changes

- Added `scripts/guard-vercel-project-link.mjs`
- Added `npm run guard:vercel-project-link`
- Wrapped `npm run deploy:preview` so it fails closed unless
  `.vercel/project.json` points to `victoriosa-marketplace`
- Updated Vercel deploy runbook with:
  - explicit relink command
  - current correct Preview URL
  - human-only cleanup steps for the isolated wrong project
- Updated director status and JSON audit surface

## Guard Contract

Expected local Vercel project:
`victoriosa-marketplace`

Guard behavior:

- FAIL if `.vercel/project.json` is missing
- FAIL if JSON is invalid
- FAIL if `projectName` is not `victoriosa-marketplace`
- PASS only when the worktree is linked to the intended project

## Human Cleanup Scope

Wrong project:
`victoriosa-autopilot-admin-control-center`

Observed URLs:

- `https://victoriosa-autopilot-admin-control-center-fnzikv9jo.vercel.app`
- `https://victoriosa-autopilot-admin-control.vercel.app`

Cleanup remains human-only because the observed deployment has
`target=production` on the isolated project.

## Safety

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

- No `vercel --prod`
- No `vercel promote`
- No Production env mutation
- No remote alias mutation
- No remote deletion
- No secrets printed
- No RLS relaxation

## Checks

- `npm run ci`: PASS
- `npm run staging:check`: CHECK_NOT_RUN, blank `SUPABASE_STAGING_URL` and
  `SUPABASE_STAGING_ANON_KEY` in `.env.rls`
- `npm run rls:smoke`: CHECK_NOT_RUN, same blank secure staging values
- `npm run guard:vercel-project-link`: PASS
- `git diff --check`: PASS

## Outcome

- Future local Preview deploys now stop before Vercel if the worktree points to
  the wrong project.
- The correct Preview project expectation is now explicit in code and docs.
- The cleanup path for the wrong-project production-target deployment is
  documented but still blocked on human approval.
- Local secure staging env restore is still required before this worktree can
  rerun `staging:check` and `rls:smoke`.

## Next

Recommended next mode:
`VICTORIOSA_AUTOPILOT_SECURE_STAGING_ENV_RESTORE`

Reason: the deploy path is now hardened, but this worktree cannot rerun the
staging checks until secure `SUPABASE_STAGING_*` values are restored locally.
