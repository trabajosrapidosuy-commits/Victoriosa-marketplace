import type { NormalizedSupplierProduct } from "./types";

export function estimateViralPotential(product: NormalizedSupplierProduct): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 20;
  if (product.hasVideo) { score += 25; reasons.push("Demostrable en video"); }
  if (product.images.length >= 3) { score += 15; reasons.push("Contenido visual suficiente"); }
  if ((product.reviewsCount ?? 0) >= 50) { score += 15; reasons.push("Resenas del proveedor"); }
  if ((product.listedCount ?? 0) >= 100) { score += 15; reasons.push("Demanda declarada"); }
  if (product.buyPrice + product.shippingCost < 20) { score += 10; reasons.push("Precio impulso potencial"); }
  return { score: Math.min(100, score), reasons };
}
