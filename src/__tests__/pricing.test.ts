import { describe, expect, it } from "vitest";
import { calculateSalePriceFromCost, calculateMargin, productMeetsMinimumMargin } from "@/services/pricing-service";

describe("pricing-service", () => {
  it("calculates sale price above cost", () => {
    expect(calculateSalePriceFromCost({ costPrice: 100, shippingCost: 20, marginPercent: 55, currency: "USD" })).toBeGreaterThan(120);
  });

  it("calculates margin", () => {
    expect(calculateMargin(200, 100)).toBe(50);
  });

  it("blocks low margin", () => {
    expect(productMeetsMinimumMargin(120, 100, 25)).toBe(false);
  });
});
