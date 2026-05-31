import { z } from "zod";
import type { MarketplaceProduct } from "@/types/marketplace";
import { calculateSalePriceFromCost, calculateMargin } from "./pricing-service";
import { detectRiskFlags, validateProductCompliance } from "./compliance-service";
import { victoriosaSeedProducts } from "@/data/victoriosaSeedProducts";

export const marketplaceProductInputSchema = z.object({
  title: z.string().min(3),
  brand: z.string().optional(),
  category: z.string().min(2),
  subcategory: z.string().optional(),
  source_platform: z.string().optional(),
  source_url: z.string().url().optional().or(z.literal("")),
  external_sku: z.string().optional(),
  cost_price: z.coerce.number().nonnegative(),
  shipping_cost: z.coerce.number().nonnegative().default(0),
  currency: z.string().default("USD"),
  target_margin_percent: z.coerce.number().nonnegative().default(55),
  sale_price: z.coerce.number().optional(),
  main_image_url: z.string().optional(),
  stock_status: z.string().default("unknown"),
  estimated_delivery_min_days: z.coerce.number().optional(),
  estimated_delivery_max_days: z.coerce.number().optional(),
  fulfillment_type: z.string().default("direct_dropship"),
  tags: z.string().optional(),
  description: z.string().optional(),
  supplier_name: z.string().optional(),
  allows_image_use: z.coerce.boolean().optional(),
  allows_resale: z.coerce.boolean().optional(),
  notes: z.string().optional()
});

export function normalizeSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function normalizeMarketplaceProduct(raw: unknown): MarketplaceProduct {
  const parsed = marketplaceProductInputSchema.parse(raw);
  const slug = normalizeSlug(parsed.title);
  const salePrice = parsed.sale_price ?? calculateSalePriceFromCost({
    costPrice: parsed.cost_price,
    shippingCost: parsed.shipping_cost,
    marginPercent: parsed.target_margin_percent,
    currency: parsed.currency === "UYU" ? "UYU" : "USD"
  });
  const product: MarketplaceProduct = {
    id: cryptoSafeId(slug),
    title: parsed.title,
    slug,
    description: parsed.description ?? parsed.title,
    shortDescription: (parsed.description ?? parsed.title).slice(0, 150),
    brand: parsed.brand,
    category: parsed.category,
    subcategory: parsed.subcategory,
    tags: parsed.tags ? parsed.tags.split(/[|,]/).map((tag) => tag.trim()).filter(Boolean) : [],
    sourceUrl: parsed.source_url || undefined,
    sourcePlatform: parsed.source_platform,
    externalSku: parsed.external_sku,
    imageUrls: parsed.main_image_url ? [parsed.main_image_url] : [],
    mainImageUrl: parsed.main_image_url || "/placeholder-product.svg",
    imageRightsStatus: parsed.allows_image_use ? "allowed" : "needs_review",
    costPrice: parsed.cost_price,
    shippingCost: parsed.shipping_cost,
    platformFeeEstimate: 0,
    targetMarginPercent: parsed.target_margin_percent,
    targetMarginAmount: salePrice - parsed.cost_price - parsed.shipping_cost,
    salePrice,
    currency: parsed.currency,
    localCurrency: "UYU",
    fxRate: 1,
    stockStatus: parsed.stock_status as MarketplaceProduct["stockStatus"],
    fulfillmentType: parsed.fulfillment_type as MarketplaceProduct["fulfillmentType"],
    complianceStatus: "needs_review",
    publicationStatus: "draft",
    riskLevel: "medium",
    supplierRating: undefined,
    estimatedDeliveryMinDays: parsed.estimated_delivery_min_days,
    estimatedDeliveryMaxDays: parsed.estimated_delivery_max_days,
    returnWindowDays: 7,
    reviewNotes: parsed.notes
  };
  product.riskLevel = detectRiskFlags(product).riskLevel;
  return product;
}

export function calculateSuggestedPrice(product: Pick<MarketplaceProduct, "costPrice" | "shippingCost" | "targetMarginPercent" | "currency">): number {
  return calculateSalePriceFromCost({
    costPrice: product.costPrice,
    shippingCost: product.shippingCost,
    marginPercent: product.targetMarginPercent,
    currency: product.currency
  });
}

export function mapMarketplaceProduct(product: MarketplaceProduct): MarketplaceProduct & { marginPercent: number; complianceIssues: string[] } {
  const totalCost = product.costPrice + product.shippingCost + product.platformFeeEstimate;
  return {
    ...product,
    marginPercent: calculateMargin(product.salePrice, totalCost),
    complianceIssues: validateProductCompliance(product)
  };
}

export function searchMarketplaceProducts(query: string, products = getFeaturedProducts(50)): MarketplaceProduct[] {
  const q = query.toLowerCase();
  return products.filter((product) => [product.title, product.category, product.subcategory, product.description].join(" ").toLowerCase().includes(q));
}

export function getFeaturedProducts(limit = 12): MarketplaceProduct[] {
  return victoriosaSeedProducts.slice(0, limit).map(seedToProduct);
}

export function getProductsByCategory(category: string): MarketplaceProduct[] {
  return getFeaturedProducts(50).filter((product) => product.category === category);
}

export function getProductsBySupplier(_supplierId: string): MarketplaceProduct[] {
  return [];
}

export function getProductsNeedingReview(): MarketplaceProduct[] {
  return getFeaturedProducts(50).filter((product) => product.complianceStatus !== "approved" || product.riskLevel !== "low");
}

export function buildAffiliateRedirectUrl(product: MarketplaceProduct): string {
  if (!product.sourceUrl) return "/productos/" + product.slug;
  const url = new URL(product.sourceUrl);
  url.searchParams.set("utm_source", "victoriosa");
  url.searchParams.set("utm_medium", "affiliate_redirect");
  return url.toString();
}

export function trackMarketplaceEvent(event: { productId?: string; eventType: string; metadata?: Record<string, unknown> }) {
  return { ok: true, queued: true, event, message: "Event tracking stub. Persist to marketplace_click_events in Supabase." };
}

function seedToProduct(seed: (typeof victoriosaSeedProducts)[number]): MarketplaceProduct {
  return {
    id: seed.id,
    title: seed.title,
    slug: seed.slug,
    description: seed.description,
    shortDescription: seed.description.slice(0, 130),
    category: seed.category,
    subcategory: seed.subcategory,
    tags: [...seed.tags],
    imageUrls: [seed.main_image_url],
    mainImageUrl: seed.main_image_url,
    imageRightsStatus: "own_image",
    costPrice: seed.cost_price,
    shippingCost: seed.shipping_cost,
    platformFeeEstimate: 0,
    targetMarginPercent: 55,
    targetMarginAmount: seed.margin,
    salePrice: seed.suggested_sale_price,
    currency: "USD",
    localCurrency: "UYU",
    fxRate: 40,
    stockStatus: "unknown",
    fulfillmentType: seed.fulfillment_type as MarketplaceProduct["fulfillmentType"],
    complianceStatus: seed.compliance_status as MarketplaceProduct["complianceStatus"],
    publicationStatus: seed.publication_status as MarketplaceProduct["publicationStatus"],
    riskLevel: seed.risk_level as MarketplaceProduct["riskLevel"],
    estimatedDeliveryMinDays: 15,
    estimatedDeliveryMaxDays: 35,
    returnWindowDays: 7
  };
}

function cryptoSafeId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return `local-${hash.toString(16)}`;
}
