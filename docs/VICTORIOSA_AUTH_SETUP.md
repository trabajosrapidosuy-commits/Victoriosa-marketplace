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

## Supabase Dashboard Configuration

Configure only the authorized staging project:

- Site URL for local smoke: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`
- Redirect URL: `http://localhost:3000/auth/reset-password`
- Redirect URL: `http://localhost:3101/auth/callback`
- Redirect URL: `http://localhost:3101/auth/reset-password`
- Add the exact Vercel Preview URLs before authenticated Preview smoke.
- Current Preview pending allowlist confirmation:
  `https://victoriosa-marketplace-3id8vyhgs-akuma424-projects.vercel.app/auth/callback`
- Current Preview pending allowlist confirmation:
  `https://victoriosa-marketplace-3id8vyhgs-akuma424-projects.vercel.app/auth/reset-password`

Do not paste keys into chat. Keep the existing public browser variables in
`.env.local` and Vercel Preview scope only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never expose a service-role key to browser code.

## Controlled Smoke

1. Create a dedicated staging-only test identity outside chat.
2. Confirm the email in the staging mailbox.
3. Verify login, logout, callback and password reset.
4. Verify profile and preferences update only the authenticated user's rows.
5. Verify a normal user cannot access `/admin`.
6. Verify anonymous users are redirected from `/account` and `/wishlist`.

## External Blockers

- `BLOCKED_EXTERNAL_CREDENTIALS`: positive admin browser smoke needs the
  existing staging admin identity loaded through a secure local mechanism.
- `BLOCKED_EXTERNAL_CREDENTIALS`: interactive Google login needs an approved
  staging-only Google identity.
- `BLOCKED_SUPABASE_ACCESS`: add the current Sofia Victoria Preview callback
  and reset URLs before Preview OAuth smoke.
- `BLOCKED_EXTERNAL_CREDENTIALS`: public signup reached Supabase but email
  delivery validation returned HTTP `429`; retry after provider cooldown.
