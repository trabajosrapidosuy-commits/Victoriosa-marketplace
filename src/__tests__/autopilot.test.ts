import { describe, expect, it } from "vitest";
import { calculateCandidateScore, listAutopilotConnectors, runProductDiscovery } from "@/services/autopilot-service";

describe("autopilot-service", () => {
  it("creates mock candidates that always require admin review", () => {
    const result = runProductDiscovery({ connectorId: "mock", maximumShippingDays: 30 });
    expect(result.status).toBe("completed");
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.every((candidate) => candidate.status === "pending_admin_review")).toBe(true);
  });

  it("reports external connectors as needs_credentials without failing", () => {
    const result = runProductDiscovery({ connectorId: "cj" });
    expect(result.status).toBe("needs_credentials");
    expect(result.candidates).toEqual([]);
    expect(result.message).toMatch(/deshabilitado|credenciales/i);
  });

  it("penalizes blocked commercial risks", () => {
    const score = calculateCandidateScore({ marginPercent: 60, supplierCost: 5, shippingCost: 2, deliveryDays: 20, viralPotential: 90, riskFlags: ["blocked_commercial_risk"] });
    expect(score.compliance).toBe(0);
  });

  it("declares safe local and credential-bound connectors", () => {
    expect(listAutopilotConnectors().some((connector) => connector.id === "mock" && connector.status === "sandbox")).toBe(true);
    expect(listAutopilotConnectors().some((connector) => connector.id === "zendrop" && (connector.status === "needs_credentials" || connector.status === "disabled"))).toBe(true);
  });
});
