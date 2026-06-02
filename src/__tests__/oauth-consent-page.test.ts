import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("OAuth consent information page", () => {
  it("exists without activating the public Google OAuth route", () => {
    const root = process.cwd();
    const consentPage = fs.readFileSync(path.join(root, "src/app/oauth/consent/page.tsx"), "utf8");
    expect(consentPage).toContain("Consentimiento de acceso");
    expect(consentPage).toContain("permanece inactivo");
    expect(fs.existsSync(path.join(root, "src/app/auth/oauth/google/route.ts"))).toBe(false);
  });
});
