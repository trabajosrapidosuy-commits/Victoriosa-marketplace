import { describe, expect, it } from "vitest";
import { kbeautyAutopilotSeed } from "../../data/kbeautyAutopilotSeed.js";
import { scoreAutopilotBrand } from "@/services/autopilot/brand-scoring-service";
import { scoreAutopilotProduct } from "@/services/autopilot/product-scoring-service";

describe("autopilot k-beauty research phase", () => {
  it("scores a professional official brand above watchlist when evidence and fit are strong", () => {
    const score = scoreAutopilotBrand({
      name: "HUBISLAB",
      officialEvidenceCount: 2,
      professionalFit: 19,
      differentiationUruguay: 13,
      marginPotential: 8,
      logisticsFeasibility: 7,
      regulatoryRisk: 3,
      reputationSignals: 17,
      representationPotential: "high",
    });
    expect(score.totalScore).toBeGreaterThanOrEqual(60);
    expect(["shortlist", "priority"]).toContain(score.recommendationStatus);
  });

  it("keeps high-regulatory professional treatments out of priority", () => {
    const score = scoreAutopilotProduct({
      name: "Blue Peel",
      brand: "KRX Aesthetics",
      demandSignal: 14,
      victoriosaFit: 12,
      marginPotential: 9,
      regulatoryRisk: 12,
      differentiation: 8,
      sourceEvidenceCount: 1,
      educationEase: 4,
    });
    expect(["watchlist", "reject"]).toContain(score.recommendationStatus);
  });

  it("keeps every seeded product in review-only statuses with no publication path", () => {
    expect(kbeautyAutopilotSeed.products.length).toBeGreaterThanOrEqual(6);
    for (const product of kbeautyAutopilotSeed.products) {
      expect(["needs_review", "needs_supplier_validation"]).toContain(product.status);
      expect(product.claimsValidationStatus).toBe("pending_validation");
      expect(product.imagePermissionStatus).toBe("pending_review");
      expect(product.supplierValidationStatus).toBe("needs_supplier_validation");
    }
  });

  it("does not mark any seeded brand as officially represented", () => {
    for (const brand of kbeautyAutopilotSeed.brands) {
      expect(brand.reputationNotes.toLowerCase()).not.toContain("official representative in uruguay");
      expect(brand.reputationNotes.toLowerCase()).not.toContain("exclusive distributor confirmed");
    }
  });
});
