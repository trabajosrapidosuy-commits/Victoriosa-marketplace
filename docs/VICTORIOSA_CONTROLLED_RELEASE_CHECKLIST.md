# Victoriosa Controlled Release Checklist

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

This checklist requires explicit human review. It does not authorize a
Production deployment or promotion.

## Technical Evidence

- [ ] PR reviewed manually.
- [x] Local CI green.
- [x] Domain apex HTTPS green.
- [x] Domain WWW HTTPS green.
- [x] Email/password Auth green.
- [x] Reset-password green.
- [x] Logout green.
- [x] RLS smoke green.
- [x] Customer/admin boundary green.
- [x] OAuth consent information page implemented locally.
- [x] Privacy page implemented locally.
- [x] Terms page implemented locally.
- [x] Temporary fixtures removed; remote residue zero.

## Human Review Before Any Release

- [ ] Review legal wording with the responsible human owner.
- [ ] Review Production environment variables without pasting secrets.
- [ ] Confirm payments, providers live and automatic publication remain off.
- [ ] Review rollback plan for Vercel aliases and deployment.
- [ ] Assign a human release owner.
- [ ] Record explicit human GO before any Production deploy or promote.

## Current Blockers

- Public domain currently serves an older deployment. `/oauth/consent`,
  `/privacy` and `/terms` remain HTTP `404` until a separately authorized
  release updates the public deployment.
- GitHub PR creation API is unavailable for this account. Open the manual PR
  and complete review there.
