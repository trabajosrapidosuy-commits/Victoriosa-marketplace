import { describe, expect, it } from "vitest";
import { isMarketplaceStorefrontProduct, mapPublicCatalogProduct } from "@/domain/public-catalog";

const publicProduct = {
  id: "product-id", title: "Producto visible", slug: "producto-visible", description: "Descripción", short_description: "Resumen",
  brand: "Marca", category: "Cuidado facial", subcategory: "Limpieza", tags: ["suave"], image_urls: ["https://images.example.test/fallback.jpg"],
  sale_price: 1200, currency: "USD", local_currency: "UYU", stock_status: "in_stock", fulfillment_type: "manual_resale",
  publication_status: "published", compliance_status: "approved", risk_level: "low",
};

describe("marketplace storefront contract", () => {
  it("prefers main_image_url when it exists", () => {
    expect(mapPublicCatalogProduct({ ...publicProduct, main_image_url: "https://images.example.test/main.jpg" }).mainImageUrl).toBe("https://images.example.test/main.jpg");
  });
  it("uses image_urls[0] when main_image_url is empty", () => {
    expect(mapPublicCatalogProduct({ ...publicProduct, main_image_url: "" }).mainImageUrl).toBe("https://images.example.test/fallback.jpg");
  });
  it("does not invent an image URL when both image sources are empty", () => {
    expect(mapPublicCatalogProduct({ ...publicProduct, main_image_url: null, image_urls: [] }).mainImageUrl).toBeUndefined();
  });
  it.each([
    ["draft", { publication_status: "draft" }],
    ["unapproved", { compliance_status: "needs_review" }],
    ["medium risk", { risk_level: "medium" }],
    ["out of stock", { stock_status: "out_of_stock" }],
    ["invalid price", { sale_price: 0 }],
    ["missing slug", { slug: "" }],
  ])("excludes %s products", (_label, patch) => expect(isMarketplaceStorefrontProduct({ ...publicProduct, ...patch })).toBe(false));
  it("does not leak internal fields", () => {
    const mapped = mapPublicCatalogProduct({ ...publicProduct, supplier_id: "supplier", source_url: "https://source.example", source_platform: "api", external_product_id: "external", external_sku: "sku", cost_price: 10, shipping_cost: 2, platform_fee_estimate: 1, target_margin_percent: 50, target_margin_amount: 5, review_notes: "private", created_by: "admin", approved_by: "admin", score: { internal: true }, ai_result: { internal: true } });
    for (const field of ["supplier_id", "source_url", "source_platform", "external_product_id", "external_sku", "cost_price", "shipping_cost", "platform_fee_estimate", "target_margin_percent", "target_margin_amount", "review_notes", "created_by", "approved_by", "score", "ai_result"]) expect(mapped).not.toHaveProperty(field);
  });
});
