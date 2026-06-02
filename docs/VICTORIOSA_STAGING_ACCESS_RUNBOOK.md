# Victoriosa Staging Access Runbook

## Approved Target Gate

Victoriosa project confirmed by the user:

`ngliugfcwydnfbpalkpb`

Blocked target:

`dpwassnykcrgjwrruckz`

Do not reuse credentials from the blocked target. Do not run smoke tests or
migrations until `ngliugfcwydnfbpalkpb` is explicitly authorized as the
non-production controlled environment for this cycle.

## Secure Local Variables

Load values outside chat, docs and commits:

```powershell
$env:SUPABASE_STAGING_URL = "https://ngliugfcwydnfbpalkpb.supabase.co"
$env:SUPABASE_STAGING_ANON_KEY = "<secure anon or publishable key>"
```

If the local app must use the same controlled target, update `.env.local`
outside Git with:

```text
NEXT_PUBLIC_SUPABASE_URL=https://ngliugfcwydnfbpalkpb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<secure anon or publishable key>
```

Never print key values. Verify only `SET` or `MISSING`.

## Safe Sequence

1. Keep `dpwassnykcrgjwrruckz` blocked.
2. Load the secure public variables for `ngliugfcwydnfbpalkpb`.
3. Run `npm run staging:check`.
4. Run `npm run rls:smoke`.
5. Create a dedicated staging admin identity through a secure path.
6. Execute authenticated admin-boundary smoke.

## Applied Migrations

Applied only to `ngliugfcwydnfbpalkpb`:

1. `victoriosa_marketplace_foundation`
2. `victoriosa_autopilot_foundation`
3. `victoriosa_autopilot_admin_boundary`

## Completed Anonymous Smoke

For `ngliugfcwydnfbpalkpb`:

- `npm run staging:check`: PASS
- `npm run rls:smoke`: PASS
- anon-visible internal Autopilot rows: ZERO

## Completed Authenticated Smoke

Completed on 2026-06-02 against `ngliugfcwydnfbpalkpb` only:

- `authenticated = 1`
- `marketplace_admin = 1`
- `total_profiles = 2`
- all profiles reference existing Auth users
- anonymous internal table exposure: ZERO
- authenticated non-admin admin mutation: BLOCKED HTTP 403
- marketplace admin canonical internal reads: PASS
- controlled discovery, approve, reject and import-to-draft: PASS
- imported smoke product remained `draft + needs_review + medium`
- automatic publication, supplier purchase and outbound email: NOT EXECUTED

No emails, UUIDs, passwords, tokens or keys were written to docs or logs.

## Completed Persistent Import Smoke

Completed on 2026-06-02 against `ngliugfcwydnfbpalkpb` only:

- supplier persisted in `needs_review`
- import batch persisted and completed
- raw and normalized import row persisted
- product persisted as `draft + needs_review + medium`
- review queue row persisted as `open`
- authenticated non-admin import mutation blocked with HTTP 403
- anonymous import rows visible: ZERO
- anonymous draft products visible: ZERO
- outbound email, supplier purchase, payments and automatic publication:
  NOT EXECUTED

## Dedicated Admin Identity

Remote Auth currently has zero users. Complete this manually outside chat:

1. Open the Supabase Dashboard for `ngliugfcwydnfbpalkpb`.
2. Go to Authentication, then Users, then create a dedicated non-personal
   staging user with a password stored only in the approved secret manager.
3. Keep the generated user UUID private.
4. In the SQL editor for `ngliugfcwydnfbpalkpb` only, run:

```sql
insert into public.marketplace_profiles (id, role)
values ('<private-staging-auth-user-uuid>', 'marketplace_admin')
on conflict (id) do update
set role = excluded.role,
    updated_at = now();
```

5. Run authenticated admin smoke without writing credentials or UUIDs to logs,
   docs or commits.

Do not use `service_role` in client code. Do not create users through ad hoc
direct inserts into `auth.users`.

## Stop Conditions

Stop immediately for production data, real customers, branch ambiguity, missing
keys, RLS failure or any need to weaken policies.
# Vercel Preview Link

1. Use the existing Vercel project `victoriosa-marketplace`.
2. Grant the Vercel identity access to
   `trabajosrapidosuy-commits/Victoriosa-marketplace` or connect the repository
   manually from the Vercel dashboard.
3. Scope Preview variables only to branch
   `codex/victoriosa-staging-foundation-publish`.
4. Add only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   through secure input. Do not print their values.
5. Do not add Production variables and do not deploy Production.
