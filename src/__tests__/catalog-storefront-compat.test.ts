import { describe, expect, it } from "vitest";
import { isCatalogStorefrontProduct, mapCatalogStorefrontProduct } from "@/domain/public-catalog";

const published = {
  id: "catalog-1", title: "Producto comercial", description: "Descripción", short_description: "Resumen",
  category: "Cuidado facial", price: 1200, currency: "UYU", stock: 4, images: ["https://images.example.test/product.jpg"],
  slug: "producto-comercial", status: "approved", approved: true,
};

describe("catalog storefront compatibility", () => {
  it("maps only approved, in-stock catalog products", () => {
    expect(isCatalogStorefrontProduct(published)).toBe(true);
    expect(mapCatalogStorefrontProduct(published)).toMatchObject({ id: "catalog-1", salePrice: 1200, stockStatus: "in_stock" });
  });
  it("keeps unapproved or unavailable catalog products out of the storefront", () => {
    expect(isCatalogStorefrontProduct({ ...published, approved: false })).toBe(false);
    expect(isCatalogStorefrontProduct({ ...published, stock: 0 })).toBe(false);
    expect(() => mapCatalogStorefrontProduct({ ...published, status: "review" })).toThrow("not eligible");
  });
});
