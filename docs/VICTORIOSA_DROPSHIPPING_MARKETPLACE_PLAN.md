# Victoriosa Dropshipping Marketplace Plan

## Vision
Victoriosa sera una plataforma propia para curar, revisar y vender productos de belleza, cuidado facial/corporal, accesorios y kits. Shopify puede existir como canal auxiliar, pero la base estrategica es propia.

## Modelos comerciales

### direct_dropship
Victoriosa cobra al cliente, registra margen, luego compra al proveedor y actualiza tracking.

### affiliate
Victoriosa muestra el producto y redirige a proveedor autorizado. No cobra al cliente. Debe mostrar disclaimer.

### manual_resale
Victoriosa revisa disponibilidad, compra/reserva manualmente y revende.

### local_stock
Producto con stock propio local.

### service_bundle
Producto combinado con evaluacion online, rutina o asesoria.

## Riesgos de proveedores
Amazon, AliExpress y Temu no deben usarse como simple copiar-pegar. Se requiere permiso, afiliacion, API autorizada, CSV autorizado o carga manual responsable. Las imagenes y descripciones deben tener derechos claros.

## Flujo de importacion
1. Admin importa CSV/JSON.
2. Se crea batch.
3. Cada fila se normaliza.
4. Se calcula precio y margen.
5. Se detecta riesgo.
6. Se crean productos como `needs_review` y `draft`.
7. Admin revisa permisos, proveedor, precio, imagen y compliance.
8. Solo productos `approved`, `low` y `published` aparecen publicamente.

## Roadmap
- Fase 1: foundation local + Supabase schema + admin demo.
- Fase 2: Auth admin real + RLS smoke + leads/ordenes reales.
- Fase 3: pagos sandbox y flujo de orden completo.
- Fase 4: proveedores reales autorizados y fulfillment semi-automatico.
- Fase 5: growth, SEO, analytics y optimizacion de margen.
