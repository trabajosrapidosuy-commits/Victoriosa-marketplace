export type CatalogFeedType = "csv" | "xml" | "json" | "api" | "url_feed";
export type CatalogDecision = "PUBLISH" | "REVIEW" | "REJECT";

export interface ExternalProductInput {
  externalId: string;
  sku?: string;
  ean?: string;
  brand?: string;
  title: string;
  description?: string;
  category?: string;
  cost?: number;
  currency?: string;
  stock?: number;
  imageUrls?: string[];
  productUrl?: string;
  rawData: Record<string, unknown>;
}

export interface MarginRule {
  minCost: number;
  maxCost?: number | null;
  multiplier: number;
  currency: string;
}

export interface CatalogScore {
  total: number;
  decision: CatalogDecision;
  reasons: string[];
  breakdown: Record<"margin" | "stock" | "images" | "description" | "availability" | "category" | "price" | "completeness", number>;
}

export interface CatalogNormalizationResult {
  title: string;
  description: string;
  shortDescription: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  images: string[];
  slug: string;
  price?: number;
  margin?: number;
  missingFields: string[];
  score: CatalogScore;
  aiResult: { status: "not_requested" | "disabled" | "ready"; warnings: string[] };
}
