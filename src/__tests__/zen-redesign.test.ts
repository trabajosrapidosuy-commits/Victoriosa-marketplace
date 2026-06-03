import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Victoriosa zen visual redesign", () => {
  it("keeps Sofia Victoria as the hero identity and uses the approved local asset", () => {
    const home = read("src/app/page.tsx");
    expect(home).toContain("Sofia Victoria");
    expect(home).toContain("/victoriosa-hero-editorial.png");
    expect(home).not.toContain("stock");
    expect(home).not.toContain("modelo generica");
  });

  it("adds zen premium trust and guidance sections without medical claims", () => {
    const home = read("src/app/page.tsx");
    expect(home).toContain("RITUALES DE BELLEZA CONSCIENTE");
    expect(home).toContain("Seleccion curada");
    expect(home).toContain("Asesoria personalizada");
    expect(home).toContain("Experiencia profesional");
    expect(home).toContain("Sin promesas medicas");
    expect(home).not.toMatch(/\bcura\b/i);
    expect(home).not.toContain("resultado garantizado");
  });

  it("keeps the public header free of admin links", () => {
    const header = read("src/components/SiteHeader.tsx");
    expect(header).not.toContain('href="/admin"');
    expect(header).toContain("BELLEZA EN CALMA");
  });
});
