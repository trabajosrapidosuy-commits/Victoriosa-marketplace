# Catálogo externo: etapa 1

La migración `20260807000100_catalog_ingestion_foundation.sql` agrega `suppliers`, `supplier_products`, `catalog_products`, reglas de margen y auditoría de sincronización. No modifica ni elimina las tablas marketplace o Autopilot existentes.

La arquitectura de catálogo es independiente de plataformas externas de ecommerce. Victoriosa mantiene su propio catálogo, checkout y operación; no depende de Shopify.

## Flujo

1. Un proveedor se registra con una referencia a su credencial, nunca con la clave.
2. El adaptador valida CSV, XML o JSON y normaliza cada fila.
3. La clave idempotente es `(supplier_id, external_id)`; una repetición actualiza la fila.
4. Los productos no vistos se marcan `unavailable`; nunca se eliminan.
5. Precio y score se calculan mediante reglas configurables en `catalog_margin_rules`.
6. Ningún resultado se publica automáticamente. La decisión `PUBLISH` es una recomendación de score y requiere aprobación humana.

## Seguridad y cron

`POST /api/catalog/sync` requiere `Authorization: Bearer <CRON_SHARED_SECRET>` y solo admite `{"mode":"test"}` durante esta etapa. Las integraciones reales y el fetch remoto quedan explícitamente deshabilitados.

Las claves `SUPABASE_SERVICE_ROLE_KEY` y `AI_GATEWAY_API_KEY` son exclusivas del servidor. AI Gateway queda preparado con `CATALOG_AI_ENABLED=false`; cuando se habilite, deberá usar AI SDK, salida estructurada y el prompt source-grounded de `catalog-ai-service.ts`.
