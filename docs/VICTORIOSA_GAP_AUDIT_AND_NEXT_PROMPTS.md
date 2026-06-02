# Victoriosa Marketplace Gap Audit

Fecha: 2026-06-02

## Alcance

Auditoria estatica y de gates seguros de `C:\victoriosa` contra el prompt maestro
de Victoriosa Marketplace. No se modifico producto, no se desplego preview ni
produccion y no se ejecutaron pagos, publicaciones ni acciones outbound.

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Resumen ejecutivo

La foundation existe y reduce riesgo: Next.js 15, TypeScript, esquema Supabase
canonico `marketplace_*`, RLS, seeds genericos, servicios de pricing/compliance,
conectores manuales, tests locales y Autopilot admin-only. Sin embargo, el MVP
real aun no esta integrado. Conviven dos aplicaciones:

1. La direccion canonica `/productos`, `/carrito`, `/checkout`, `/order/[id]` y
   `/admin/marketplace/*`, que usa seeds o pantallas conceptuales.
2. El prototipo legacy `/products`, `/cart`, `/orders/[id]` y `/admin/*`, que
   consulta tablas legacy `products`, `orders`, `order_items`, `user_profiles`,
   `supplier_imports` y `analytics_events`.

Staging ya contiene las tres migraciones revisadas, pero no hay identidad admin
dedicada para probar flujos autenticados. Desde una shell limpia tampoco se
reproducen `staging:check` ni `rls:smoke` porque las variables seguras no estan
cargadas en ese proceso.

## Estado contra el prompt maestro

### Implementado

- Arquitectura Next.js 15 App Router, TypeScript y Tailwind.
- Esquema Supabase canonico con suppliers, products, batches, rows, orders,
  items, click events, review queue, consultations, settings y profiles.
- RLS habilitado en 18 tablas publicas; catalogo publico restringido a
  `published + approved + low`.
- Restriccion SQL que impide publicar productos no aprobados o no `low`.
- Modelos `direct_dropship`, `affiliate`, `manual_resale`, `local_stock` y
  `service_bundle`.
- Seed local de 50 productos genericos con placeholders.
- Motor base de precios, margen, buffer de riesgo, conversion y redondeo.
- Servicios base de productos, suppliers, fulfillment y compliance.
- Interfaz de conectores y conectores manuales/mock para fuentes previstas.
- Autopilot persistente admin-only para discovery mock, candidatos, drafts y
  logs, con outbound deshabilitado.
- Documentacion base de plan, suppliers, admin y staging.

### Parcial

- Importador CSV/JSON local: genera preview y reporte, pero no persiste.
- Importador API canonico: normaliza filas, pero es anonimo y no persiste.
- Storefront canonico: demuestra navegacion con seeds, no consume staging.
- Pricing: calcula precio, pero no aplica una configuracion persistida ni gate
  integrado de margen minimo al flujo de publicacion.
- Compliance: detecta riesgos basicos, pero no cubre toda la politica requerida.
- Admin Autopilot: tiene guard real; el resto de `/admin` y
  `/admin/marketplace/*` no tiene frontera autenticada uniforme.
- RLS anonimo: probado previamente en staging; falta smoke autenticado.

### Faltante

- Flujo real integrado de catalogo, review, publicacion, carrito, checkout,
  orden, fulfillment y tracking sobre `marketplace_*`.
- Pago PayPal sandbox y preparacion verificable para Mercado Pago futuro.
- Operacion real de suppliers autorizados y derechos de imagen.
- Soporte, reclamos, cancelaciones y devoluciones persistidos.
- Analytics persistido de clicks, afiliados y conversion.
- Browser smoke local o preview reproducible.
- PR limpio: la rama actual comparte HEAD con `main` y acumula cambios locales
  sin commits atomicos.

## Hallazgos prioritarios

### P0 - Integracion bloqueante para MVP

1. El storefront real no usa el esquema canonico. `/productos` y home leen
   seeds locales. `/products` usa la tabla legacy `products`.
2. El checkout canonico es conceptual. `/cart` intenta crear ordenes legacy y
   `/carrito` solo enlaza al checkout demo.
3. El importador canonico no guarda suppliers, batches, rows ni products. El
   endpoint `/api/marketplace/import` tampoco exige admin.
