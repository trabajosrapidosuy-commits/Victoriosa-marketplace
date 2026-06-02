# Victoriosa Domain, DNS and SSL Setup

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Current Verified State

Verified on `2026-06-02` without deploying or mutating Production:

- Vercel project: `victoriosa-marketplace`.
- Apex DNS: `victoriosa.click -> 76.76.21.21`.
- WWW DNS: `www.victoriosa.click -> cname.vercel-dns-016.com`.
- `https://victoriosa.click`: HTTP `200`, `Server: Vercel`, HSTS enabled.
- `https://www.victoriosa.click`: HTTP `200`, `Server: Vercel`, HSTS enabled.
- TLS apex certificate: Let's Encrypt, `CN=victoriosa.click`, expires
  `2026-08-31`.

The earlier `216.150.16.1` and `216.150.16.129` result is no longer the apex
configuration. Those addresses may appear behind the Vercel WWW CNAME and must
not be copied into apex A records.

## Registrator Records

If the domain is moved away from Vercel nameservers, remove conflicting apex
records first:

```text
A      @      216.150.16.1
A      @      216.150.16.129
AAAA   @      any value
CNAME  @      any value
URL Forwarding / Redirect / Parking
```

Then configure:

```text
A      @      76.76.21.21
TTL    Auto or 3600
```

For WWW, use the exact Vercel value currently verified for this project:

```text
CNAME  www    cname.vercel-dns-016.com
TTL    Auto or 3600
```

Do not replace a project-specific Vercel CNAME with a generic example unless
Vercel Domains explicitly instructs that change.

## Application URL

Set only through the reviewed environment-specific Vercel configuration:

```text
NEXT_PUBLIC_SITE_URL=https://victoriosa.click
NEXT_PUBLIC_APP_URL=https://victoriosa.click
```

No Production environment mutation was executed in this cycle.

## Verification Commands

```powershell
nslookup victoriosa.click 1.1.1.1
nslookup www.victoriosa.click 1.1.1.1
curl.exe -I https://victoriosa.click
curl.exe -I https://www.victoriosa.click
vercel domains inspect victoriosa.click
```
