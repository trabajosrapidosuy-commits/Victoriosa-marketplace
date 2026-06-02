import type { NormalizedSupplierProduct, PricingResult } from "./types";

export interface PricingOptions {
  baseMarkupPercent?: number;
  minimumMarginPercent?: number;
  riskScore?: number;
}

export function calculateSuggestedPrice(product: NormalizedSupplierProduct, options: PricingOptions = {}): PricingResult {
  const landedCost = round2(product.buyPrice + product.shippingCost);
  const shippingRatio = landedCost ? product.shippingCost / landedCost : 0;
  let markupPercent = options.baseMarkupPercent ?? 65;
  if (landedCost < 8) markupPercent += 35;
  if (shippingRatio > 0.45) markupPercent -= 15;
  if ((options.riskScore ?? 0) >= 60) markupPercent -= 20;
  markupPercent = Math.max(20, markupPercent);

  let estimatedSellPrice = psychologicalPrice(landedCost * (1 + markupPercent / 100), product.currency);
  const minimumMargin = options.minimumMarginPercent ?? 35;
  if (marginPercent(estimatedSellPrice, landedCost) < minimumMargin) {
    estimatedSellPrice = psychologicalPrice(landedCost / (1 - minimumMargin / 100), product.currency);
  }
  return {
    buyPrice: round2(product.buyPrice),
    shippingCost: round2(product.shippingCost),
    landedCost,
    markupPercent,
    estimatedSellPrice,
    estimatedMarginPercent: marginPercent(estimatedSellPrice, landedCost),
    estimatedProfit: round2(estimatedSellPrice - landedCost),
  };
}

function psychologicalPrice(value: number, currency: string): number {
  if (currency === "UYU") return Math.ceil(value / 10) * 10;
  return Math.max(0, Math.ceil(value) - 0.1);
}

function marginPercent(price: number, cost: number): number {
  return price <= 0 ? 0 : round2(((price - cost) / price) * 100);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
