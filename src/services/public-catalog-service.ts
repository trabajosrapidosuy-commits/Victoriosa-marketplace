import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPublicProductBySlug, listPublicProducts } from "@/repositories/marketplace-repository";
import { mapPublicCatalogProduct } from "@/domain/public-catalog";

export async function getPublicCatalog() {
  const supabase = await createClient();
  const products = await listPublicProducts(supabase);
  return (products ?? []).map((product) => mapPublicCatalogProduct(product as Record<string, unknown>));
}

export async function getPublicCatalogProduct(slug: string) {
  const supabase = await createClient();
  const product = await getPublicProductBySlug(supabase, slug);
  return mapPublicCatalogProduct(product as Record<string, unknown>);
}
