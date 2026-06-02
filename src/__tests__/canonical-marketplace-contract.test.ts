import { describe, expect, it } from "vitest";
import {
  createMarketplaceProductSchema,
  PUBLIC_PRODUCT_FILTER,
  updateMarketplaceProductSchema,
} from "@/domain/marketplace-contract";

const validProduct = {
  title: "Serum facial responsable",
  slug: "serum-facial-responsable",
  category: "Cuidado facial",
  cost_price: 10,
};

describe("canonical marketplace contract", () => {
  it("restricts public reads to approved low-risk published products", () => {
    expect(PUBLIC_PRODUCT_FILTER).toEqual({
      publication_status: "published",
      compliance_status: "approved",
      risk_level: "low",
    });
  });

  it("forces newly created products into human review", () => {
    const product = createMarketplaceProductSchema.parse(validProduct);
    expect(product.publication_status).toBe("draft");
    expect(product.compliance_status).toBe("needs_review");
    expect(product.risk_level).toBe("medium");
  });

  it("does not expose published as a direct admin patch value", () => {
    expect(() => updateMarketplaceProductSchema.parse({
      id: "1d931953-b2b7-48e6-9c78-6fcecd760fd9",
      publication_status: "published",
    })).toThrow();
  });
});
