import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Victoriosa premium zen reference polish", () => {
  it("keeps Sofia Victoria as the hero identity and approved asset flow", () => {
    const home = read("src/app/page.tsx");
    const heroAsset = read("src/lib/brand/sofia-hero.ts");
    expect(home).toContain("Sofía Victoria");
    expect(heroAsset).toContain("/brand/sofia-victoria-hero.jpg");
    expect(heroAsset).toContain("/victoriosa-hero-editorial.png");
    expect(home).not.toContain("modelo genérica");
    expect(home).not.toContain("stock");
  });

  it("implements the premium reference copy and corrected tags", () => {
    const home = read("src/app/page.tsx");
    expect(home).toContain("Rituales de Belleza Consciente");
    expect(home).toContain("Agendar evaluación");
    expect(home).toContain("Rituales faciales");
    expect(home).toContain("Rituales corporales");
    expect(home).toContain("Asesoría personalizada");
    expect(home).toContain("Belleza limpia");
  });

  it("ships the glassmorphism header with centered Victoriosa branding", () => {
    const header = read("src/components/SiteHeaderClient.tsx");
    const styles = read("src/app/globals.css");
    expect(header).toContain("ASESORÍA");
    expect(header).toContain("BELLEZA EN CALMA");
    expect(header).toContain("Carrito");
    expect(styles).toContain("site-header-shell");
    expect(styles).toContain("backdrop-filter: blur(18px)");
    expect(styles).toContain("brand-wordmark");
  });
});
