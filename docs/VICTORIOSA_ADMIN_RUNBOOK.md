# Victoriosa Admin Runbook

## Importar CSV
1. Abrir `/admin/marketplace/products/import`.
2. Usar `templates/victoriosa-products-import-template.csv`.
3. Ejecutar importacion.
4. Revisar reporte: creados, duplicados, rechazados, margen, imagen y URL.

## Revisar producto
1. Ver proveedor.
2. Confirmar permiso de reventa.
3. Confirmar permiso de imagen.
4. Revisar costo total, envio y margen.
5. Revisar riesgo legal/comercial.
6. Ajustar titulo y descripcion sin claims medicos.
7. Aprobar o rechazar.

## Publicar producto
Solo publicar si:
- compliance_status = approved
- risk_level = low
- publication_status = published
- margen >= minimo configurado
- proveedor aceptado

## Gestionar orden direct_dropship
1. Orden entra pending_payment.
2. Pago confirmado: paid.
3. Admin compra al proveedor: supplier_ordered.
4. Cargar supplier_order_reference.
5. Cargar tracking.
6. Marcar shipped/delivered.

## Reclamos y devoluciones
Registrar notas, proveedor, tracking, evidencia y resolucion. No prometer devolucion si el proveedor no tiene politica confirmada.
