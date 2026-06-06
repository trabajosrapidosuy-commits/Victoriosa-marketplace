import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("kbeauty staging auth gate", () => {
  it("keeps local migration review-only with no official representation path", () => {
    const migration = read("supabase/migrations/20260605000100_victoriosa_kbeauty_research_review_only.sql");

    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on public.autopilot_brand_candidates from anon;");
    expect(migration).toContain("revoke all on public.autopilot_supplier_contacts from anon;");
    expect(migration).toContain("revoke all on public.autopilot_import_requirements from anon;");
    expect(migration).toContain("check (research_status in ('pending_admin_review', 'needs_review', 'needs_supplier_validation', 'rejected'))");
    expect(migration).toContain("check (representation_status in ('not_official'))");
    expect(migration).not.toContain("'authorized'");
    expect(migration).not.toContain("'published'");
  });

  it("requires explicit staging authorization before write readiness or seed write", () => {
    const readiness = read("scripts/check-kbeauty-persistence-readiness.mjs");
    const seed = read("scripts/seed-autopilot-kbeauty-candidates.mjs");

    expect(readiness).toContain("AUTHORIZED_STAGING_TARGET");
    expect(readiness).toContain("AUTHORIZED_STAGING_TARGET=true is required before any write readiness check.");
    expect(seed).toContain("AUTHORIZED_STAGING_TARGET");
    expect(seed).toContain("Refusing to write because AUTHORIZED_STAGING_TARGET=true is required for this phase.");
  });
});
