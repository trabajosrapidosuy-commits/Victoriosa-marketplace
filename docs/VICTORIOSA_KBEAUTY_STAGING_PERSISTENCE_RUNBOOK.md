# Victoriosa K-Beauty Staging Persistence Runbook

## Objetivo

Preparar apply y seed no productivos para la cola K-beauty review-only. Este
runbook no autoriza ejecutar contra produccion.

## Target permitido

- staging no productivo del proyecto Victoriosa Marketplace
- nunca production
- target staging autorizado actualmente documentado:
  - `https://ngliugfcwydnfbpalkpb.supabase.co`

## Estado remoto actual conocido

Tablas Autopilot existentes:

- `autopilot_discovery_runs`
- `autopilot_product_candidates`
- `autopilot_review_events`

Tablas K-beauty faltantes en remoto:

- `autopilot_brand_candidates`
- `autopilot_supplier_contacts`
- `autopilot_import_requirements`

## Variables requeridas

Reportar solo `SET` o `MISSING`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AUTHORIZED_STAGING_TARGET`

## Preconditions

- `PRODUCTION_STATUS=NO-GO_PRODUCTION`
- migracion local presente:
  - `supabase/migrations/20260605000100_victoriosa_kbeauty_research_review_only.sql`
- `check:supabase-env` PASS
- `check:kbeauty-persistence` indica readiness compatible con el target

## Comandos propuestos

Verificacion:

```bash
npm run check:supabase-env
npm run check:kbeauty-persistence
```

Apply staging propuesto pero no ejecutado:

```bash
supabase link --project-ref ngliugfcwydnfbpalkpb
supabase db push
```

Solo despues de:

- confirmar `SUPABASE_URL=SET`
- confirmar que coincide exactamente con `https://ngliugfcwydnfbpalkpb.supabase.co`
- confirmar `AUTHORIZED_STAGING_TARGET=true`
- autorizacion humana explicita

Nota tecnica:

- `SUPABASE_URL=https://...supabase.co` es la URL HTTPS publica del proyecto.
- No usar esa variable como `--db-url`.
- Si se necesitara `--db-url`, debe cargarse una conexion Postgres valida por un mecanismo seguro fuera de chat.

Seed dry-run:

```bash
npm run seed:autopilot:kbeauty -- --dry-run
```

Seed write solo despues de apply staging autorizado:

```bash
npm run seed:autopilot:kbeauty -- --write --target=staging --confirm-review-only
```

## Bloqueos automáticos del write

El modo write falla si:

- `PRODUCTION_STATUS` no es `NO-GO_PRODUCTION`
- `--target` no es `staging`
- `SUPABASE_URL` no coincide con el staging autorizado
- `AUTHORIZED_STAGING_TARGET` no es `true`
- faltan `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY`
- faltan tablas requeridas
- no existe confirmacion explicita de write review-only

## Verificacion post-apply

Confirmar:

- `autopilot_brand_candidates` existe
- `autopilot_supplier_contacts` existe
- `autopilot_import_requirements` existe
- `/admin/autopilot` no rompe
- el dashboard muestra marcas persistidas o fallback controlado
- no existen productos `published`

## Comprobar que nada queda publicado

- `marketplace_products.published = 0`
- `marketplace_products.approved = 0`
- `marketplace_products.public_visible = 0`
- toda carga K-beauty sigue `pending_admin_review`, `needs_review` o `needs_supplier_validation`
- `representation_status = not_official`

## Rollback plan

Si el apply staging fuera incorrecto:

1. detener seed write
2. no ejecutar imports adicionales
3. revertir la migracion localmente y preparar rollback SQL antes de cualquier apply adicional
4. confirmar que `marketplace_products` sigue sin publicaciones

## Volver a dry-run

No pasar `--write`. Usar:

```bash
npm run seed:autopilot:kbeauty -- --dry-run
```

## Advertencia final

No ejecutar este runbook contra produccion.