4. `/admin/marketplace/*` son placeholders. No permiten review, aprobacion,
   bloqueo, precio, permisos, publicacion, CSV export, tracking ni refunds.
5. No existe identidad admin dedicada en staging para validar Auth + RLS +
   acciones admin de punta a punta.

### P1 - Seguridad y consistencia

1. `.env.example` esta borrado localmente. Por eso `npm run ci` falla en una
   shell limpia hasta aplicar overrides seguros.
2. La frontera admin esta fragmentada: Autopilot usa `requireAdmin`, mientras
   otras rutas admin usan checks legacy o carecen de guard.
3. `marketplace_click_events` y `beauty_consultations` aceptan inserts publicos
   con `with check (true)`. La excepcion esta documentada en el test estatico,
   pero faltan validacion estricta de payload, limites anti-spam y rate limit.
4. Conviven helpers de rol con distinta amplitud: `private.is_marketplace_admin`
   incluye roles operativos amplios y `public.is_autopilot_admin` restringe a
   `admin` y `marketplace_admin`. Debe definirse una matriz de permisos unica.
5. El endpoint legacy de ordenes confia en una familia de tablas no canonica y
   no representa snapshots, supplier tasks ni estados del modelo nuevo.

### P1 - Compliance comercial

1. `detectRiskFlags` no valida proveedor desconocido, politica de devolucion,
   ingredientes minimos, certificacion electronica, marca famosa no autorizada,
   permisos de resale completos ni riesgo por fuente Temu/AliExpress.
2. El modo afiliado genera URL UTM, pero no registra click persistido ni aplica
   disclaimer mediante un flujo dedicado.
3. No hay gate operativo que confirme proveedor activo, permisos de imagen,
   permiso de reventa y margen minimo antes de publicar.
4. No hay workflow persistido de reclamos, devoluciones, cancelaciones o
   evidencia de soporte.

### P2 - UX y operacion

1. Existen rutas duplicadas en ingles y espanol con contratos incompatibles.
2. La home expone un enlace admin de importacion al visitante publico.
3. `/evaluacion-online`, `/checkout`, `/order/[id]` y varios admin marketplace
   son placeholders.
4. Los filtros publicos canonicos solo estan descriptos; no funcionan.
5. No hay estados de error visibles uniformes, mobile smoke ni accesibilidad
   verificada.
6. README conserva `C:\CODEX-victoriosa-marketplace`, distinto del repo real
   `C:\victoriosa`.

### P2 - Calidad y entrega

1. Hay 13 tests utiles, pero faltan integraciones repository/API, Auth/RLS
   autenticado, checkout sandbox, affiliate redirect, rate limit y browser E2E.
2. `npm run staging:check` y `npm run rls:smoke` no son reproducibles desde una
   shell limpia sin cargar variables seguras.
3. No hay PR limpio ni commits atomicos de la foundation actual.
4. Hay artefactos de build locales como `tsconfig.tsbuildinfo` sin excluir.
5. Existen documentos `EXPRESSJOBS_*` dentro de Victoriosa; deben revisarse y
   aislarse para evitar contaminacion documental.

## Checks ejecutados

- `npm run secret:scan`: PASS.
- `npm run ci`: FAIL en `production:check` por defaults seguros ausentes.
- `npm run production:check` con overrides seguros temporales: PASS.
- `npm run guard:no-production-deploy`: PASS.
- `npm run test:rls:static`: PASS, 18 tablas publicas.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test`: PASS, 13 tests.
- `npm run build`: PASS.
- `npm run smoke:structure`: PASS.
- `git diff --check`: PASS.
- `npm run staging:check`: CHECK_NOT_RUN, faltan
  `SUPABASE_STAGING_URL` y `SUPABASE_STAGING_ANON_KEY` en la shell actual.
- `npm run rls:smoke`: CHECK_NOT_RUN, depende de `staging:check`.
- Browser smoke local: CHECK_NOT_RUN, `http://localhost:3000` no estaba
  disponible durante la auditoria.

## Bloqueos reales

- `BLOCKED_MISSING_ACCESS`: falta identidad admin dedicada de staging para
  ejecutar smoke autenticado sin exponer credenciales.
- `BLOCKED_EXTERNAL_CREDENTIALS`: no hay proveedores autorizados ni pagos
  sandbox configurados para pruebas integradas.
