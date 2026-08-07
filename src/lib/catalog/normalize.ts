import { z } from "zod";
import type { CatalogNormalizationResult, CatalogScore, ExternalProductInput, MarginRule } from "./types";

export const externalProductSchema = z.object({
  externalId: z.string().trim().min(1).max(200),
  sku: z.string().trim().max(200).optional(),
  ean: z.string().trim().max(50).optional(),
  brand: z.string().trim().max(160).optional(),
  title: z.string().trim().min(2).max(500),
  description: z.string().trim().max(10000).optional(),
  category: z.string().trim().max(160).optional(),
  cost: z.coerce.number().nonnegative().finite().optional(),
  currency: z.string().trim().length(3).optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  imageUrls: z.array(z.string().url()).max(20).optional(),
  productUrl: z.string().url().optional(),
  rawData: z.record(z.unknown()),
});

export function normalizeExternalProduct(input: unknown, rules: MarginRule[]): CatalogNormalizationResult {
  const product = externalProductSchema.parse(input) as ExternalProductInput;
  const title = cleanText(product.title);
  const description = cleanText(product.description ?? "");
  const images = [...new Set(product.imageUrls ?? [])];
  const price = calculatePrice(product.cost, product.currency ?? "USD", rules);
  const margin = price && product.cost !== undefined ? round(((price - product.cost) / price) * 100) : undefined;
  const missingFields = [
    !description && "description",
    !product.brand && "brand",
    !product.category && "category",
    product.cost === undefined && "cost",
    product.stock === undefined && "stock",
    images.length === 0 && "images",
  ].filter(Boolean) as string[];
  const score = scoreProduct({ product, description, images, margin, missingFields });

  return {
    title,
    description,
    shortDescription: description.slice(0, 160),
    brand: product.brand,
    category: product.category,
    images,
    slug: slugify([product.brand, title].filter(Boolean).join(" ")),
    price,
    margin,
    missingFields,
    score,
    aiResult: {
      status: process.env.CATALOG_AI_ENABLED === "true" ? "ready" : "disabled",
      warnings: ["AI is constrained to source-grounded transformations; no supplier facts are invented."],
    },
  };
}

export function calculatePrice(cost: number | undefined, currency: string, rules: MarginRule[]) {
  if (cost === undefined) return undefined;
  const rule = rules.find((item) => item.currency === currency && cost >= item.minCost && (item.maxCost === null || item.maxCost === undefined || cost < item.maxCost));
  return rule ? round(cost * rule.multiplier) : undefined;
}

function scoreProduct({ product, description, images, margin, missingFields }: { product: ExternalProductInput; description: string; images: string[]; margin?: number; missingFields: string[] }): CatalogScore {
  const breakdown = {
    margin: margin === undefined ? 0 : margin >= 35 ? 15 : margin >= 20 ? 8 : 0,
    stock: (product.stock ?? 0) >= 10 ? 15 : (product.stock ?? 0) > 0 ? 7 : 0,
    images: images.length >= 3 ? 12 : images.length > 0 ? 6 : 0,
    description: description.length >= 120 ? 12 : description.length >= 30 ? 6 : 0,
    availability: (product.stock ?? 0) > 0 ? 10 : 0,
    category: product.category ? 8 : 0,
    price: product.cost !== undefined ? 8 : 0,
    completeness: Math.max(0, 20 - missingFields.length * 4),
  };
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const decision = (product.stock ?? 0) <= 0 || !product.title ? "REJECT" : total >= 75 && missingFields.length === 0 ? "PUBLISH" : "REVIEW";
  const reasons = [
    ...missingFields.map((field) => `missing_${field}`),
    ...(decision === "REJECT" ? ["unavailable_or_invalid"] : []),
    ...(decision === "REVIEW" ? ["human_review_required"] : []),
  ];
  return { total, decision, reasons, breakdown };
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 180);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
