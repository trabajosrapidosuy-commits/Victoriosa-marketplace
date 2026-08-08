import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeExternalProduct } from "@/lib/catalog/normalize";
import { DEFAULT_MARGIN_RULES } from "@/lib/catalog/test-supplier";
import type { ExternalProductInput, MarginRule } from "@/lib/catalog/types";

export async function syncCatalogProducts(supabase: SupabaseClient, supplierId: string, products: ExternalProductInput[], triggerType: "manual" | "cron" | "test") {
  const { data: run, error: runError } = await supabase.from("catalog_sync_runs").insert({ supplier_id: supplierId, trigger_type: triggerType, received_count: products.length }).select("id").single();
  if (runError || !run) throw new Error(runError?.message ?? "Could not create catalog sync run");
  let created = 0; let updated = 0; let errors = 0; let unavailable = 0;
  const rules = await loadMarginRules(supabase);
  try {
    for (const input of products) {
      try {
        const normalized = normalizeExternalProduct(input, rules);
        const { data: supplierProduct, error } = await supabase.from("supplier_products").upsert({
          supplier_id: supplierId, external_id: input.externalId, sku: input.sku ?? null, ean: input.ean ?? null, brand: input.brand ?? null,
          original_title: input.title, original_description: input.description ?? null, category: input.category ?? null, cost: input.cost ?? null,
          currency: input.currency ?? "USD", stock: input.stock ?? null, image_urls: input.imageUrls ?? [], product_url: input.productUrl ?? null,
          raw_data: input.rawData, availability_status: (input.stock ?? 0) > 0 ? "available" : "unavailable", last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }, { onConflict: "supplier_id,external_id" }).select("id").single();
        if (error || !supplierProduct) throw new Error(error?.message ?? "Supplier product upsert failed");
        const { data: existing } = await supabase.from("catalog_products").select("id").eq("supplier_product_id", supplierProduct.id).maybeSingle();
        const { error: catalogError } = await supabase.from("catalog_products").upsert({
          supplier_product_id: supplierProduct.id, sku: input.sku ?? null, title: normalized.title, description: normalized.description || null,
          short_description: normalized.shortDescription || null, brand: normalized.brand ?? null, category: normalized.category ?? null,
          subcategory: normalized.subcategory ?? null, price: normalized.price ?? null, cost: input.cost ?? null, margin: normalized.margin ?? null,
          currency: input.currency ?? "USD", stock: input.stock ?? null, images: normalized.images, seo_title: null, seo_description: null,
          slug: normalized.slug || null, status: normalized.score.decision.toLowerCase(),
          score: normalized.score, missing_fields: normalized.missingFields, updated_at: new Date().toISOString(),
        }, { onConflict: "supplier_product_id" });
        if (catalogError) throw new Error(catalogError.message);
        if (existing) updated += 1; else created += 1;
      } catch (error) {
        errors += 1;
        await supabase.from("catalog_sync_errors").insert({ sync_run_id: run.id, external_id: input.externalId, error_code: "normalization_failed", message: safeError(error) });
      }
    }
    const currentIds = new Set(products.map((product) => product.externalId));
    const { data: knownProducts, error: knownProductsError } = await supabase.from("supplier_products").select("id,external_id").eq("supplier_id", supplierId);
    if (knownProductsError) throw new Error(knownProductsError.message);
    const unavailableIds = (knownProducts ?? []).filter((product) => !currentIds.has(String(product.external_id))).map((product) => product.id);
    if (unavailableIds.length) {
      const timestamp = new Date().toISOString();
      await supabase.from("supplier_products").update({ availability_status: "unavailable", updated_at: timestamp }).in("id", unavailableIds);
      await supabase.from("catalog_products").update({ status: "unavailable", approved: false, updated_at: timestamp }).in("supplier_product_id", unavailableIds);
      unavailable = unavailableIds.length;
    }
    const status = errors ? (created || updated ? "partial" : "failed") : "completed";
    await supabase.from("catalog_sync_runs").update({ status, created_count: created, updated_count: updated, unavailable_count: unavailable, error_count: errors, completed_at: new Date().toISOString() }).eq("id", run.id);
    await supabase.from("suppliers").update({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", supplierId);
    return { runId: run.id, created, updated, errors, automaticPublication: false };
  } catch (error) {
    await supabase.from("catalog_sync_runs").update({ status: "failed", error_count: errors + 1, completed_at: new Date().toISOString() }).eq("id", run.id);
    throw error;
  }
}

async function loadMarginRules(supabase: SupabaseClient): Promise<MarginRule[]> {
  const { data } = await supabase.from("catalog_margin_rules").select("min_cost,max_cost,multiplier,currency").eq("active", true).order("min_cost");
  if (!data?.length) return DEFAULT_MARGIN_RULES;
  return data.map((rule) => ({ minCost: Number(rule.min_cost), maxCost: rule.max_cost === null ? null : Number(rule.max_cost), multiplier: Number(rule.multiplier), currency: String(rule.currency) }));
}

function safeError(error: unknown) { return error instanceof Error ? error.message.slice(0, 400) : "unknown_catalog_error"; }
