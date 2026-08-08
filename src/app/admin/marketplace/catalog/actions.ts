"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { TEST_CATALOG, TEST_SUPPLIER } from "@/lib/catalog/test-supplier";
import { syncCatalogProducts } from "@/services/catalog-sync-service";
import { processCatalogAiProduct, reviewCatalogAiResult } from "@/services/catalog-ai-service";

export async function runTestCatalogSyncAction() {
  const { supabase } = await requireAdmin();
  const { data: supplier, error } = await supabase.from("suppliers").upsert({ name: TEST_SUPPLIER.name, status: TEST_SUPPLIER.status, feed_type: TEST_SUPPLIER.feedType, country: TEST_SUPPLIER.country, currency: TEST_SUPPLIER.currency }, { onConflict: "name" }).select("id").single();
  if (error || !supplier) throw new Error(error?.message ?? "Could not prepare test supplier");
  await syncCatalogProducts(supabase, supplier.id, TEST_CATALOG, "test");
  revalidatePath("/admin/marketplace/catalog");
}

export async function createCatalogSupplierAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim(); const feedType = String(formData.get("feedType") ?? "json"); const feedUrl = String(formData.get("feedUrl") ?? "").trim();
  if (!name || !["csv", "xml", "json", "api", "url_feed"].includes(feedType)) throw new Error("Invalid supplier input");
  const { error } = await supabase.from("suppliers").insert({ name, feed_type: feedType, feed_url: feedUrl || null, status: "draft" });
  if (error) throw new Error(error.message); revalidatePath("/admin/marketplace/catalog");
}

export async function processCatalogAiAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  await processCatalogAiProduct(supabase, user.id, String(formData.get("catalogProductId") ?? ""));
  revalidatePath("/admin/marketplace/catalog");
}

export async function reviewCatalogAiAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "approved" && decision !== "rejected") throw new Error("Invalid AI review decision");
  await reviewCatalogAiResult(supabase, user.id, String(formData.get("resultId") ?? ""), decision, String(formData.get("reason") ?? ""));
  revalidatePath("/admin/marketplace/catalog");
}
