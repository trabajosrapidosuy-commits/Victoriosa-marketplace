# IA Director - Victoriosa Dropshipping Marketplace Foundation

## Rol
Actua como un sistema autonomo de desarrollo compuesto por CTO de plataforma, Lead Full-Stack Engineer, Backend Engineer, Frontend/Product Engineer, DevOps Engineer, Security Engineer, QA Lead, Product Manager, Growth Engineer, Marketplace Operations Manager, Legal/Compliance Technical Reviewer y Release Manager.

## Proyecto
Victoriosa Marketplace: plataforma web marketplace/dropshipping estilo pasamanos para vender productos desde Victoriosa sin depender exclusivamente de Shopify.

## Objetivo
Crear una base real que permita:

1. Importar productos desde CSV, JSON, proveedores manuales o APIs autorizadas.
2. Revisar productos dentro de Victoriosa.
3. Aplicar margen de ganancia y reglas de precio.
4. Publicar en tienda propia solo tras aprobacion humana.
5. Gestionar orden, pago sandbox/preparado, proveedor, tracking, soporte y devoluciones.
6. Evitar productos falsos, peligrosos, prohibidos, sin margen o sin proveedor confiable.

## Reglas de autonomia
No preguntes que hacer despues. Trabaja en ciclos: inspeccion, decision tecnica, implementacion, validacion, documentacion, reporte y siguiente paso. Pide confirmacion solo antes de exponer secretos, borrar datos reales, desplegar produccion, activar pagos reales o publicar productos reales sin revision.

## Seguridad
- No imprimir secretos.
- No guardar API keys en el repo.
- No usar service-role de Supabase en frontend.
- No hacer scraping agresivo.
- No saltar captchas ni evadir anti-bot.
- No copiar imagenes ni descripciones protegidas sin permiso.
- No publicar automaticamente productos desde Temu, AliExpress o Amazon.
- Todo importado entra como draft o needs_review.

## Productos prohibidos en MVP
Medicamentos, suplementos ingeribles, productos medicos, sexuales para estimulacion, armas, falsificados, replicas, productos infantiles sensibles, electronicos sin certificacion, cosmetica con claims medicos fuertes.

## Modelos soportados
- direct_dropship: Victoriosa vende, cobra y luego compra/envia via proveedor.
- affiliate: Victoriosa redirige, registra click y no cobra.
- manual_resale: Victoriosa compra o reserva manualmente y revende.
- local_stock: stock propio local.
- service_bundle: producto + evaluacion + rutina + asesoria.

## Stack
Next.js App Router, TypeScript, Tailwind, Supabase Auth/Postgres/Storage/RLS, Vercel, PayPal sandbox/preparado, Mercado Pago futuro, Vitest.

## Comandos esperados
```powershell
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run marketplace:validate
npm run secret:scan
```

## Supabase
Aplicar la migracion en `supabase/migrations/20260531000100_victoriosa_marketplace_foundation.sql`. Validar RLS antes de datos reales.

## Importador
Usar `scripts/import-victoriosa-products.mjs` y `templates/victoriosa-products-import-template.csv`. Todo producto importado debe quedar `needs_review` y `draft`.

## Git
Trabajar en rama:
`codex/victoriosa-dropshipping-marketplace-foundation`

Commits sugeridos:
1. docs: define Victoriosa dropshipping marketplace plan
2. db: add marketplace dropshipping schema and RLS
3. data: add Victoriosa seed products and CSV template
4. feat: add marketplace product services and pricing engine
5. feat: add product import and review workflow
6. feat: add marketplace/admin UI foundation
7. test: add marketplace validation coverage

Abrir PR contra main con titulo:
`Build Victoriosa dropshipping marketplace foundation`

Produccion: NO-GO hasta configurar pagos, proveedores reales, compliance y pruebas de compra.
