import type { MarketplaceProduct, SupplierType } from "@/types/marketplace";

export interface SupplierConnectorCapabilities {
  api: boolean;
  csv: boolean;
  manualUrl: boolean;
  affiliate: boolean;
  directDropship: boolean;
  requiresCredentials: boolean;
}

export interface SupplierConnector {
  name: string;
  sourceType: SupplierType | string;
  capabilities: SupplierConnectorCapabilities;
  importProducts(input: unknown): Promise<unknown[]>;
  normalizeProduct(raw: unknown): MarketplaceProduct;
  validatePermissions(raw: unknown): string[];
  estimateShipping(raw: unknown): { minDays: number; maxDays: number; notes: string };
  calculateRisk(raw: unknown): { riskLevel: "low" | "medium" | "high" | "blocked"; flags: string[] };
}
