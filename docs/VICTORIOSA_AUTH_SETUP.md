# Victoriosa Auth Setup

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Implemented

- Supabase email and password registration, login, logout and reset flow.
- SSR session refresh through `middleware.ts`.
- Private `/account`, profile, preferences, orders and favorites surfaces.
- `marketplace_profiles` extension plus `user_settings`, trigger and RLS migration.
- Existing admin role boundary preserved through `requireAdmin`.
- Google OAuth provider may be configured in Supabase, but customer UI remains
  intentionally inactive until controlled review approves activation.
- Public OAuth consent information URL:
  `https://victoriosa.click/oauth/consent`.

## Supabase Dashboard Configuration

Configure only the authorized Supabase project after the custom-domain review:

- Site URL: `https://victoriosa.click`
- Redirect URL: `https://victoriosa.click/auth/callback`
- Redirect URL: `https://victoriosa.click/auth/reset-password`
- Redirect URL: `https://www.victoriosa.click/auth/callback`
- Redirect URL: `https://www.victoriosa.click/auth/reset-password`
- Redirect URL: `http://localhost:3000/auth/callback`
- Redirect URL: `http://localhost:3000/auth/reset-password`
- Redirect URL: `http://localhost:3101/auth/callback`
- Redirect URL: `http://localhost:3101/auth/reset-password`

For controlled Vercel Preview testing, Supabase documents this wildcard pattern:

```text
https://*-akuma424-projects.vercel.app/**
```

Keep exact callback and reset URLs for the custom production hosts. Wildcards
are for controlled Preview routes only.

Do not paste keys into chat. Keep the existing public browser variables in
`.env.local` and Vercel Preview scope only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL=https://victoriosa.click`
- `NEXT_PUBLIC_APP_URL=https://victoriosa.click`

Never expose a service-role key to browser code.

For the external OAuth provider consent-screen configuration, use:

```text
https://victoriosa.click/oauth/consent
```

For the same external review surface, use:

```text
Privacy policy URL: https://victoriosa.click/privacy
Terms URL: https://victoriosa.click/terms
```

These informational routes do not activate Google OAuth by themselves. They
must be deployed only through a separately approved release.

## Controlled Smoke

1. Create a dedicated staging-only test identity outside chat.
2. Confirm the email in the staging mailbox.
3. Verify login, logout, callback and password reset.
4. Verify profile and preferences update only the authenticated user's rows.
5. Verify a normal user cannot access `/admin`.
6. Verify anonymous users are redirected from `/account` and `/wishlist`.

## Custom-Domain Smoke Evidence

Completed on `2026-06-02` with reversible staging fixtures:

- Supabase accepted signup and recovery redirects for apex and WWW.
- Signup confirmation and recovery password update passed through OTP
  verification without exposing tokens.
- Apex and WWW login, account and logout passed in a real browser.
- Callback without a code fails closed to login on apex and WWW.
- Customer remains blocked from Studio routes.
- All temporary identities were deleted; remote residue is zero.

## External Blockers

- `BLOCKED_EXTERNAL_CREDENTIALS`: positive admin browser smoke needs the
  existing staging admin identity loaded through a secure local mechanism.
- `BLOCKED_EXTERNAL_CREDENTIALS`: interactive Google login needs an approved
  staging-only Google identity.
- `BLOCKED_SUPABASE_ACCESS`: add the current Sofia Victoria Preview callback
  and reset URLs before Preview OAuth smoke.
- `BLOCKED_SUPABASE_ACCESS`: apply the reviewed `victoriosa.click` Site URL and
  redirect allowlist in Supabase Auth URL Configuration after human review.
- `BLOCKED_EXTERNAL_CREDENTIALS`: public signup reached Supabase but email
  delivery validation returned HTTP `429`; retry after provider cooldown.
