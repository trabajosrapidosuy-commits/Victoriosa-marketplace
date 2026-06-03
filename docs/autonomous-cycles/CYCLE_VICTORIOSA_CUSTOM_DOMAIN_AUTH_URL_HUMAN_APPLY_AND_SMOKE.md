# Cycle: Victoriosa Custom Domain Auth URL Human Apply and Smoke

## Mode

`VICTORIOSA_CUSTOM_DOMAIN_AUTH_URL_HUMAN_APPLY_AND_SMOKE`

## Safety

- `PRODUCTION_STATUS=NO-GO_PRODUCTION`
- No deploy, promote, Production environment mutation, payment, provider live
  activation, Google OAuth activation or RLS change.
- Tokens, cookies and fixture credentials were never printed.
- Temporary identities and local browser artifacts were deleted.

## Result

- Apex and WWW HTTPS: PASS, HTTP `200`, Vercel, HSTS and valid Let's Encrypt
  certificates through `2026-08-31`.
- Supabase signup redirects: PASS for apex and WWW.
- Supabase recovery redirects: PASS for apex and WWW.
- Signup confirmation OTP: PASS.
- Reset-password recovery OTP, update and subsequent login: PASS.
- Callback route without code: PASS, fail-closed on apex and WWW.
- Apex and WWW browser login, account and logout: PASS.
- Customer Studio access: BLOCKED.
- `npm run ci`: PASS, 48 tests.
- `npm run staging:check`: PASS.
- `npm run rls:smoke`: PASS, nine internal Autopilot tables.
- Remote residue after cleanup: ZERO users, products and candidates.
