# Auditoría exhaustiva — Victoriosa Marketplace

Fecha: 2026-08-07
Base auditada: `main` en commit `517563696c80feca1e90189c4f32e3503602db3d`
Rama de correcciones: `chore/catalog-core-no-shopify`

## 1. Decisión de arquitectura

Victoriosa deja de considerar Shopify como parte de su arquitectura. El objetivo es una plataforma propia de catálogo, comercio y operación, con Next.js + Supabase + servicios server-side y proveedores autorizados.

Flujo objetivo:

Proveedor autorizado → ingestión → `supplier_products` → normalización → pricing/riesgo → Catalog Intelligence → revisión humana → `catalog_products` → storefront Victoriosa → carrito → checkout → orden → fulfillment/tracking.

No se habilita publicación automática, compra automática a proveedores ni IA en producción.

## 2. Estado actual

### Verde

- Next.js App Router + TypeScript.
- Supabase SSR/client y service-role aislado en servidor.
- Zod para contratos de entrada y salida.
- Catálogo externo con `suppliers`, `supplier_products`, `catalog_products` y auditoría de sincronización.
- Idempotencia por `(supplier_id, external_id)`.
- Productos ausentes del feed se marcan `unavailable`, no se eliminan.
- Pricing y scoring deterministas.
- Catalog Intelligence con historial, fingerprint, límites y revisión humana.
- RLS admin-only para las tablas nuevas.
- AI Gateway deshabilitado por defecto y bloqueado en producción.
- Test fixture de 5 productos.

### Amarillo

- CSV/XML/JSON se pueden parsear cuando el payload ya está disponible, pero el fetch remoto y conectores REST reales siguen pendientes.
- El cron actual es test-only.
- El storefront público todavía no está completamente conectado al nuevo `catalog_products`.
- El catálogo y el flujo legacy `marketplace_*` conviven; falta una única ruta canónica de negocio.
- Pricing existe, pero la conversión USD→UYU y el control de costo de envío/impuestos/comisiones todavía deben formalizarse antes de usarlo para ventas reales.
- Falta una matriz única de permisos para todo `/admin`.
- Falta smoke autenticado contra una instancia Supabase real de Victoriosa.

### Rojo / bloqueante para producción

- No existe una conexión Supabase accesible en esta sesión que pueda identificarse como la base de Victoriosa. El único proyecto Supabase conectado es `supabase-expressjobs`, está INACTIVE y no debe tocarse.
- Por lo anterior no se aplicaron ni verificaron migraciones remotas de Victoriosa.
- No hay proveedor real autorizado conectado.
- No hay flujo completo de venta real validado de punta a punta.
- Los fallos globales de tests K-beauty documentados previamente siguen siendo independientes del catálogo.

## 3. Hallazgos técnicos relevantes

### A. Aprobación humana podía perderse durante un refresh

El sync recalculaba `status` en cada upsert y podía sustituir el estado `approved` de un producto previamente aprobado. La rama de correcciones conserva `approved` cuando la fila existente ya estaba aprobada.

### B. Readiness de IA era incoherente

`enabled` podía ser `true` cuando `CATALOG_AI_MODEL` estaba vacío. La interfaz podía dejar activo el botón y la acción fallaba posteriormente. La corrección hace que la ausencia del modelo vuelva `enabled=false`.

### C. Shopify estaba presente como residuo arquitectónico

La fundación contenía un tipo de feed `shopify`, un campo `shopify_product_id`, una variable `SHOPIFY_ACCESS_TOKEN` y referencias documentales. La rama de correcciones elimina el contrato, la variable y agrega una migración idempotente para retirar el campo y la opción de feed del esquema desplegado.

### D. El catálogo inteligente todavía no es el storefront

La existencia de `catalog_products` no implica que `/`, `/productos` y detalle de producto ya consuman esa fuente. Antes de vender, hay que conectar el storefront a productos aprobados y disponibles, ocultando costo, margen y datos internos.

### E. La ingestión externa no es todavía un conector universal

Los parsers reciben payload. Falta una capa de adaptadores con descarga segura, límites de tamaño, timeouts, allowlist/denylist de URLs, content-type validation, SSRF protection, rate limits y auditoría de cada fetch.

## 4. Supabase

La conexión disponible fue auditada en paralelo.

Proyecto accesible:

- `supabase-expressjobs`
- ref: `gnsfyvsodslnehszanra`
- estado: `INACTIVE`
- región: `us-east-1`
- PostgreSQL 17.6.1

No coincide con un proyecto denominado Victoriosa y no se debe utilizar para este marketplace.

Acción requerida: conectar el proyecto Supabase real de Victoriosa a la sesión/entorno. Hasta entonces, todas las migraciones nuevas quedan en Git como artefactos revisables y no se ejecutan remotamente.

## 5. Prioridad de implementación

### P0 — antes de cualquier venta

1. Conectar la instancia Supabase correcta de Victoriosa.
2. Verificar migraciones remotas contra las migraciones de Git.
3. Ejecutar advisors de seguridad/performance sobre la base correcta.
4. Generar tipos TypeScript desde Supabase real.
5. Unificar permisos admin.
6. Conectar storefront a `catalog_products` aprobados/disponibles.
7. Validar precio final server-side y no permitir que el cliente altere precio.
8. Crear carrito y orden canónicos sobre Supabase.

### P1 — operación comercial

1. Conector genérico seguro para CSV/JSON/XML.
2. Adaptadores REST por proveedor.
3. Programación de sincronizaciones.
4. Historial de cambios de precio/stock.
5. Control de margen mínimo después de todos los costos conocidos.
6. Compliance por proveedor y producto.
7. Soporte de cancelación, devolución y reclamo.
8. Tracking y tareas de fulfillment manual.

### P2 — inteligencia

1. Activar AI Gateway solamente en preview/staging.
2. Procesamiento por lotes con presupuesto.
3. Detección de duplicados semánticos.
4. Clasificación y calidad de catálogo.
5. Revisión humana.
6. Medición de precisión de IA antes de ampliar automatización.

### P3 — crecimiento

1. Analytics de producto, carrito y conversión.
2. Afiliados.
3. Recomendaciones.
4. Automatización de marketing.
5. Más proveedores autorizados.

## 6. Regla comercial

No comprar inventario ni conectar proveedores por volumen hasta demostrar que un producto tiene:

- costo verificable;
- stock verificable;
- margen neto suficiente;
- proveedor autorizado;
- derechos de uso de imágenes/contenido;
- logística viable hacia Uruguay;
- política de devolución viable;
- demanda o intención de compra medible.

## 7. Estado de esta auditoría

La auditoría y las correcciones de alta confianza se realizan en `chore/catalog-core-no-shopify`. No se hizo merge, deploy ni migración remota.

La siguiente intervención de infraestructura debe hacerse sobre el proyecto Supabase real de Victoriosa, no sobre `supabase-expressjobs`.
