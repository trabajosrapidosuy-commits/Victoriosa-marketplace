# Victoriosa Custom Domain Controlled Release Review

Date: 2026-06-02

Mode: `VICTORIOSA_CUSTOM_DOMAIN_CONTROLLED_RELEASE_REVIEW`

Branch: `codex/victoriosa-domain-ssl-dns-rescue`

## Scope

Reviewed the custom-domain Auth/OAuth release surface without deploying,
promoting or mutating Production configuration.

## Changes

- Added public informational route `/privacy`.
- Added public informational route `/terms`.
- Linked `/oauth/consent` to Home, Privacy and Terms.
- Added tests for the legal pages and disabled live-commerce claims.
- Added `docs/VICTORIOSA_CONTROLLED_RELEASE_CHECKLIST.md`.

## Evidence

- `npm run ci`: PASS, 50 tests and 55 built routes plus Middleware.
- `npm run staging:check`: PASS.
- `npm run rls:smoke`: PASS, anonymous catalog boundary and 9 internal
  Autopilot tables verified with zero visible rows.
- Local route smoke: PASS for `/oauth/consent`, `/privacy` and `/terms`.
- Public apex and WWW home: HTTP `200`.
- Public `/account`, `/admin` and `/owner/autopilot`: HTTP `307` to login.
- Public `/oauth/consent`, `/privacy` and `/terms`: HTTP `404` on the current
  public deployment because this branch has not been released.
- `git diff --check`: PASS.

## Production Safety

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

- No `vercel --prod`.
- No `vercel promote`.
- No Production environment mutation.
- No live payments.
- No supplier live actions.
- No Google OAuth public activation.
- No secrets printed.
- No RLS relaxation.

## Blockers

- `BLOCKED_PRODUCTION_RISK`: deploying or promoting the current branch to make
  the informational URLs public requires explicit human release approval.
- `BLOCKED_MISSING_ACCESS`: GitHub API PR creation remains blocked by
  collaborator permissions; use the manual PR URL.

Manual PR URL:
`https://github.com/trabajosrapidosuy-commits/Victoriosa-marketplace/pull/new/codex/victoriosa-domain-ssl-dns-rescue`

## GO / NO-GO

GO for human PR review and release decision.

NO-GO for Production release until a human approves the release checklist.

