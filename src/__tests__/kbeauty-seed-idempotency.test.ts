import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const seed = fs.readFileSync(
  path.join(process.cwd(), "scripts", "seed-autopilot-kbeauty-candidates.mjs"),
  "utf8",
);

describe("K-beauty review-only seed idempotency", () => {
  it("does not rely on PostgREST conflict inference for the partial candidate index", () => {
    expect(seed).not.toContain('onConflict: "provider,external_id"');
    expect(seed).toContain('.eq("provider", payload.provider)');
    expect(seed).toContain('.eq("external_id", payload.external_id)');
    expect(seed).toContain('update(payload).eq("id", existing.id)');
  });

  it("only completes a research run after every review-only write succeeds", () => {
    expect(seed).toContain('status: "running"');
    expect(seed).toContain('updateResearchRunStatus(supabase, runId, "completed")');
    expect(seed).toContain('updateResearchRunStatus(supabase, runId, "failed")');
  });
});
