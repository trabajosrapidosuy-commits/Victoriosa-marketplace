# Cycle: Victoriosa Domain SSL DNS Rescue

## Mode

`VICTORIOSA_DOMAIN_SSL_DNS_RESCUE_AND_AUTH_URL_PREP`

## Safety

- `PRODUCTION_STATUS=NO-GO_PRODUCTION`
- No deployment, promote, Production environment mutation, payment, Google
  OAuth activation, RLS change or secret output.

## Result

- Domain was already attached by the owner to linked Vercel project
  `victoriosa-marketplace`.
- Apex DNS verified as `76.76.21.21`.
- WWW verified as project-specific `cname.vercel-dns-016.com`.
- Apex and WWW HTTPS respond `200` from Vercel with HSTS.
- Apex TLS certificate is valid Let's Encrypt certificate through `2026-08-31`.
- `openssl`: CHECK_NOT_AVAILABLE on this Windows host.
- Public URL helper implemented with canonical, Preview and local fallbacks.
- Supabase Auth Site URL and redirect allowlist documented for human dashboard
  application.

## Human Action

Review `docs/VICTORIOSA_DOMAIN_SETUP.md` and apply the documented Auth URL
Configuration in Supabase. Keep Production deployment review separate.
