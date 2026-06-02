# Cycle Victoriosa Private Admin Autopilot Separation

## Mode

`VICTORIOSA_PRIVATE_ADMIN_AUTOPILOT_SEPARATION`

## Architecture

Selected progressive separation inside the current Next.js app.

## Result

- Removed admin discovery from the storefront header.
- Removed Google OAuth controls from customer UI while provider review remains
  pending.
- Added private `Victoriosa Studio` layout with independent navigation.
- Added `/owner` and `/owner/autopilot` private compatibility aliases.
- Moved middleware into `src/middleware.ts`, making Next compile and execute it.
- Added noindex metadata and private-surface header omission.

## Smoke

- Anonymous `/admin`, `/owner`, `/owner/autopilot`: redirect to login.
- Customer `/account`: PASS.
- Customer `/admin/autopilot` and `/owner`: rejected to `/`.
- Customer Autopilot read hidden and write blocked by RLS.
- Temporary admin `/owner`: redirects to `/admin`.
- Temporary admin sees `Victoriosa Studio`, no storefront header.
- Temporary admin `/owner/autopilot`: redirects to `/admin/autopilot`.
- Temporary staging fixtures deleted.
- Explicit protected Preview:
  `https://victoriosa-marketplace-70wtw9qlb-akuma424-projects.vercel.app`.
- Preview metadata: `target=preview`, `Ready`, anonymous HTTP `401`.

## Checks

- `npm run ci`: PASS, 36 tests and 48 built routes.
- `npm run staging:check`: PASS.
- `npm run rls:smoke`: PASS.
- `git diff --check`: PASS.

## Safety

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

- No production deploy or promotion.
- No Production environment mutation.
- No payment activation.
- No secrets printed or committed.

## Next Mode

`VICTORIOSA_PRIVATE_ADMIN_PREVIEW_AND_CONTROLLED_RELEASE_REVIEW`
