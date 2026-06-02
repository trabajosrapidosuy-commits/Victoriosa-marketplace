import { describe, expect, it } from "vitest";
import { createDraftProduct, listPublicProducts } from "@/repositories/marketplace-repository";

function createSupabaseStub() {
  const calls: { table?: string; match?: unknown; insert?: unknown } = {};
  const chain = {
    select() { return chain; },
    match(filter: unknown) { calls.match = filter; return chain; },
    order() { return Promise.resolve({ data: [], error: null }); },
    insert(payload: unknown) { calls.insert = payload; return chain; },
    single() { return Promise.resolve({ data: calls.insert, error: null }); },
  };
  return {
    calls,
    client: {
      from(table: string) {
        calls.table = table;
        return chain;
      },
    },
  };
}

describe("marketplace repository", () => {
  it("queries only safe public products", async () => {
    const { calls, client } = createSupabaseStub();
    await listPublicProducts(client as never);
    expect(calls.table).toBe("marketplace_products");
    expect(calls.match).toEqual({
      publication_status: "published",
      compliance_status: "approved",
      risk_level: "low",
    });
  });

  it("persists new admin products as review-only drafts", async () => {
    const { calls, client } = createSupabaseStub();
    await createDraftProduct(client as never, {
      title: "Kit cuidado facial",
      slug: "kit-cuidado-facial",
      category: "Kits Victoriosa",
      cost_price: 15,
    });
    expect(calls.table).toBe("marketplace_products");
    expect(calls.insert).toMatchObject({
      publication_status: "draft",
      compliance_status: "needs_review",
      risk_level: "medium",
    });
  });
});
