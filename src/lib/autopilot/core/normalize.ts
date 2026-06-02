import { z } from "zod";
import type { NormalizedSupplierProduct } from "./types";

const manualProductSchema = z.object({
  provider: z.string().trim().min(1).default("manual"),
  providerProductId: z.string().trim().optional(),
  sourceUrl: z.string().url().optional(),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(3).max(5000),
  imageUrl: z.string().url().optional(),
  category: z.string().trim().min(2).max(100),
  buyPrice: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0).default(0),
  inventoryTotal: z.coerce.number().int().min(0).default(0),
  verifiedInventory: z.coerce.number().int().min(0).default(0),
});

export function normalizeManualProduct(input: unknown): NormalizedSupplierProduct {
  const value = manualProductSchema.parse(input);
  return {
    provider: value.provider, providerProductId: value.providerProductId, sourceUrl: value.sourceUrl,
    title: value.title, description: value.description, images: value.imageUrl ? [value.imageUrl] : [],
    category: value.category, niche: "beauty", targetCountry: "UY", currency: "USD",
    buyPrice: value.buyPrice, shippingCost: value.shippingCost, inventoryTotal: value.inventoryTotal,
    verifiedInventory: value.verifiedInventory, tags: [], raw: {},
  };
}
