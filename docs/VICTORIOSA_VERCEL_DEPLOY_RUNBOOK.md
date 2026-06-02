# Victoriosa Vercel Deploy Runbook

## Production Status

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Safe Preview Command

Use only:

```powershell
npm run deploy:preview
```

The script expands to an explicit Preview target. Vercel rejects
`--skip-domain` for Preview deployments, so the wrapper does not include it.
Do not run a bare Vercel deploy command. Do not use production flags, promote,
rollback or alias mutation without explicit human approval.

## Required Preview Variables

Configure only these public browser variables for the approved branch:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Approved branch:
`codex/victoriosa-staging-foundation-publish`

Approved Supabase staging ref:
`ngliugfcwydnfbpalkpb`

Never add a service-role or secret key to a public variable.

## Incident Record

On 2026-06-02 a bare Vercel deploy command unexpectedly created a deployment
with `target=production` and assigned aliases. No production flag or promote
command was used. The deployment rendered the public empty catalog safely, but
it remains an unauthorized Production mutation.

Do not remove aliases, roll back or delete the deployment automatically.
Those actions require explicit human approval.

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
  `https://victoriosa-marketplace-i9nqyd117-akuma424-projects.vercel.app`
- Target: `preview`
- Status: `Ready`
- Deployment Protection: enabled. Anonymous requests return HTTP `401`.
- Existing local automation bypass: not valid for this project.
- Preview-only `VICTORIOSA_DEMO_MODE=true`: enabled for controlled product,
  cart and manual checkout demonstration. Do not add it to Production.
