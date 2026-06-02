import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPublicProductBySlug, listPublicProducts } from "@/repositories/marketplace-repository";
import { mapDemoCatalogProduct, mapPublicCatalogProduct } from "@/domain/public-catalog";
import { getFeaturedProducts } from "@/services/marketplace-product-service";

export async function getPublicCatalog() {
  if (isDemoMode()) return getDemoCatalog();
  const supabase = await createClient();
  const products = await listPublicProducts(supabase);
  return (products ?? []).map((product) => mapPublicCatalogProduct(product as Record<string, unknown>));
}

export async function getPublicCatalogProduct(slug: string) {
  if (isDemoMode()) return getDemoCatalog().find((product) => product.slug === slug) ?? null;
  const supabase = await createClient();
  const product = await getPublicProductBySlug(supabase, slug);
  return mapPublicCatalogProduct(product as Record<string, unknown>);
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
