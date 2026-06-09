import { evaluateBrandCandidate } from "@/services/autopilot-decision-engine";
import { checkCompliance } from "@/services/uruguay-cosmetics-compliance";

describe("Decision engine for K-beauty", () => {
  it("evaluates DERMAFIRM candidate correctly", () => {
    const result = evaluateBrandCandidate({ slug: "dermafirm" });
    expect(result.recommendation).toBe("review");
    expect(result.riskLevel).toBe("medium");
    expect(result.complianceStatus).toBe("blocked_pending_documentation");
    expect(result.professionalTrainingNeed).toBe("medium");
    expect(result.blockers).toContain("no_msp_registration");
  });

  it("evaluates KRX Aesthetics candidate correctly", () => {
    const result = evaluateBrandCandidate({ slug: "krx-aesthetics" });
    expect(result.riskLevel).toBe("medium_high");
    expect(result.professionalTrainingNeed).toBe("high");
    expect(result.blockers).toContain("no_training_confirmed");
  });
});

describe("Uruguay compliance service", () => {
  it("returns blocked compliance for DERMAFIRM", () => {
    const result = checkCompliance({ slug: "dermafirm" });
    expect(result.complianceStatus).toBe("blocked_pending_documentation");
    expect(result.requiredDocuments).toContain("certificado_libre_venta");
    expect(result.professionalOnly).toBe(false);
  });

  it("returns blocked compliance and professionalOnly true for KRX", () => {
    const result = checkCompliance({ slug: "krx-aesthetics" });
    expect(result.complianceStatus).toBe("blocked_pending_documentation");
    expect(result.professionalOnly).toBe(true);
  });
});
