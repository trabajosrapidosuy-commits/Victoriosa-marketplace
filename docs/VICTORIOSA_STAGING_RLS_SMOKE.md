# Victoriosa Staging RLS Smoke

## Purpose

Validate the anonymous read boundary of the canonical `marketplace_products`
table against a non-production Supabase project.

## Secure Loading

Load these variables in the local shell or a secure staging secret store. Do not
paste values into chat, docs, commits or client code.

```powershell
$env:SUPABASE_STAGING_URL = "<secure staging URL>"
$env:SUPABASE_STAGING_ANON_KEY = "<secure staging anon key>"
npm run staging:check
npm run rls:smoke
```

The current smoke intentionally uses the staging anon key only. It verifies:

- anonymous rows are limited to `published`, `approved`, `low`;
- anonymous draft queries return zero rows;
- anonymous requests cannot read the seven internal Autopilot tables;
- missing variables stop execution before network access.

## Latest Execution

`2026-06-01`: `CHECK_NOT_RUN`. Both allowed staging variables were absent from
the execution environment. The script stopped before network access. No
service-role credential was present or used.

## Remaining Staging Work

Authenticated admin mutation smoke needs a dedicated non-production test
identity and a separately scoped script. Create the identity through a secure
staging-only operational path and assign the minimum required staging role. Do
not use production identities, service-role credentials or bypass policies.

## Rollback

The scripts are read-only. To stop execution, remove the staging variables from
the shell. If a smoke fails, do not weaken RLS; inspect the staging migration and
policies, apply an idempotent staging-only correction and rerun the checks.
