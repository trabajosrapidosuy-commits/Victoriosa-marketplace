import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadAutopilotWebSnapshot, mapAutopilotWebCandidate } from "@/services/autopilot-web-service";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("autopilot web supabase preview", () => {
  it("maps recommendation, blockers, warnings and complianceDecision for the admin web table", () => {
    const candidate = mapAutopilotWebCandidate({
      id: "candidate-1",
      title: "Serum calmante",
      category: "rostro",
      provider: "manual",
      review_status: "pending_admin_review",
      source_url: "https://example.com/serum",
      total_score: 82,
      risk_score: 28,
      scoring: {
        recommendation: "approve_candidate",
        warnings: ["stock_pending_verification"],
        blockers: ["missing_lab_report"],
        complianceDecision: { recommendation: "review" },
      },
    });

    expect(candidate.recommendation).toBe("approve_candidate");
    expect(candidate.complianceDecision).toBe("review");
    expect(candidate.blockers).toEqual(["missing_lab_report"]);
    expect(candidate.warnings).toEqual(["stock_pending_verification"]);
    expect(candidate.draftSafetyLabel).toBe("draft + needs_review");
  });

  it("returns a safe fallback when Supabase data is unavailable", async () => {
    const snapshot = await loadAutopilotWebSnapshot({} as never, {
      loadCandidates: async () => {
        throw new Error("db down");
      },
      loadRuns: async () => [],
    });

    expect(snapshot.connectionStatus).toBe("unavailable");
    expect(snapshot.message).toBe("Supabase Autopilot data unavailable in this environment");
    expect(snapshot.usesSupabaseData).toBe(false);
    expect(snapshot.candidates).toEqual([]);
    expect(snapshot.kbeautyPersistenceState).toBe("unavailable");
  });

  it("keeps the dashboard usable when K-beauty persistence is not applied yet", async () => {
    const snapshot = await loadAutopilotWebSnapshot({} as never, {
      loadCandidates: async () => [],
      loadRuns: async () => [],
    });

    expect(["applied", "not_applied_yet", "unavailable"]).toContain(snapshot.kbeautyPersistenceState);
    expect(snapshot.fallbackBrandNames.length).toBeGreaterThanOrEqual(3);
  });

  it("documents the admin route title and safe fallback message", () => {
    const layout = read("src/app/admin/autopilot/layout.tsx");
    const dashboard = read("src/app/admin/autopilot/page.tsx");
    const candidatesPage = read("src/app/admin/autopilot/candidates/page.tsx");
    const reviewPage = read("src/app/admin/autopilot/review/page.tsx");

    expect(layout).toContain("Victoriosa Autopilot");
    expect(dashboard).toContain("Supabase Autopilot data unavailable in this environment");
    expect(dashboard).toContain("Persistence not applied yet");
    expect(candidatesPage).toContain("Supabase Autopilot data unavailable in this environment");
    expect(reviewPage).toContain("Supabase Autopilot data unavailable in this environment");
  });
});
