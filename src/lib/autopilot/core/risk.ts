import type { NormalizedSupplierProduct, RiskAssessment } from "./types";

const highRiskTerms = ["cura", "medicamento", "suplemento", "ingerible", "replica", "falsificacion", "milagro", "enfermedad"];
const reviewTerms = ["bebe", "nino", "litio", "bateria", "electrico", "certificacion", "anti acne", "blanqueamiento"];

export function detectProductRisks(product: NormalizedSupplierProduct): RiskAssessment {
  const text = `${product.title} ${product.description} ${product.tags.join(" ")}`.toLowerCase();
  const riskFlags: string[] = [];
  if (highRiskTerms.some((term) => text.includes(term))) riskFlags.push("blocked_commercial_risk");
  if (reviewTerms.some((term) => text.includes(term))) riskFlags.push("regulated_or_sensitive_review");
  if (!product.description.trim() || product.images.length === 0) riskFlags.push("insufficient_product_data");
  if ((product.deliveryEstimateDays ?? 0) > 45) riskFlags.push("shipping_too_long");
  const riskScore = Math.min(100, riskFlags.reduce((score, flag) => score + (flag === "blocked_commercial_risk" ? 70 : 25), 0));
  return {
    riskScore,
    riskFlags,
    recommendedAction: riskScore >= 70 ? "reject" : riskScore > 0 ? "needs_review" : "approve_candidate",
  };
}
