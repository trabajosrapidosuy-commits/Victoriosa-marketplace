import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { persistentImportSchema } from "@/domain/marketplace-contract";
import { normalizeMarketplaceProduct } from "@/services/marketplace-product-service";

export interface PersistentImportReport {
  batchId: string;
  supplierId: string;
  totalRows: number;
  created: number;
  duplicates: number;
  rejected: number;
  reviewQueueCreated: number;
  automaticPublication: false;
}

export async function persistMarketplaceImport(supabase: SupabaseClient, userId: string, raw: unknown): Promise<PersistentImportReport> {
  const input = persistentImportSchema.parse(raw);
  const supplierId = await ensureSupplier(supabase, input.supplier);
  const batch = await insertOne(supabase, "marketplace_product_import_batches", {
    source_type: input.sourceType,
    supplier_id: supplierId,
    file_name: input.fileName ?? null,
    source_url: input.sourceUrl ?? null,
    imported_by: userId,
    total_rows: input.rows.length,
    status: "processing",
  }, "id");

  const report: PersistentImportReport = {
    batchId: String(batch.id),
    supplierId,
    totalRows: input.rows.length,
    created: 0,
    duplicates: 0,
    rejected: 0,
    reviewQueueCreated: 0,
    automaticPublication: false,
  };

  for (const rawRow of input.rows) {
    const importRow = await insertOne(supabase, "marketplace_product_import_rows", {
      batch_id: batch.id,
      raw_payload: rawRow,
      status: "pending",
    }, "id");
    try {
      const normalized = normalizeMarketplaceProduct(rawRow);
      const existingId = await findDuplicateProductId(supabase, supplierId, normalized);
      if (existingId) {
        report.duplicates += 1;
        await updateImportRow(supabase, String(importRow.id), {
          normalized_payload: normalized,
          product_id: existingId,
          status: "duplicate",
          error_message: "duplicate_detected",
        });
        continue;
      }

      const product = await insertOne(supabase, "marketplace_products", toProductInsert(supplierId, userId, normalized), "id,publication_status,compliance_status,risk_level");
      await insertOne(supabase, "marketplace_reviews_queue", {
        product_id: product.id,
        status: "open",
        checklist: {
          sourceVerified: false,
          imageRightsVerified: false,
          resalePermissionVerified: false,
          marginVerified: false,
          complianceVerified: false,
        },
        notes: "Imported product requires human review before publication.",
      }, "id");
      await updateImportRow(supabase, String(importRow.id), {
        normalized_payload: normalized,
        product_id: product.id,
        status: "needs_review",
      });
      report.created += 1;
      report.reviewQueueCreated += 1;
    } catch (error) {
      report.rejected += 1;
      await updateImportRow(supabase, String(importRow.id), {
        status: "rejected",
        error_message: error instanceof Error ? error.message.slice(0, 500) : "unknown_import_error",
      });
    }
  }

  await updateBatch(supabase, String(batch.id), {
    accepted_rows: report.created,
    rejected_rows: report.rejected,
    status: report.rejected > 0 ? "partially_completed" : "completed",
    errors: [],
    completed_at: new Date().toISOString(),
  });
  return report;
}

export async function listImportBatches(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("marketplace_product_import_batches")
    .select("id,source_type,file_name,total_rows,accepted_rows,rejected_rows,status,created_at,completed_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function ensureSupplier(supabase: SupabaseClient, supplier: { id?: string; name: string; type: string }) {
  if (supplier.id) return supplier.id;
  const { data, error } = await supabase.from("marketplace_suppliers").select("id").eq("name", supplier.name).eq("type", supplier.type).maybeSingle();
  if (error) throw new Error(error.message);
  if (data?.id) return String(data.id);
  const created = await insertOne(supabase, "marketplace_suppliers", {
    name: supplier.name,
    type: supplier.type,
    status: "needs_review",
    trust_level: "unknown",
    api_enabled: false,
    allows_dropshipping: false,
    allows_resale: false,
    allows_image_use: false,
    allows_branding: false,
  }, "id");
  return String(created.id);
}

async function findDuplicateProductId(supabase: SupabaseClient, supplierId: string, product: ReturnType<typeof normalizeMarketplaceProduct>) {
  const checks = [
    ["slug", product.slug],
    ["source_url", product.sourceUrl],
    ["external_product_id", product.externalProductId],
  ] as const;
  for (const [field, value] of checks) {
    if (!value) continue;
    let query = supabase.from("marketplace_products").select("id").eq(field, value);
    if (field !== "slug") query = query.eq("supplier_id", supplierId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.id) return String(data.id);
  }
  return null;
}

function toProductInsert(supplierId: string, userId: string, product: ReturnType<typeof normalizeMarketplaceProduct>) {
  return {
    supplier_id: supplierId,
    title: product.title,
    slug: product.slug,
    description: product.description,
    short_description: product.shortDescription,
    brand: product.brand ?? null,
    category: product.category,
    subcategory: product.subcategory ?? null,
    tags: product.tags,
    source_url: product.sourceUrl ?? null,
    source_platform: product.sourcePlatform ?? null,
    external_product_id: product.externalProductId ?? null,
    external_sku: product.externalSku ?? null,
    image_urls: product.imageUrls,
    main_image_url: product.mainImageUrl ?? null,
    image_rights_status: product.imageRightsStatus,
    cost_price: product.costPrice,
    shipping_cost: product.shippingCost,
    platform_fee_estimate: product.platformFeeEstimate,
    target_margin_percent: product.targetMarginPercent,
    target_margin_amount: product.targetMarginAmount,
    sale_price: product.salePrice,
    currency: product.currency,
    local_currency: product.localCurrency,
    fx_rate: product.fxRate,
    stock_status: product.stockStatus,
    fulfillment_type: product.fulfillmentType,
    compliance_status: "needs_review",
    publication_status: "draft",
    risk_level: product.riskLevel === "low" ? "medium" : product.riskLevel,
    review_notes: product.reviewNotes ?? null,
    estimated_delivery_min_days: product.estimatedDeliveryMinDays ?? null,
    estimated_delivery_max_days: product.estimatedDeliveryMaxDays ?? null,
    return_window_days: product.returnWindowDays ?? null,
    created_by: userId,
  };
}

async function insertOne(supabase: SupabaseClient, table: string, payload: Record<string, unknown> | Record<string, unknown>[], columns: string): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from(table).insert(payload).select(columns).single();
  if (error || !data) throw new Error(error?.message ?? `Could not insert ${table}`);
  return data as unknown as Record<string, unknown>;
}

async function updateImportRow(supabase: SupabaseClient, id: string, payload: Record<string, unknown>) {
  const { error } = await supabase.from("marketplace_product_import_rows").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}

async function updateBatch(supabase: SupabaseClient, id: string, payload: Record<string, unknown>) {
  const { error } = await supabase.from("marketplace_product_import_batches").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}
