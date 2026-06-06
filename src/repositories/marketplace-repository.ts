import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createMarketplaceProductSchema,
  createMarketplaceSupplierSchema,
  PUBLIC_PRODUCT_FILTER,
  updateMarketplaceProductSchema,
  updateMarketplaceSupplierSchema,
  updateOrderSchema,
  updateReviewSchema,
} from "@/domain/marketplace-contract";

export async function listPublicProducts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("id,title,slug,description,short_description,brand,category,subcategory,tags,main_image_url,sale_price,compare_at_price,currency,local_currency,stock_status,fulfillment_type,estimated_delivery_min_days,estimated_delivery_max_days,return_window_days")
    .match(PUBLIC_PRODUCT_FILTER)
    .order("created_at", { ascending: false });
  return unwrap(data, error);
}

export async function getPublicProductBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("id,title,slug,description,short_description,brand,category,subcategory,tags,main_image_url,sale_price,compare_at_price,currency,local_currency,stock_status,fulfillment_type,estimated_delivery_min_days,estimated_delivery_max_days,return_window_days")
    .match({ ...PUBLIC_PRODUCT_FILTER, slug })
    .single();
  return unwrap(data, error);
}

export async function listAdminProducts(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("marketplace_products").select("*").order("created_at", { ascending: false });
  return unwrap(data, error);
}

export async function createDraftProduct(supabase: SupabaseClient, raw: unknown) {
  const payload = createMarketplaceProductSchema.parse(raw);
  const { data, error } = await supabase.from("marketplace_products").insert(payload).select("*").single();
  return unwrap(data, error);
}

export async function updateDraftProduct(supabase: SupabaseClient, raw: unknown) {
  const { id, ...payload } = updateMarketplaceProductSchema.parse(raw);
  const { data, error } = await supabase.from("marketplace_products").update(payload).eq("id", id).select("*").single();
  return unwrap(data, error);
}

export async function listSuppliers(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("marketplace_suppliers").select("*").order("created_at", { ascending: false });
  return unwrap(data, error);
}

export async function createSupplier(supabase: SupabaseClient, raw: unknown) {
  const payload = createMarketplaceSupplierSchema.parse(raw);
  const { data, error } = await supabase.from("marketplace_suppliers").insert(payload).select("*").single();
  return unwrap(data, error);
}

export async function updateSupplier(supabase: SupabaseClient, raw: unknown) {
  const { id, ...payload } = updateMarketplaceSupplierSchema.parse(raw);
  const { data, error } = await supabase.from("marketplace_suppliers").update(payload).eq("id", id).select("*").single();
  return unwrap(data, error);
}

export async function listReviewQueue(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("marketplace_reviews_queue").select("*,marketplace_products(*)").order("created_at", { ascending: false });
  return unwrap(data, error);
}

export async function updateReview(supabase: SupabaseClient, raw: unknown) {
  const { id, ...payload } = updateReviewSchema.parse(raw);
  const { data: review, error: reviewError } = await supabase.from("marketplace_reviews_queue").select("product_id").eq("id", id).single();
  if (reviewError || !review) throw new Error(reviewError?.message ?? "Review not found");
  const productPatch = reviewProductPatch(payload.status);
  const { error: productError } = await supabase.from("marketplace_products").update(productPatch).eq("id", review.product_id);
  if (productError) throw new Error(productError.message);
  const { data, error } = await supabase.from("marketplace_reviews_queue").update({ ...payload, reviewed_at: new Date().toISOString() }).eq("id", id).select("*").single();
  return unwrap(data, error);
}

export async function listOrders(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("marketplace_orders").select("*,marketplace_order_items(*)").order("created_at", { ascending: false });
  return unwrap(data, error);
}

export async function updateOrder(supabase: SupabaseClient, raw: unknown) {
  const { id, ...payload } = updateOrderSchema.parse(raw);
  const { data, error } = await supabase.from("marketplace_orders").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  return unwrap(data, error);
}

function unwrap<T>(data: T, error: { message: string; code?: string } | null): T {
  if (error) throw new Error(`[Supabase marketplace error] ${error.message}`);
  return data;
}

function reviewProductPatch(status: "open" | "approved" | "rejected" | "blocked" | "needs_changes") {
  if (status === "approved") return { compliance_status: "approved", publication_status: "draft" };
  if (status === "rejected") return { compliance_status: "rejected", publication_status: "draft" };
  if (status === "blocked") return { compliance_status: "blocked", publication_status: "hidden", risk_level: "blocked" };
  return { compliance_status: "needs_review", publication_status: "draft" };
}
