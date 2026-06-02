import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EMPTY_CATALOG_MESSAGE, mapPublicCatalogProduct } from "@/domain/public-catalog";

const root = process.cwd();
const publicFiles = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/productos/page.tsx",
  "src/app/productos/[slug]/page.tsx",
  "src/components/ProductCard.tsx",
];
const legacyRedirectFiles = [
  "src/app/products/page.tsx",
  "src/app/products/[id]/page.tsx",
  "src/app/cart/page.tsx",
  "src/app/orders/[id]/page.tsx",
  "src/app/thank-you/page.tsx",
];

describe("public storefront safety", () => {
  it("does not render admin links or internal review labels", () => {
    const source = publicFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
    expect(source).not.toContain("/admin/");
    expect(source).not.toContain("needs_review");
    expect(source).not.toContain("Riesgo interno");
    expect(source).not.toContain("Compliance:");
    expect(source).not.toContain("Productos destacados demo");
  });

  it("provides a professional empty catalog message", () => {
    expect(EMPTY_CATALOG_MESSAGE).toContain("seleccion curada");
    expect(EMPTY_CATALOG_MESSAGE).toContain("Pronto");
  });

  it("maps only public presentation fields", () => {
    const product = mapPublicCatalogProduct({
      id: "public-product",
      title: "Producto visible",
      slug: "producto-visible",
      description: "Descripcion",
      short_description: "Resumen",
      category: "Cuidado facial",
      sale_price: 1200,
      currency: "UYU",
      local_currency: "UYU",
      publication_status: "draft",
      compliance_status: "needs_review",
      risk_level: "blocked",
      review_notes: "internal",
      cost_price: 1,
    });
    expect(product).not.toHaveProperty("publication_status");
    expect(product).not.toHaveProperty("compliance_status");
    expect(product).not.toHaveProperty("risk_level");
    expect(product).not.toHaveProperty("review_notes");
    expect(product).not.toHaveProperty("cost_price");
  });

  it("redirects legacy storefront routes and protects the admin tree", () => {
    const legacySource = legacyRedirectFiles
      .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
      .join("\n");
    const adminLayout = fs.readFileSync(path.join(root, "src/app/admin/layout.tsx"), "utf8");
    expect(legacySource).not.toContain("margin_percentage");
    expect(legacySource).not.toContain("/api/orders");
    expect(legacySource).toContain('redirect("/productos")');
    expect(legacySource).toContain('redirect("/carrito")');
    expect(adminLayout).toContain("await requireAdmin()");
  });
});
