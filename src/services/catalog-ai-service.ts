import "server-only";

import { generateObject } from "ai";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

export const catalogAiOutputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(5000),
  short_description: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  subcategory: z.string().trim().min(1).max(100),
  seo_title: z.string().trim().min(1).max(180),
  seo_description: z.string().trim().min(1).max(320),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  quality_score: z.number().int().min(0).max(100),
  recommendation: z.enum(["PUBLISH", "REVIEW", "REJECT"]),
  reasons: z.array(z.string().trim().min(1).max(300)).min(1).max(12),
}).strict();

export type CatalogAiOutput = z.infer<typeof catalogAiOutputSchema>;
export type CatalogAiSource = { id: string; supplier_product_id: string; original_title: string; original_description: string | null; brand: string | null; category: string | null; image_urls: unknown; product_url: string | null; normalized_category: string | null };

const defaultLimits = { maxProducts: 5, maxRetries: 2, maxTokens: 1200, timeoutMs: 20_000 };

export function getCatalogAiConfig(env: Record<string, string | undefined> = process.env) {
  const environment = env.VERCEL_ENV ?? env.NODE_ENV ?? "development";
  const enabledFlag = env.CATALOG_AI_ENABLED === "true";
  const allowedEnvironment = environment === "development" || environment === "preview" || environment === "staging";
  const model = env.CATALOG_AI_MODEL?.trim() ?? "";
  const enabled = enabledFlag && allowedEnvironment && Boolean(model);
  return {
    enabled,
    reason: !enabledFlag ? "catalog_ai_disabled" : !allowedEnvironment ? "catalog_ai_not_allowed_in_environment" : !model ? "catalog_ai_model_missing" : undefined,
    environment, model,
    maxProducts: boundedInt(env.CATALOG_AI_MAX_PRODUCTS, defaultLimits.maxProducts, 1, 50),
    maxRetries: boundedInt(env.CATALOG_AI_MAX_RETRIES, defaultLimits.maxRetries, 0, 5),
    maxTokens: boundedInt(env.CATALOG_AI_MAX_TOKENS, defaultLimits.maxTokens, 100, 10_000),
    timeoutMs: boundedInt(env.CATALOG_AI_TIMEOUT_MS, defaultLimits.timeoutMs, 1_000, 60_000),
  };
}

export function getCatalogAiReadiness() {
  const config = getCatalogAiConfig();
  return { enabled: config.enabled, environment: config.environment, gatewayConfigured: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN), mode: "review_only" as const, reason: config.reason, prohibited: ["prices", "stock", "ingredients", "technical_features", "certifications", "brands", "medical_benefits"] };
}

export function sourceSnapshot(source: CatalogAiSource) {
  return { original_title: source.original_title, original_description: source.original_description ?? null, brand: source.brand ?? null, category: source.category ?? source.normalized_category ?? null, image_urls: Array.isArray(source.image_urls) ? source.image_urls : [], product_url: source.product_url ?? null };
}

export function fingerprintCatalogSource(source: CatalogAiSource) {
  return createHash("sha256").update(JSON.stringify(sourceSnapshot(source))).digest("hex");
}

export function buildSourceGroundedCatalogPrompt(source: ReturnType<typeof sourceSnapshot>) {
  return [
    "Return JSON only matching the schema.",
    "Use only the SOURCE below. If data is absent, state that it is missing in reasons and choose REVIEW or REJECT.",
    "Do not invent or mention prices, stock, ingredients, technical characteristics, certifications, brands, medical benefits, therapeutic properties, or facts absent from SOURCE.",
    "Do not change the stated brand; use it only when present in SOURCE.",
    `SOURCE=${JSON.stringify(source)}`,
  ].join("\n");
}

