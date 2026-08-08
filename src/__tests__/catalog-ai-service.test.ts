import { describe, expect, it } from "vitest";
import { buildSourceGroundedCatalogPrompt, catalogAiOutputSchema, fingerprintCatalogSource, getCatalogAiConfig, sourceSnapshot } from "@/services/catalog-ai-service";
import { TEST_CATALOG } from "@/lib/catalog/test-supplier";

const source = { id: "catalog-1", supplier_product_id: "supplier-1", original_title: TEST_CATALOG[0].title, original_description: TEST_CATALOG[0].description ?? null, brand: TEST_CATALOG[0].brand ?? null, category: TEST_CATALOG[0].category ?? null, image_urls: TEST_CATALOG[0].imageUrls ?? [], product_url: TEST_CATALOG[0].productUrl ?? null, normalized_category: null };
const output = { title: "Gel limpiador suave", description: "Limpieza facial de uso diario.", short_description: "Limpieza facial diaria.", category: "Limpieza facial", subcategory: "Gel", seo_title: "Gel limpiador suave", seo_description: "Limpieza facial diaria.", slug: "gel-limpiador-suave", quality_score: 80, recommendation: "REVIEW", reasons: ["La fuente no aporta ingredientes."] };

describe("catalog intelligence guards", () => {
  it("accepts the structured source-grounded output", () => expect(catalogAiOutputSchema.parse(output)).toMatchObject({ recommendation: "REVIEW" }));
  it("rejects invalid recommendation and extra fields", () => expect(() => catalogAiOutputSchema.parse({ ...output, recommendation: "AUTO_PUBLISH", price: 10 })).toThrow());
  it("uses deterministic source fingerprints", () => { expect(fingerprintCatalogSource(source)).toBe(fingerprintCatalogSource(source)); expect(fingerprintCatalogSource({ ...source, original_title: "Cambio" })).not.toBe(fingerprintCatalogSource(source)); });
  it("does not include cost or stock in source grounding", () => { const snapshot = sourceSnapshot(source); const prompt = buildSourceGroundedCatalogPrompt(snapshot); expect(snapshot).not.toHaveProperty("cost"); expect(snapshot).not.toHaveProperty("stock"); expect(prompt).toContain("Do not invent"); });
  it("fails closed for disabled, missing-model, and production configurations", () => {
    expect(getCatalogAiConfig({ CATALOG_AI_ENABLED: "false", NODE_ENV: "development", CATALOG_AI_MODEL: "x/y" }).enabled).toBe(false);
    expect(getCatalogAiConfig({ CATALOG_AI_ENABLED: "true", VERCEL_ENV: "production", CATALOG_AI_MODEL: "x/y" }).enabled).toBe(false);
    expect(getCatalogAiConfig({ CATALOG_AI_ENABLED: "true", NODE_ENV: "development", CATALOG_AI_MODEL: "" }).enabled).toBe(false);
    expect(getCatalogAiConfig({ CATALOG_AI_ENABLED: "true", NODE_ENV: "development", CATALOG_AI_MODEL: "x/y" }).enabled).toBe(true);
  });
});

describe("catalog sync and AI history boundary", () => {
  it("keeps supplier sync separate from selected AI output", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/services/catalog-sync-service.ts", "utf8"));
    expect(source).not.toContain("ai_result:");
    expect(source).not.toContain("ai_processed:");
  });

  it("preserves approved status when supplier data is refreshed", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/services/catalog-sync-service.ts", "utf8"));
    expect(source).toContain('select("id,status,approved")');
    expect(source).toContain('existing?.approved === true && existing.status === "approved"');
  });
});
