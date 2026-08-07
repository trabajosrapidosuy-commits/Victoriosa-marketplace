import { describe, expect, it } from "vitest";
import { normalizeExternalProduct } from "@/lib/catalog/normalize";
import { DEFAULT_MARGIN_RULES, TEST_CATALOG } from "@/lib/catalog/test-supplier";

describe("external catalog normalization", () => {
  it("calculates a source-grounded price and score", () => {
    const result = normalizeExternalProduct(TEST_CATALOG[0], DEFAULT_MARGIN_RULES);
    expect(result.price).toBe(10.8);
    expect(result.score.decision).toBe("PUBLISH");
    expect(result.aiResult.status).toBe("disabled");
  });
  it("rejects unavailable products", () => {
    expect(normalizeExternalProduct(TEST_CATALOG[3], DEFAULT_MARGIN_RULES).score.decision).toBe("REJECT");
  });
});
