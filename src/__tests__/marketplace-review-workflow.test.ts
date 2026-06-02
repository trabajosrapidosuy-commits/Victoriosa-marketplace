import { describe, expect, it } from "vitest";
import { updateReview } from "@/repositories/marketplace-repository";

function createReviewSupabaseStub() {
  const updates: Record<string, Record<string, unknown>> = {};
  function from(table: string) {
    let mode: "select" | "update" = "select";
    let payload: Record<string, unknown> = {};
    const builder = {
      select() { return builder; },
      update(value: Record<string, unknown>) { mode = "update"; payload = value; updates[table] = value; return builder; },
      eq() { return builder; },
      single() {
        if (table === "marketplace_reviews_queue" && mode === "select") {
          return Promise.resolve({ data: { product_id: "product-id" }, error: null });
        }
        return Promise.resolve({ data: payload, error: null });
      },
      then(resolve: (value: { error: null }) => void) {
        return Promise.resolve({ error: null }).then(resolve);
      },
    };
    return builder;
  }
  return { client: { from }, updates };
}

describe("marketplace review workflow", () => {
  it("approves compliance while keeping publication as draft", async () => {
    const { client, updates } = createReviewSupabaseStub();
    await updateReview(client as never, {
      id: "1d931953-b2b7-48e6-9c78-6fcecd760fd9",
      status: "approved",
      notes: "Reviewed by admin",
    });
    expect(updates.marketplace_products).toEqual({
      compliance_status: "approved",
      publication_status: "draft",
    });
    expect(updates.marketplace_reviews_queue).toMatchObject({ status: "approved" });
  });
});
