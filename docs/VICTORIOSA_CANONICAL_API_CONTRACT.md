# Victoriosa Canonical API Contract

Fecha: 2026-06-02

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Decision

El camino MVP usa exclusivamente tablas `marketplace_*`. Las tablas legacy
`products`, `orders`, `order_items`, `user_profiles`, `supplier_imports` y
`analytics_events` quedan fuera del contrato canonico.

Los handlers legacy principales responden `410 LEGACY_API_DEPRECATED`. Las
pantallas legacy que aun los consumen permanecen visibles solo como deuda
tecnica y deben retirarse o migrarse durante los ciclos de storefront y
checkout.

## Public API

### `GET /api/marketplace/products`

Lista unicamente productos que cumplen simultaneamente:

- `publication_status = published`
- `compliance_status = approved`
- `risk_level = low`

La respuesta publica no incluye costo, margen interno ni notas de revision.

El storefront publico `/`, `/productos`, `/productos/[slug]` y `/kits` consume
exclusivamente este contrato canonico. Seeds locales y metadata interna quedan
fuera de la experiencia visitante.

Si no existen productos publicables, la UI muestra un estado vacio comercial y
no reemplaza el catalogo con datos de ejemplo.

### `GET /api/marketplace/products/[slug]`

Devuelve detalle publico bajo el mismo filtro obligatorio.

## Admin API

Todas las rutas siguientes usan `requireAdmin` y solo aceptan identidades con
rol `admin` o `marketplace_admin` en `marketplace_profiles`.

- `GET|POST|PATCH /api/admin/marketplace/products`
- `GET|POST /api/admin/marketplace/imports`
- `GET|POST|PATCH /api/admin/marketplace/suppliers`
- `GET|PATCH /api/admin/marketplace/reviews`
- `GET|PATCH /api/admin/marketplace/orders`

Crear un producto siempre fuerza:

- `publication_status = draft`
- `compliance_status = needs_review`
- `risk_level = medium`

La API de productos no permite asignar `published` mediante patch directo. El
workflow auditado de publicacion se implementara despues del endurecimiento de
compliance.

## Persistent Import

`POST /api/admin/marketplace/imports` acepta JSON controlado o CSV con metadata
de supplier en headers. El endpoint siempre requiere `requireAdmin`.

Cada import:

1. Reutiliza o crea supplier en `needs_review`.
2. Crea `marketplace_product_import_batches`.
3. Persiste cada payload crudo en `marketplace_product_import_rows`.
4. Normaliza y detecta duplicados.
5. Crea producto en `draft + needs_review`.
6. Fuerza riesgo `medium` o mas restrictivo.
7. Crea `marketplace_reviews_queue`.
8. Completa batch con conteos aceptados y rechazados.

Deduplicacion minima segura:

- `slug`
- `source_url + supplier`
- `external_product_id + supplier`

El payload crudo se conserva para auditoria, pero campos externos que intenten
forzar `published`, `approved` o riesgo `low` no controlan el registro creado.

## Review Workflow

`PATCH /api/admin/marketplace/reviews` conserva trazabilidad:

- `approved`: compliance pasa a `approved`, publicacion permanece `draft`.
- `rejected`: compliance pasa a `rejected`, publicacion permanece `draft`.
- `blocked`: compliance y riesgo pasan a `blocked`; publicacion pasa a
  `hidden`.
- `needs_changes`: compliance vuelve a `needs_review`; publicacion permanece
  `draft`.

No existe publicacion automatica en este workflow.

## Legacy API

Fuera del camino MVP:

- `/api/products`
- `/api/products/[id]`
- `/api/orders`
- `/api/orders/[id]`
- `/api/admin/products`
- `/api/admin/products/pricing`
- `/api/admin/products/import`
- `/api/marketplace/import`

## Siguiente ciclo

Conectar storefront publico exclusivamente al catalogo canonico y retirar seeds
demo del flujo visible salvo modo demo explicito.
