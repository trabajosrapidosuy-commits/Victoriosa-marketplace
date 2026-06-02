import { describe, expect, it } from "vitest";
import { legacyApiDeprecated } from "@/lib/api/deprecated";

describe("legacy API deprecation", () => {
  it("returns an explicit replacement instead of using legacy tables", async () => {
    const response = legacyApiDeprecated("/api/marketplace/products");
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      error: "LEGACY_API_DEPRECATED",
      replacement: "/api/marketplace/products",
    });
  });
});
