# Cycle Victoriosa 022

## Mode

`VICTORIOSA_STAGING_AUTHENTICATED_ACCOUNT_SMOKE`

## Result

- Confirmed local Supabase target is authorized staging `ngliugfcwydnfbpalkpb`.
- Ran reversible remote auth smoke with temporary `example.invalid` users.
- Verified login, session, profile trigger, settings trigger, own updates,
  cross-user isolation, recovery token, password reset and logout.
- Ran browser smoke for login, account, profile, settings, orders, favorites,
  cart, non-admin rejection and logout.
- Confirmed Google OAuth provider redirects to Google for local and documented
  Preview callback origins without completing an external login.
- Confirmed one staging admin profile exists. Positive admin browser smoke
  remains blocked because its credentials are not loaded locally.
- Public signup reached Supabase but email confirmation delivery validation
  returned HTTP `429`; no temporary user residue remained.

## Security Finding And Fix

The first RLS smoke found that an authenticated user could update their profile
`role` because a broad Postgres privilege survived alongside column grants.

Applied staging migration:

`victoriosa_profile_role_escalation_guard`

The migration revokes broad profile and settings updates, reapplies safe column
grants and adds a trigger rejecting role changes unless the request is
`service_role`. The full reversible smoke then passed, including a remote role
read after the blocked escalation attempt.

## Safety

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

- No production deployment, promotion or Production environment mutation.
- Temporary users and local credential artifact were deleted.
- No customer email, payment or supplier action.
- No secrets printed or committed.

## Remaining External Verification

- Add the current Sofia Victoria Preview callback and reset URLs to Supabase
  Auth allowlist.
- Run one controlled interactive Google login using an approved staging-only
  Google identity.
- Run admin-positive browser smoke only when a dedicated staging admin exists.

## Next Mode

`VICTORIOSA_STAGING_GOOGLE_OAUTH_AND_ADMIN_POSITIVE_SMOKE`
