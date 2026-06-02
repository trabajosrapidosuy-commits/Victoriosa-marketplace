# Cycle Victoriosa Final MVP Supabase Vercel

Fecha: 2026-06-02

## Resultado

- Supabase staging `ngliugfcwydnfbpalkpb`: validated.
- Vercel project `victoriosa-marketplace`: linked.
- Preview branch variables: configured with public URL and anon key only.
- Explicit Preview deployment: READY, `target=preview`.
- Preview URL:
  `https://victoriosa-marketplace-e6anpnzsf-akuma424-projects.vercel.app`.
- Preview Deployment Protection: PASS, anonymous requests return HTTP `401`.
- Project-specific Preview automation bypass:
  CHECK_NOT_RUN_BLOCKED_EXTERNAL_CREDENTIALS.
- Public deployed smoke: PASS.
- Deployed URL: `https://victoriosa-marketplace-ecru.vercel.app`.
- Public catalog API: PASS, empty safe response.
- Legacy products, orders and import handlers: PASS, deprecated.
- Anonymous admin boundary: PASS, redirect away from admin.
- Authenticated deployed admin smoke: CHECK_NOT_RUN_BLOCKED_EXTERNAL_CREDENTIALS.
- Browser embedded smoke: CHECK_NOT_RUN_BROWSER_HOST_ATTACH_TIMEOUT.
- Mitigation PR creation: BLOCKED_MISSING_ACCESS.
- `PRODUCTION_STATUS=NO-GO_PRODUCTION`.

## Production Incident

A bare Vercel deploy command unexpectedly created a Ready deployment with
`target=production` and assigned aliases even though no production flag or
promote command was used. No rollback, alias mutation or deletion was executed
because those are Production changes requiring explicit human approval.

## Risk Reduction

- Added `npm run deploy:preview` with explicit Preview target and alias
  suppression.
- Added `docs/VICTORIOSA_VERCEL_DEPLOY_RUNBOOK.md`.
- Kept service-role keys out of Vercel public variables.
- Kept payments, outbound email, supplier purchase and automatic publication
  disabled.

## Next Human Decision

Choose whether to remove the accidental Production aliases or roll back the
deployment. After that decision, run the explicit Preview script and complete
authenticated staging admin smoke.
