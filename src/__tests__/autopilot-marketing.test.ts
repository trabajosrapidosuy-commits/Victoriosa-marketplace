import { describe, expect, it } from "vitest";
import { getDemoCandidates } from "@/services/autopilot-service";
import { generateCommercialDraft } from "@/services/autopilot-marketing-service";

describe("autopilot-marketing-service", () => {
  it("creates a review-only email draft for a safe sandbox candidate", () => {
    const draft = generateCommercialDraft(getDemoCandidates()[0]);
    expect(draft.emailSubject).toContain("Victoriosa");
    expect(draft.safetyNotice).toContain("BORRADOR_NO_ENVIAR");
  });

  it("marks risky candidates as blocked and not sendable", () => {
    const riskyCandidate = getDemoCandidates().find((candidate) => candidate.riskFlags.length > 0);
    expect(riskyCandidate).toBeDefined();
    const draft = generateCommercialDraft(riskyCandidate!);
    expect(draft.title).toContain("[NO PUBLICAR]");
    expect(draft.safetyNotice).toContain("BLOQUEADO_NO_ENVIAR");
  });
});
