import type { MarketplaceSupplier } from "@/types/marketplace";

export function createSupplier(input: Omit<MarketplaceSupplier, "id">): MarketplaceSupplier {
  return { ...input, id: `supplier-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` };
}

export function updateSupplier(supplier: MarketplaceSupplier, patch: Partial<MarketplaceSupplier>): MarketplaceSupplier {
  return { ...supplier, ...patch };
}

export function getSupplierTrustScore(supplier: MarketplaceSupplier): number {
  const trust = { unknown: 10, low: 25, medium: 55, high: 80, verified: 95 }[supplier.trustLevel];
  const permissions = [supplier.allowsDropshipping, supplier.allowsResale, supplier.allowsImageUse, supplier.allowsBranding].filter(Boolean).length * 5;
  const penalty = supplier.status === "blocked" ? 100 : supplier.status === "needs_review" ? 20 : 0;
  return Math.max(0, Math.min(100, trust + permissions - penalty));
}

export function blockSupplier(supplier: MarketplaceSupplier, reason: string): MarketplaceSupplier {
  return { ...supplier, status: "blocked", riskNotes: `${supplier.riskNotes ?? ""}\nBlocked: ${reason}`.trim() };
}

export function supplierSupportsDropshipping(supplier: MarketplaceSupplier): boolean {
  return supplier.status === "active" && supplier.allowsDropshipping && supplier.trustLevel !== "unknown" && supplier.trustLevel !== "low";
}
