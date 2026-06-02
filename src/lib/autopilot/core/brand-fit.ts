import type { NormalizedSupplierProduct } from "./types";

const brandTerms = ["belleza", "facial", "maquillaje", "estetica", "autocuidado", "beauty", "corporal", "organizador", "esponja"];
const mismatchTerms = ["motor", "repuesto", "gaming", "industrial", "mascota"];

export function scoreBrandFit(product: NormalizedSupplierProduct): { score: number; reasons: string[] } {
  const text = `${product.title} ${product.description} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
  const matches = brandTerms.filter((term) => text.includes(term));
  const mismatches = mismatchTerms.filter((term) => text.includes(term));
  const score = clamp(35 + matches.length * 14 - mismatches.length * 35);
  return { score, reasons: matches.length ? [`Afinidad Victoriosa: ${matches.join(", ")}`] : ["Afinidad de marca limitada"] };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