- `BLOCKED_PRODUCTION_RISK`: produccion continua prohibida hasta validar
  staging, compliance, pagos sandbox y flujos reales.

## Orden recomendado de desarrollo

1. Reconciliar contrato canonico y retirar dependencias legacy del flujo MVP.
2. Implementar repositories/API admin sobre `marketplace_*` con guard uniforme.
3. Persistir import batches, rows, suppliers y review queue.
4. Conectar storefront publico solo a productos publicables.
5. Implementar carrito, orden y fulfillment manual canonicos.
6. Completar compliance, rate limit y matriz RLS autenticada.
7. Agregar PayPal sandbox, tracking, reclamos y devoluciones.
8. Ejecutar browser smoke, staging smoke autenticado y preparar PR limpio.

## Prompts siguientes

### Prompt 01 - Canonical API and admin boundary

Repo: `C:\victoriosa`

Objetivo: eliminar del camino MVP las tablas legacy y crear repositories/API
server-side para `marketplace_products`, `marketplace_suppliers`,
`marketplace_reviews_queue`, `marketplace_orders` y
`marketplace_order_items`. Aplicar `requireAdmin` a toda mutacion admin y
conservar lectura publica solo para `published + approved + low`.

Reglas: no tocar produccion; no usar deploy productivo de Vercel; no imprimir secrets; no
service-role en cliente; no relajar RLS; no publicar productos reales.

Entregables: contrato canonico documentado, endpoints admin protegidos, retiro o
deprecacion explicita de handlers legacy del camino MVP, tests repository/API,
`.env.example` seguro restaurado y gates locales verdes sin overrides.

### Prompt 02 - Persistent import and review workflow

Objetivo: persistir CSV/JSON import en suppliers, batches, rows, products y
review queue. Detectar duplicados contra DB por source URL, external ID y
title+supplier. Toda fila debe terminar en `draft + needs_review`, nunca
publicada automaticamente.

Entregables: import CLI y API admin-only, validacion Zod, reporte auditable,
tests de duplicados y publicacion prohibida, UI admin funcional de import/review.

### Prompt 03 - Public catalog canonicalization

Objetivo: conectar `/`, `/productos` y `/productos/[slug]` al catalogo publico
canonico; retirar seeds del flujo visible salvo modo demo explicito.

Entregables: filtros reales, estados vacios/error, detalle con disclaimers,
affiliate redirect persistido, ocultamiento de costos/margenes internos y
eliminacion del enlace admin desde home publica.

### Prompt 04 - Canonical cart, orders and fulfillment

Objetivo: unificar `/carrito`, `/checkout` y `/order/[id]` sobre
`marketplace_orders` y `marketplace_order_items`. Implementar snapshots,
supplier task manual, estados, referencia proveedor y tracking.

Entregables: carrito persistente, validacion server-side de precios,
separacion affiliate/direct dropship/manual resale, pagina de orden y admin de
tracking, tests de autorizacion y transiciones.

### Prompt 05 - Compliance and abuse hardening

Objetivo: completar politica de riesgos y endurecer inserts publicos.

Entregables: flags faltantes, gate de publicacion completo, schema validation,
rate limit para clicks/consultations, matriz de roles, tests negativos RLS y
documentacion de excepciones justificadas.

### Prompt 06 - Staging authenticated smoke

Objetivo: luego de crear identidad admin dedicada fuera de chat, ejecutar smoke
staging autenticado y browser smoke. Verificar que no-admin no accede, admin
puede importar/revisar y ningun draft se publica.

Entregables: evidencia sin secretos, runbook actualizado y
`PRODUCTION_STATUS=NO-GO_PRODUCTION`.

### Prompt 07 - Payments sandbox and support operations

Objetivo: implementar PayPal sandbox solamente, mantener Mercado Pago como
adaptador futuro y agregar reclamos, cancelaciones, refunds y soporte.

Entregables: webhooks sandbox idempotentes, estados auditables, tests, runbook y
gates que impidan live payments.

### Prompt 08 - UX hardening and clean PR

Objetivo: resolver rutas duplicadas, hacer browser E2E desktop/mobile basico,
corregir docs y preparar PR limpio sin merge automatico.

Entregables: una sola experiencia coherente, accesibilidad basica, errores
visibles, docs actualizados, commits atomicos y PR con NO-GO de produccion.
