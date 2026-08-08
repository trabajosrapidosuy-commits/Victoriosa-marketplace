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
  isDemo?: boolean;
}

export const EMPTY_CATALOG_MESSAGE = "Estamos preparando una seleccion curada de productos Victoriosa. Pronto vas a poder comprar online.";
export const DEMO_CATALOG_NOTICE = "Modo demostracion: estos productos son ejemplos de interfaz. No estan publicados ni disponibles para compra real.";

export type MarketplaceStorefrontRow = Record<string, unknown>;

/** Public eligibility is checked both by the repository and before mapping. */
export function isMarketplaceStorefrontProduct(row: MarketplaceStorefrontRow) {
  const price = Number(row.sale_price);
  return row.publication_status === "published"
    && row.compliance_status === "approved"
    && row.risk_level === "low"
    && ["in_stock", "limited", "preorder"].includes(String(row.stock_status))
    && typeof row.slug === "string" && row.slug.length > 0
    && Number.isFinite(price) && price > 0;
}

export function mapPublicCatalogProduct(row: MarketplaceStorefrontRow): PublicCatalogProduct {
  if (!isMarketplaceStorefrontProduct(row)) throw new Error("Marketplace product is not eligible for storefront");
  const imageUrls = Array.isArray(row.image_urls) ? row.image_urls.map(String).filter(Boolean) : [];
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
    mainImageUrl: optionalString(row.main_image_url) ?? imageUrls[0],
    salePrice: Number(row.sale_price),
    compareAtPrice: optionalNumber(row.compare_at_price),
    currency: String(row.currency ?? "UYU"),
    localCurrency: String(row.local_currency ?? row.currency ?? "UYU"),
    stockStatus: String(row.stock_status),
    fulfillmentType: String(row.fulfillment_type ?? "direct_dropship"),
    estimatedDeliveryMinDays: optionalNumber(row.estimated_delivery_min_days),
    estimatedDeliveryMaxDays: optionalNumber(row.estimated_delivery_max_days),
    returnWindowDays: optionalNumber(row.return_window_days),
  };
}

export function filterCatalogProducts(products: PublicCatalogProduct[], category?: string) {
  return category ? products.filter((product) => product.category === category) : products;
}

export function mapDemoCatalogProduct(product: PublicCatalogProduct): PublicCatalogProduct {
  return { ...product, id: `demo-${product.id}`, isDemo: true };
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export interface CatalogStorefrontRow {
  id: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
  price?: number | string | null;
  currency?: string | null;
  stock?: number | null;
  images?: unknown;
  slug?: string | null;
  status?: string | null;
  approved?: boolean | null;
}

/**
 * Compatibility boundary for the future catalog_products storefront read path.
 * It is intentionally pure and is not queried until remote schema parity is verified.
 */
export function isCatalogStorefrontProduct(row: CatalogStorefrontRow) {
  return row.status === "approved" && row.approved === true && (row.stock ?? 0) > 0 && Boolean(row.slug) && Boolean(row.price);
}

export function mapCatalogStorefrontProduct(row: CatalogStorefrontRow): PublicCatalogProduct {
  if (!isCatalogStorefrontProduct(row)) throw new Error("Catalog product is not eligible for storefront");
  const images = Array.isArray(row.images) ? row.images.map(String) : [];
  return {
    id: row.id,
    title: row.title,
    slug: row.slug!,
    description: row.description ?? "",
    shortDescription: row.short_description ?? row.description ?? "",
    brand: optionalString(row.brand),
    category: row.category ?? "Sin categoría",
    subcategory: optionalString(row.subcategory),
    tags: [],
    mainImageUrl: images[0],
    salePrice: Number(row.price),
    currency: row.currency ?? "UYU",
    localCurrency: row.currency ?? "UYU",
    stockStatus: "in_stock",
    fulfillmentType: "manual_resale",
  };
}
