# Victoriosa Vercel Deploy Runbook

## Production Status

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Safe Preview Command

Use only:

```powershell
npm run deploy:preview
```

The script now enforces a local project-link guard before calling Vercel. It
fails closed unless `.vercel/project.json` is linked to
`victoriosa-marketplace`.

The wrapper still expands to an explicit Preview target. Vercel rejects
`--skip-domain` for Preview deployments, so the wrapper does not include it.
Do not run a bare Vercel deploy command. Do not use production flags, promote,
rollback or alias mutation without explicit human approval.

## Required Preview Variables

Configure only these public browser variables for the approved branch:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Approved branch:
`codex/victoriosa-autopilot-admin-control-center`

Approved Supabase staging ref:
`ngliugfcwydnfbpalkpb`

Never add a service-role or secret key to a public variable.

## Incident Record

On 2026-06-03 local Vercel link drift pointed this worktree at
`victoriosa-autopilot-admin-control-center` instead of
`victoriosa-marketplace`. A Preview deploy command executed before relinking
created a `Ready` deployment with `target=production` and alias
`https://victoriosa-autopilot-admin-control.vercel.app`. No production flag or
promote command was used. The isolated project currently returns HTTP `500`,
but it remains an unauthorized production-target mutation that must not be
silently ignored.

Do not remove aliases, roll back or delete the deployment automatically.
Those actions require explicit human approval.

## Local Link Guard

Before every safe preview deploy:

1. Verify `.vercel/project.json` exists.
2. Verify `projectName` is exactly `victoriosa-marketplace`.
3. If the guard fails, relink explicitly:

```powershell
vercel link --yes --project victoriosa-marketplace --scope akuma424-projects
```

Do not proceed with deploy until the guard passes.

## Preview Verification

After a safe Preview deployment:

1. Inspect the deployment and confirm `target=preview`.
2. Verify `/`, `/productos` and `/api/marketplace/products`.
3. Verify legacy API handlers return `410 LEGACY_API_DEPRECATED`.
4. Verify anonymous `/admin/marketplace` redirects away from admin.
5. Execute authenticated admin smoke using staging credentials loaded through
   a secure local mechanism.

## Current Preview

- URL:
  `https://victoriosa-marketplace-9qlh7ft0x-akuma424-projects.vercel.app`
- Target: `preview`
- Status: `Ready`
- Deployment Protection: enabled. Anonymous requests return HTTP `401`.
- Existing local automation bypass: not valid for this project.
- Preview-only `VICTORIOSA_DEMO_MODE=true`: enabled for controlled product,
  cart and manual checkout demonstration. Do not add it to Production.

## Human Cleanup Runbook For Wrong Project

Target project requiring manual review:
`victoriosa-autopilot-admin-control-center`

Observed URLs:

- deployment:
  `https://victoriosa-autopilot-admin-control-center-fnzikv9jo.vercel.app`
- alias:
  `https://victoriosa-autopilot-admin-control.vercel.app`

Required human review steps:

1. Open the isolated Vercel project dashboard, not `victoriosa-marketplace`.
2. Confirm the deployment target is `production`.
3. Capture current alias state and deployment event history.
4. Decide one explicit action:
   - remove alias
   - roll back to a known-safe state
   - delete the isolated project if it is not needed
5. Record the decision in the director status after human execution.

Codex must not execute those cleanup steps without explicit human approval.
