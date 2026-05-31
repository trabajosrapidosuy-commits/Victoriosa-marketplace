import type { MarketplaceProduct, RiskLevel } from "@/types/marketplace";

const blockedTerms = ["replica", "réplica", "fake", "1:1", "clon", "clonada", "imitacion", "imitación"];
const medicalClaims = ["cura", "curar", "acne severo", "acné severo", "melasma", "dermatitis", "hongos", "infeccion", "infección", "dolor", "enfermedad"];
const restrictedProductTerms = ["suplemento", "pastilla", "medicamento", "inyeccion", "inyección", "bebe", "bebé", "niño", "niña", "arma"];

export interface RiskDetectionResult {
  riskLevel: RiskLevel;
  flags: string[];
  publishableWithoutExplicitAdminApproval: boolean;
}

export function detectRiskFlags(product: Partial<MarketplaceProduct> & { title: string; description?: string }): RiskDetectionResult {
  const text = `${product.title} ${product.description ?? ""}`.toLowerCase();
  const flags: string[] = [];

  if (blockedTerms.some((term) => text.includes(term))) flags.push("possible_counterfeit_or_replica");
  if (medicalClaims.some((term) => text.includes(term))) flags.push("unverified_medical_claim");
  if (restrictedProductTerms.some((term) => text.includes(term))) flags.push("restricted_or_sensitive_product");
  if (!product.sourceUrl && product.fulfillmentType !== "local_stock") flags.push("missing_source_url");
  if (!product.mainImageUrl && (!product.imageUrls || product.imageUrls.length === 0)) flags.push("missing_image");
  if (product.imageRightsStatus === "unknown" || product.imageRightsStatus === "needs_review") flags.push("image_rights_need_review");
  if (product.imageRightsStatus === "not_allowed") flags.push("image_rights_not_allowed");
  if ((product.estimatedDeliveryMaxDays ?? 0) > 45) flags.push("shipping_too_long");
  if ((product.salePrice ?? 0) <= (product.costPrice ?? 0) + (product.shippingCost ?? 0)) flags.push("margin_negative_or_zero");
  if (product.riskLevel === "blocked") flags.push("product_marked_blocked");

  let riskLevel: RiskLevel = "low";
  if (flags.includes("possible_counterfeit_or_replica") || flags.includes("restricted_or_sensitive_product") || flags.includes("image_rights_not_allowed")) {
    riskLevel = "blocked";
  } else if (flags.includes("unverified_medical_claim") || flags.includes("shipping_too_long") || flags.includes("margin_negative_or_zero")) {
    riskLevel = "high";
  } else if (flags.length > 0) {
    riskLevel = "medium";
  }

  return {
    riskLevel,
    flags,
    publishableWithoutExplicitAdminApproval: riskLevel === "low" && product.complianceStatus === "approved"
  };
}

export function validateProductCompliance(product: MarketplaceProduct): string[] {
  const risk = detectRiskFlags(product);
  const issues = [...risk.flags];

  if (product.complianceStatus !== "approved") issues.push("compliance_not_approved");
  if (product.publicationStatus === "published" && product.complianceStatus !== "approved") issues.push("published_without_approval");
  if (product.publicationStatus === "published" && product.riskLevel !== "low") issues.push("published_with_non_low_risk");

  return issues;
}

export function canPublishProduct(product: MarketplaceProduct, explicitAdminApproval = false): boolean {
  const risk = detectRiskFlags(product);
  if (risk.riskLevel === "blocked") return false;
  if (risk.riskLevel === "high" && !explicitAdminApproval) return false;
  return product.complianceStatus === "approved" && product.publicationStatus !== "archived";
}
