import { describe, expect, it } from "vitest";
import { canPublishProduct } from "@/services/compliance-service";
import { getFeaturedProducts } from "@/services/marketplace-product-service";

describe("publication safety", () => {
  it("does not publish imported drafts automatically", () => {
    const product = getFeaturedProducts(1)[0];
    expect(product.publicationStatus).toBe("draft");
    expect(canPublishProduct(product)).toBe(false);
  });
});