export async function processCatalogAiProduct(supabase: SupabaseClient, userId: string, catalogProductId: string) {
  const config = getCatalogAiConfig();
  if (!config.enabled || !config.model) throw new Error(config.reason ?? "catalog_ai_unavailable");
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) throw new Error("catalog_ai_gateway_credentials_missing");
  const { data: product, error } = await supabase.from("catalog_products").select("id,supplier_product_id,category,supplier_products(original_title,original_description,brand,category,image_urls,product_url)").eq("id", catalogProductId).single();
  if (error || !product) throw new Error(error?.message ?? "catalog_product_not_found");
  const supplier = Array.isArray(product.supplier_products) ? product.supplier_products[0] : product.supplier_products;
  if (!supplier) throw new Error("supplier_product_not_found");
  const source: CatalogAiSource = { id: String(product.id), supplier_product_id: String(product.supplier_product_id), original_title: String(supplier.original_title), original_description: supplier.original_description ?? null, brand: supplier.brand ?? null, category: supplier.category ?? null, image_urls: supplier.image_urls, product_url: supplier.product_url ?? null, normalized_category: product.category ?? null };
  const fingerprint = fingerprintCatalogSource(source);
  const { data: existing } = await supabase.from("catalog_ai_results").select("id,status").eq("catalog_product_id", product.id).eq("input_fingerprint", fingerprint).in("status", ["completed", "approved", "skipped"]).limit(1).maybeSingle();
  if (existing) return { status: "skipped" as const, resultId: existing.id, reason: "source_unchanged" };
  const { count } = await supabase.from("catalog_ai_results").select("id", { count: "exact", head: true }).eq("catalog_product_id", product.id).eq("input_fingerprint", fingerprint).eq("status", "failed");
  if ((count ?? 0) >= config.maxRetries) throw new Error("catalog_ai_retry_limit_reached");
  const { data: run, error: runError } = await supabase.from("catalog_ai_runs").insert({ status: "running", product_count: 1, model: config.model, requested_by: userId }).select("id").single();
  if (runError || !run) throw new Error(runError?.message ?? "catalog_ai_run_create_failed");
  const snapshot = sourceSnapshot(source);
  try {
    const result = await generateObject({ model: config.model, schema: catalogAiOutputSchema, prompt: buildSourceGroundedCatalogPrompt(snapshot), maxOutputTokens: config.maxTokens, abortSignal: AbortSignal.timeout(config.timeoutMs) });
    const output = catalogAiOutputSchema.parse(result.object);
    const { data: persisted, error: resultError } = await supabase.from("catalog_ai_results").insert({ run_id: run.id, catalog_product_id: product.id, supplier_product_id: product.supplier_product_id, input_fingerprint: fingerprint, source_snapshot: snapshot, model: config.model, output, quality_score: output.quality_score, recommendation: output.recommendation, status: "completed" }).select("id").single();
    if (resultError || !persisted) throw new Error(resultError?.message ?? "catalog_ai_result_create_failed");
    await supabase.from("catalog_ai_runs").update({ status: "completed", total_tokens: result.usage?.totalTokens ?? null, completed_at: new Date().toISOString() }).eq("id", run.id);
    return { status: "completed" as const, resultId: persisted.id, output };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message.slice(0, 500) : "catalog_ai_model_error";
    await supabase.from("catalog_ai_results").insert({ run_id: run.id, catalog_product_id: product.id, supplier_product_id: product.supplier_product_id, input_fingerprint: fingerprint, source_snapshot: snapshot, model: config.model, status: "failed", error: message });
    await supabase.from("catalog_ai_runs").update({ status: "failed", error: message, completed_at: new Date().toISOString() }).eq("id", run.id);
    throw new Error("catalog_ai_processing_failed");
  }
}

export async function reviewCatalogAiResult(supabase: SupabaseClient, userId: string, resultId: string, decision: "approved" | "rejected", reason?: string) {
  const { data: result, error } = await supabase.from("catalog_ai_results").select("id,catalog_product_id,output").eq("id", resultId).single();
  if (error || !result) throw new Error(error?.message ?? "catalog_ai_result_not_found");
  const output = catalogAiOutputSchema.parse(result.output);
  const reviewReason = reason?.trim().slice(0, 500) || null;
  await supabase.from("catalog_ai_results").update({ status: decision, reviewed_by: userId, reviewed_at: new Date().toISOString(), review_reason: reviewReason, updated_at: new Date().toISOString() }).eq("id", result.id);
  if (decision === "approved") await supabase.from("catalog_products").update({ ai_result: output, ai_processed: true, approved: true, status: "approved", updated_at: new Date().toISOString() }).eq("id", result.catalog_product_id);
  return { id: result.id, decision };
}

function boundedInt(raw: string | undefined, fallback: number, min: number, max: number) { const parsed = Number(raw); return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback; }
