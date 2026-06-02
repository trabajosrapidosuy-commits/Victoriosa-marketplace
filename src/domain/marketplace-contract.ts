import { z } from "zod";

export const PUBLIC_PRODUCT_FILTER = {
  publication_status: "published",
  compliance_status: "approved",
  risk_level: "low",
} as const;

const productBaseSchema = z.object({
  supplier_id: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().default(""),
  short_description: z.string().default(""),
  brand: z.string().nullable().optional(),
  category: z.string().trim().min(2),
  subcategory: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  source_url: z.string().url().nullable().optional(),
  source_platform: z.string().nullable().optional(),
  external_product_id: z.string().nullable().optional(),
  external_sku: z.string().nullable().optional(),
  image_urls: z.array(z.string()).default([]),
  main_image_url: z.string().nullable().optional(),
  image_rights_status: z.enum(["unknown", "allowed", "not_allowed", "own_image", "needs_review"]).default("needs_review"),
  cost_price: z.number().nonnegative().default(0),
  shipping_cost: z.number().nonnegative().default(0),
  platform_fee_estimate: z.number().nonnegative().default(0),
  target_margin_percent: z.number().nonnegative().default(55),
  target_margin_amount: z.number().default(0),
  sale_price: z.number().nonnegative().default(0),
  currency: z.string().default("USD"),
  local_currency: z.string().default("UYU"),
  fx_rate: z.number().positive().default(1),
  stock_status: z.enum(["unknown", "in_stock", "out_of_stock", "limited", "preorder"]).default("unknown"),
  fulfillment_type: z.enum(["direct_dropship", "affiliate", "manual_resale", "local_stock", "service_bundle"]).default("direct_dropship"),
});

export const createMarketplaceProductSchema = productBaseSchema.transform((product) => ({
  ...product,
  compliance_status: "needs_review" as const,
  publication_status: "draft" as const,
  risk_level: "medium" as const,
}));

export const updateMarketplaceProductSchema = productBaseSchema
  .partial()
  .extend({
    id: z.string().uuid(),
    compliance_status: z.enum(["draft", "needs_review", "approved", "rejected", "blocked"]).optional(),
    publication_status: z.enum(["draft", "archived", "hidden"]).optional(),
    risk_level: z.enum(["low", "medium", "high", "blocked"]).optional(),
  });

export const createMarketplaceSupplierSchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(["amazon", "aliexpress", "temu", "cj_dropshipping", "dropshipman", "dsers", "autods", "zendrop", "manual", "csv", "local", "other"]),
  website_url: z.string().url().nullable().optional(),
  api_enabled: z.boolean().default(false),
  trust_level: z.enum(["unknown", "low", "medium", "high", "verified"]).default("unknown"),
  allows_dropshipping: z.boolean().default(false),
  allows_resale: z.boolean().default(false),
  allows_image_use: z.boolean().default(false),
  allows_branding: z.boolean().default(false),
  return_policy_url: z.string().url().nullable().optional(),
  status: z.enum(["active", "paused", "blocked", "needs_review"]).default("needs_review"),
});

export const updateMarketplaceSupplierSchema = createMarketplaceSupplierSchema.partial().extend({ id: z.string().uuid() });

export const updateReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "approved", "rejected", "blocked", "needs_changes"]),
  notes: z.string().nullable().optional(),
  checklist: z.record(z.string(), z.unknown()).optional(),
});

export const updateOrderSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending_payment", "paid", "supplier_pending", "supplier_ordered", "shipped", "delivered", "cancelled", "refunded", "disputed"]),
  admin_notes: z.string().nullable().optional(),
});

const supplierTypeSchema = z.enum(["amazon", "aliexpress", "temu", "cj_dropshipping", "dropshipman", "dsers", "autods", "zendrop", "manual", "csv", "local", "other"]);

export const persistentImportSchema = z.object({
  sourceType: supplierTypeSchema.default("manual"),
  fileName: z.string().trim().max(180).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  supplier: z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(120),
    type: supplierTypeSchema.default("manual"),
  }),
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(500),
});
