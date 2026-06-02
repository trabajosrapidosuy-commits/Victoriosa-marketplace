import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("public legal pages", () => {
  it("publishes privacy and terms pages without live-commerce claims", () => {
    const root = process.cwd();
    const privacy = fs.readFileSync(path.join(root, "src/app/privacy/page.tsx"), "utf8");
    const terms = fs.readFileSync(path.join(root, "src/app/terms/page.tsx"), "utf8");
    expect(privacy).toContain("Politica de privacidad");
    expect(terms).toContain("Terminos de uso");
    expect(`${privacy} ${terms}`).toContain("deshabilitados");
    expect(`${privacy} ${terms}`).toContain("sin controles aprobados");
  });
});
