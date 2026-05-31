export interface PricingInput {
  costPrice: number;
  shippingCost?: number;
  estimatedFees?: number;
  riskBufferPercent?: number;
  marginPercent?: number;
  fixedMargin?: number;
  currency?: string;
}

export function calculateSalePriceFromCost(input: PricingInput): number {
  const cost = positive(input.costPrice, "costPrice");
  const shipping = Math.max(0, input.shippingCost ?? 0);
  const fees = Math.max(0, input.estimatedFees ?? 0);
  const riskBufferPercent = Math.max(0, input.riskBufferPercent ?? 0);
  const marginPercent = Math.max(0, input.marginPercent ?? 55);
  const fixedMargin = Math.max(0, input.fixedMargin ?? 0);
  const base = cost + shipping + fees;
  const withRisk = base * (1 + riskBufferPercent / 100);
  const sale = withRisk * (1 + marginPercent / 100) + fixedMargin;
  return applyPsychologicalPricing(sale, input.currency ?? "UYU");
}

export function calculateProfit(salePrice: number, totalCost: number): number {
  return round2(salePrice - totalCost);
}

export function calculateMargin(salePrice: number, totalCost: number): number {
  if (salePrice <= 0) return 0;
  return round2(((salePrice - totalCost) / salePrice) * 100);
}

export function calculateBreakEvenPrice(input: Omit<PricingInput, "marginPercent" | "fixedMargin">): number {
  const cost = positive(input.costPrice, "costPrice");
  const shipping = Math.max(0, input.shippingCost ?? 0);
  const fees = Math.max(0, input.estimatedFees ?? 0);
  const riskBufferPercent = Math.max(0, input.riskBufferPercent ?? 0);
  return round2((cost + shipping + fees) * (1 + riskBufferPercent / 100));
}

export function convertCurrency(amount: number, fxRate: number): number {
  if (fxRate <= 0) throw new Error("fxRate must be greater than 0");
  return round2(amount * fxRate);
}

export function applyMarkupRules(amount: number, marginPercent: number, minimumMarginPercent = 25): number {
  const safeMargin = Math.max(marginPercent, minimumMarginPercent);
  return round2(amount * (1 + safeMargin / 100));
}

export function applyPsychologicalPricing(price: number, currency = "UYU"): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (currency.toUpperCase() === "UYU") {
    if (price < 100) return Math.ceil(price / 10) * 10;
    const base = Math.floor(price / 1000) * 1000;
    const endings = [490, 590, 690, 790, 890, 990];
    const candidate = endings.map((e) => base + e).find((value) => value >= price);
    return candidate ?? base + 1490;
  }
  return Math.ceil(price) - 0.01;
}

export function productMeetsMinimumMargin(salePrice: number, totalCost: number, minimumMarginPercent = 25): boolean {
  return calculateMargin(salePrice, totalCost) >= minimumMarginPercent;
}

function positive(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${field} must be a positive number`);
  return value;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
