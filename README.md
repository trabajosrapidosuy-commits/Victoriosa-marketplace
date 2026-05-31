# Victoriosa Marketplace

Victoriosa Marketplace es una base propia de ecommerce/dropshipping/afiliados para belleza, cuidado facial, cuidado corporal, accesorios beauty, kits y servicios de estetica. La plataforma esta pensada para vender desde Victoriosa sin depender exclusivamente de Shopify.

## Estado

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

Esta version es una foundation para desarrollo local, Supabase staging y Pull Request. No activa pagos live, no publica productos reales automaticamente y no usa scraping no autorizado.

## Lo que incluye

- Storefront publico: home, productos, detalle, kits, evaluacion online, carrito, checkout preparado y estado de orden.
- Admin foundation: marketplace, productos, importacion, review queue, proveedores, ordenes y settings.
- Modelo Supabase `marketplace_*` con RLS.
- Motor de precios, margen, riesgo y compliance.
- Importador CSV/JSON seguro: todo entra como `needs_review`.
- Conectores mock/manuales para AliExpress, Temu, Amazon afiliado, Dropshipman, CSV y proveedor generico.
- Seed de 50 productos genericos sin marcas famosas ni claims medicos.
- Tests base para pricing, importacion, compliance y no publicacion automatica.
- Documentacion de operacion y politica de proveedores.

## Arranque local

```powershell
cd C:\CODEX-victoriosa-marketplace
npm install
copy .env.example .env.local
npm run lint
npm run typecheck
npm run test
npm run build
```

Completa `.env.local` con tus variables publicas de Supabase y WhatsApp. No pegues `service_role` en frontend ni en chats.

## Supabase

1. Crea un proyecto Supabase o usa el proyecto de Victoriosa.
2. Carga `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Aplica la migracion:

```powershell
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

La migracion esta en `supabase/migrations/20260531000100_victoriosa_marketplace_foundation.sql`.

## Importar productos

Usa la plantilla:

```text
templates/victoriosa-products-import-template.csv
```

Comando:

```powershell
npm run marketplace:import -- --file ./templates/victoriosa-products-import-template.csv --supplier "AliExpress Manual" --source aliexpress
```

Regla central: los productos importados quedan como `needs_review`; nunca se publican automaticamente.

## GitHub

Rama recomendada:

```powershell
git checkout -b codex/victoriosa-dropshipping-marketplace-foundation
git add .
git commit -m "Build Victoriosa dropshipping marketplace foundation"
git push -u origin codex/victoriosa-dropshipping-marketplace-foundation
```

No hagas merge a `main` sin revisar build, RLS, pagos, proveedores y compliance.
