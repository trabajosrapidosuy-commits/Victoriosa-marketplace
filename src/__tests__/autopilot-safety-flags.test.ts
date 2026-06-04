import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AUTOPILOT_FLAGS, AUTOPILOT_MODE_FLAGS } from "@/lib/autopilot/config";
import { createDraftProductRow } from "@/lib/autopilot/core/import-draft";
import { listAutopilotConnectors } from "@/services/autopilot-service";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("autopilot safety flags", () => {
  it("keeps automatic publication, live providers and real fulfillment disabled by default", () => {
    expect(AUTOPILOT_FLAGS.autoPublishEnabled).toBe(false);
    expect(AUTOPILOT_FLAGS.liveConnectorsEnabled).toBe(false);
    expect(AUTOPILOT_FLAGS.realFulfillmentEnabled).toBe(false);
    expect(AUTOPILOT_MODE_FLAGS.autoPublish).toBe("OFF");
    expect(AUTOPILOT_MODE_FLAGS.liveProviders).toBe("OFF");
    expect(AUTOPILOT_MODE_FLAGS.humanReview).toBe("ON");
  });

  it("never exposes real provider execution while live connectors are disabled", () => {
    const externalConnectors = listAutopilotConnectors().filter((connector) => connector.type === "api");
    expect(externalConnectors.length).toBeGreaterThan(0);
    expect(externalConnectors.every((connector) => connector.status === "disabled" || connector.status === "needs_credentials")).toBe(true);
    expect(externalConnectors.some((connector) => connector.status === "enabled")).toBe(false);
  });

  it("keeps draft imports in draft and needs_review with non-low risk", () => {
    const row = createDraftProductRow({ title: "Draft", risk_flags: [], image_urls: [] }, "user-id");
    expect(row.publication_status).toBe("draft");
    expect(row.compliance_status).toBe("needs_review");
    expect(row.risk_level).not.toBe("low");
  });

  it("does not use service role keys in client-side Autopilot surface files", () => {
    const files = [
      "src/components/autopilot/AutopilotSafetyBanner.tsx",
      "src/app/admin/autopilot/page.tsx",
      "src/app/admin/autopilot/security/page.tsx",
      "src/app/admin/autopilot/settings/page.tsx",
      "src/services/autopilot-service.ts",
    ];
    for (const file of files) {
      const content = read(file);
      expect(content).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(content).not.toContain("service_role");
    }
  });
});
