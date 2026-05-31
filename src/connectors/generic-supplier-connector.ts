import type { SupplierConnector } from "./supplier-connector.interface";
import { normalizeMarketplaceProduct } from "@/services/marketplace-product-service";

export const genericSupplierConnector: SupplierConnector = {
  name: "Generic Supplier Connector",
  sourceType: "other",
  capabilities: { api: false, csv: true, manualUrl: true, affiliate: true, directDropship: true, requiresCredentials: false },
  async importProducts(input: unknown) {
    return Array.isArray(input) ? input : [input];
  },
  normalizeProduct(raw: unknown) {
    const product = normalizeMarketplaceProduct(raw);
    product.complianceStatus = "needs_review";
    product.publicationStatus = "draft";
    return product;
  },
  validatePermissions(raw: unknown) {
    const payload = raw as Record<string, unknown>;
    const issues: string[] = [];
    if (!payload.allows_image_use) issues.push("image_permission_not_confirmed");
    if (!payload.allows_resale) issues.push("resale_permission_not_confirmed");
    return issues;
  },
  estimateShipping() {
    return { minDays: 7, maxDays: 35, notes: "Estimated only. Confirm with supplier before publishing." };
  },
  calculateRisk(raw: unknown) {
    const issues = this.validatePermissions(raw);
    return { riskLevel: issues.length > 0 ? "high" : "medium", flags: issues };
  }
};
