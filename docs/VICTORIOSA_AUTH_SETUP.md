# Victoriosa Auth Setup

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Implemented

- Supabase email and password registration, login, logout and reset flow.
- SSR session refresh through `middleware.ts`.
- Private `/account`, profile, preferences, orders and favorites surfaces.
- `marketplace_profiles` extension plus `user_settings`, trigger and RLS migration.
- Existing admin role boundary preserved through `requireAdmin`.
- Google OAuth remains intentionally disabled until provider setup is reviewed.

## Supabase Dashboard Configuration

Configure only the authorized staging project:

- Site URL for local smoke: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`
- Redirect URL: `http://localhost:3000/auth/reset-password`
- Add the exact Vercel Preview URLs before authenticated Preview smoke.

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

- `BLOCKED_EXTERNAL_CREDENTIALS`: authenticated smoke needs a dedicated
  staging-only mailbox identity created outside chat.
- `BLOCKED_SUPABASE_ACCESS`: dashboard redirect URL allowlist must be confirmed
  before Preview callback smoke.
