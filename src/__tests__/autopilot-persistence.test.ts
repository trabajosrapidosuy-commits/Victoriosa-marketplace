import { describe, expect, it } from "vitest";
import { approvePersistentCandidate, importPersistentCandidateToDraft } from "@/services/autopilot-persistence-service";

function createSupabaseStub() {
  const calls: Array<{ method: string; table: string; payload?: unknown; filter?: unknown }> = [];
  let lastTable = "";
  let lastAction = "";
  let returnedData: unknown = null;

  const chain: any = {
    select(selection?: string) {
      lastAction = "select";
      calls.push({ method: "select", table: lastTable, payload: selection });
      return chain;
    },
    match(filter: unknown) {
      lastAction = "match";
      calls.push({ method: "match", table: lastTable, filter });
      return chain;
    },
    eq(column: string, value: unknown) {
      lastAction = "eq";
      calls.push({ method: "eq", table: lastTable, filter: { column, value } });
      return chain;
    },
    insert(payload: unknown) {
      lastAction = "insert";
      calls.push({ method: "insert", table: lastTable, payload });
      return chain;
    },
    update(payload: unknown) {
      lastAction = "update";
      calls.push({ method: "update", table: lastTable, payload });
      return chain;
    },
    single() {
      const action = calls[calls.length - 1]?.method;
      if (action === "insert" && lastTable === "marketplace_products") {
        return Promise.resolve({ data: returnedData ?? { id: "generated-product-id", publication_status: "draft" }, error: null });
      }
      return Promise.resolve({ data: returnedData, error: null });
    },
  };

  return {
    calls,
    client: {
      from(table: string) {
        lastTable = table;
        calls.push({ method: "from", table });
        return chain;
      },
    },
    setReturn(data: unknown) {
      returnedData = data;
    },
  };
}

describe("autopilot persistence service", () => {
  it("rejects approval for blocked candidates", async () => {
    const { client, setReturn } = createSupabaseStub();
    setReturn({
      id: "6a7b5aa0-23f5-4be8-abc1-1234567890ab",
      review_status: "blocked_no_publish",
      risk_flags: ["blocked_commercial_risk"],
    });
    await expect(approvePersistentCandidate(client as never, "6a7b5aa0-23f5-4be8-abc1-1234567890ab")).rejects.toThrow("Blocked candidates cannot be approved for draft import");
    expect(client.from).toBeDefined();
  });

  it("imports approved candidates as draft products without auto-publishing", async () => {
    const { client, setReturn, calls } = createSupabaseStub();
    setReturn({
      id: "4b68b9ed-0f45-4495-91dc-37a8d44c1954",
      connector_id: "manual",
      supplier_name: "Manual Supplier",
      title: "Set de belleza",
      description: "Descripción de prueba",
      category: "Beauty",
      source_url: "https://example.invalid/product",
      image_urls: ["https://example.invalid/img.jpg"],
      supplier_cost: 10,
      estimated_shipping_cost: 5,
      suggested_price: 35,
      margin_percent: 64,
      currency: "USD",
      risk_flags: [],
      review_status: "approved_for_draft",
      raw_payload: {},
    });

    const product = await importPersistentCandidateToDraft(client as never, "4b68b9ed-0f45-4495-91dc-37a8d44c1954", "admin-user");
    expect(product).toBeDefined();
    expect(product).toHaveProperty("id", "4b68b9ed-0f45-4495-91dc-37a8d44c1954");
    expect(calls.some((call) => call.table === "marketplace_products" && call.method === "insert")).toBe(true);
    expect(calls.some((call) => call.table === "autopilot_product_candidates" && call.method === "update")).toBe(true);
  });

  it("protects Autopilot internal tables with strict admin-only RLS policies", async () => {
    const fs = await import("node:fs/promises");
    const migration = await fs.readFile("supabase/migrations/20260601000100_victoriosa_autopilot_foundation.sql", "utf8");
    expect(migration).toContain("create policy \"autopilot candidates admin all\"");
    expect(migration).toContain("create policy \"autopilot discovery runs admin all\"");
    expect(migration).toContain("create policy \"autopilot connectors admin all\"");
  });
});
