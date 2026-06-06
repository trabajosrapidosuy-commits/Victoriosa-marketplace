# Victoriosa K-beauty Staging Auth Gate

## Objetivo

Preparar el apply y el seed K-beauty para un target no productivo, pero bloquear cualquier write hasta que exista credencial server-side y autorizacion humana explicita del target.

## Estado actual

- Target autorizado documentado:
  - `https://ngliugfcwydnfbpalkpb.supabase.co`
- `SUPABASE_URL`: `MISSING`
- `SUPABASE_SERVICE_ROLE_KEY`: `SET`
- `NEXT_PUBLIC_SUPABASE_URL`: `SET`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `SET`
- `AUTHORIZED_STAGING_TARGET`: `MISSING`
- `PRODUCTION_STATUS`: `NO-GO_PRODUCTION`
- `check:kbeauty-persistence`: `PASS/PARTIAL`
- Apply remoto ejecutado: `NO`
- Seed write ejecutado: `NO`

## Condicion requerida para apply

No ejecutar apply ni seed write hasta que ambas condiciones sean verdaderas:

- `SUPABASE_URL=SET`
- `AUTHORIZED_STAGING_TARGET=true`

Ademas:

- el target debe coincidir exactamente con `https://ngliugfcwydnfbpalkpb.supabase.co`
- la migracion debe seguir siendo local-only hasta autorizacion explicita
- `PRODUCTION_STATUS` debe seguir en `NO-GO_PRODUCTION`

## Comando local recomendado para cargar URL

```powershell
$env:SUPABASE_URL="https://ngliugfcwydnfbpalkpb.supabase.co"
```

Advertencia:

`No usar esta URL para write hasta confirmar que el proyecto sigue siendo staging/no productivo y que AUTHORIZED_STAGING_TARGET=true fue habilitado de forma humana y auditable.`

## Apply staging propuesto pero no ejecutado

```powershell
supabase db push --db-url "$env:SUPABASE_URL"
```

## Verificacion post-apply propuesta

```powershell
npm run check:kbeauty-persistence -- --write --target=staging
```

Confirmar:

- `autopilot_research_runs`: READY
- `autopilot_brand_candidates`: READY
- `autopilot_supplier_contacts`: READY
- `autopilot_import_requirements`: READY
- no productos `published`
- `representation_status=not_official`

## Seed write propuesto pero no ejecutado

```powershell
npm run seed:autopilot:kbeauty -- --write --target=staging --confirm-review-only
```

Solo permitido si:

- `SUPABASE_URL=SET`
- `SUPABASE_SERVICE_ROLE_KEY=SET`
- `AUTHORIZED_STAGING_TARGET=true`
- migracion aplicada
- readiness PASS completo
- `PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Rollback plan

1. detener cualquier intento de seed write
2. no ejecutar imports adicionales
3. preparar rollback SQL local antes de cualquier apply adicional
4. confirmar que `marketplace_products` sigue sin publicaciones
5. confirmar que no existe representacion oficial

## Advertencia final

No ejecutar contra produccion ni contra el Supabase que sostenga ventas reales.
