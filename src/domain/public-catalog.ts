export interface PublicCatalogProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  brand?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  mainImageUrl?: string;
  salePrice: number;
  compareAtPrice?: number;
  currency: string;
  localCurrency: string;
  stockStatus: string;
  fulfillmentType: string;
  estimatedDeliveryMinDays?: number;
  estimatedDeliveryMaxDays?: number;
  returnWindowDays?: number;
}

export const EMPTY_CATALOG_MESSAGE = "Estamos preparando una seleccion curada de productos Victoriosa. Pronto vas a poder comprar online.";

export function mapPublicCatalogProduct(row: Record<string, unknown>): PublicCatalogProduct {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    shortDescription: String(row.short_description ?? ""),
    brand: optionalString(row.brand),
    category: String(row.category),
    subcategory: optionalString(row.subcategory),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    mainImageUrl: optionalString(row.main_image_url),
    salePrice: Number(row.sale_price ?? 0),
    compareAtPrice: optionalNumber(row.compare_at_price),
    currency: String(row.currency ?? "UYU"),
    localCurrency: String(row.local_currency ?? row.currency ?? "UYU"),
    stockStatus: String(row.stock_status ?? "unknown"),
    fulfillmentType: String(row.fulfillment_type ?? "direct_dropship"),
    estimatedDeliveryMinDays: optionalNumber(row.estimated_delivery_min_days),
    estimatedDeliveryMaxDays: optionalNumber(row.estimated_delivery_max_days),
    returnWindowDays: optionalNumber(row.return_window_days),
  };
}

export function filterCatalogProducts(products: PublicCatalogProduct[], category?: string) {
  return category ? products.filter((product) => product.category === category) : products;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
