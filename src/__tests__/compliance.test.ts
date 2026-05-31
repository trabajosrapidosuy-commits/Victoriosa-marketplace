import { describe, expect, it } from "vitest";
import { detectRiskFlags } from "@/services/compliance-service";

describe("compliance-service", () => {
  it("blocks possible replicas", () => {
    const result = detectRiskFlags({ title: "Bolso replica 1:1", description: "fake" });
    expect(result.riskLevel).toBe("blocked");
  });

  it("flags medical claims", () => {
    const result = detectRiskFlags({ title: "Crema que cura melasma", description: "promesa fuerte" });
    expect(result.flags).toContain("unverified_medical_claim");
  });
});
