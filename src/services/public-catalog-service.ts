import "server-only";
import { createClient } from "@/lib/supabase/server";
import { maskSecretForLog, validateSupabasePublicEnv } from "@/lib/supabase/env";
import { getPublicProductBySlug, listPublicProducts } from "@/repositories/marketplace-repository";
import { mapDemoCatalogProduct, mapPublicCatalogProduct } from "@/domain/public-catalog";
import { getFeaturedProducts } from "@/services/marketplace-product-service";

export async function getPublicCatalog() {
  if (isDemoMode()) return getDemoCatalog();
  try {
    const supabase = await createClient();
    const products = await listPublicProducts(supabase);
    return (products ?? []).map((product) => mapPublicCatalogProduct(product as Record<string, unknown>));
  } catch (error) {
    console.error("[public-catalog] Failed to load public catalog", {
      message: error instanceof Error ? error.message : "Unknown error",
      supabaseEnv: validateSupabasePublicEnv(),
    });
    return [];
  }
}

export async function getPublicCatalogProduct(slug: string) {
  if (isDemoMode()) return getDemoCatalog().find((product) => product.slug === slug) ?? null;
  try {
    const supabase = await createClient();
    const product = await getPublicProductBySlug(supabase, slug);
    return mapPublicCatalogProduct(product as Record<string, unknown>);
  } catch (error) {
    console.error("[public-catalog] Failed to load public catalog product", {
      slug,
      message: error instanceof Error ? error.message : "Unknown error",
      supabaseKey: maskSecretForLog(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
    return null;
  }
}

function isDemoMode() {
  return process.env.VICTORIOSA_DEMO_MODE === "true";
}

function getDemoCatalog() {
  return getFeaturedProducts(8).map((product) => mapDemoCatalogProduct({
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    category: product.category,
    subcategory: product.subcategory,
    tags: product.tags,
    mainImageUrl: product.mainImageUrl,
    salePrice: product.salePrice,
    localCurrency: product.localCurrency,
    currency: product.currency,
    stockStatus: product.stockStatus,
    fulfillmentType: product.fulfillmentType,
    estimatedDeliveryMinDays: product.estimatedDeliveryMinDays,
    estimatedDeliveryMaxDays: product.estimatedDeliveryMaxDays,
    returnWindowDays: product.returnWindowDays,
  }));
}
