import { describe, expect, it } from "vitest";
import { persistentImportSchema } from "@/domain/marketplace-contract";
import { persistMarketplaceImport } from "@/repositories/marketplace-import-repository";

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {};
  let sequence = 0;
  function rows(table: string) {
    tables[table] ??= [];
    return tables[table];
  }
  function from(table: string) {
    let mode: "select" | "insert" | "update" = "select";
    let payload: Record<string, unknown> | Record<string, unknown>[] | undefined;
    const filters: [string, unknown][] = [];
    const matching = () => rows(table).filter((row) => filters.every(([field, value]) => row[field] === value));
    const execute = () => {
      if (mode === "update" && payload && !Array.isArray(payload)) matching().forEach((row) => Object.assign(row, payload));
      return { data: matching(), error: null };
    };
    const builder = {
      select() { return builder; },
      insert(value: Record<string, unknown> | Record<string, unknown>[]) { mode = "insert"; payload = value; return builder; },
      update(value: Record<string, unknown>) { mode = "update"; payload = value; return builder; },
      eq(field: string, value: unknown) { filters.push([field, value]); return builder; },
      order() { return builder; },
      limit() { return Promise.resolve(execute()); },
      maybeSingle() { return Promise.resolve({ data: matching()[0] ?? null, error: null }); },
      single() {
        if (mode === "insert" && payload) {
          const value = Array.isArray(payload) ? payload[0] : payload;
          const inserted = { id: `id-${++sequence}`, ...value };
          rows(table).push(inserted);
          return Promise.resolve({ data: inserted, error: null });
        }
        return Promise.resolve({ data: matching()[0] ?? null, error: null });
      },
      then(resolve: (value: { data: Record<string, unknown>[]; error: null }) => void) {
        return Promise.resolve(execute()).then(resolve);
      },
    };
    return builder;
  }
  return { client: { from }, tables };
}

const externalRow = {
  title: "Serum controlado importable",
  category: "Cuidado facial",
  source_url: "https://example.invalid/serum-controlado",
  external_product_id: "external-001",
  cost_price: 10,
  shipping_cost: 2,
  target_margin_percent: 55,
  publication_status: "published",
  compliance_status: "approved",
  risk_level: "low",
};

describe("persistent marketplace import", () => {
  it("creates auditable review-only drafts and deduplicates repeated rows", async () => {
    const { client, tables } = createMemorySupabase();
    const report = await persistMarketplaceImport(client as never, "admin-user", {
      sourceType: "manual",
      supplier: { name: "Proveedor controlado", type: "manual" },
      rows: [externalRow, externalRow],
    });

    expect(report).toMatchObject({
      totalRows: 2,
      created: 1,
      duplicates: 1,
      rejected: 0,
      reviewQueueCreated: 1,
      automaticPublication: false,
    });
    expect(tables.marketplace_product_import_batches).toHaveLength(1);
    expect(tables.marketplace_product_import_rows).toHaveLength(2);
    expect(tables.marketplace_reviews_queue).toHaveLength(1);
    expect(tables.marketplace_products).toHaveLength(1);
    expect(tables.marketplace_products[0]).toMatchObject({
      publication_status: "draft",
      compliance_status: "needs_review",
      risk_level: "medium",
    });
  });

  it("keeps unsafe external fields only as raw audit input", () => {
    const parsed = persistentImportSchema.parse({
      supplier: { name: "Proveedor controlado", type: "manual" },
      rows: [externalRow],
    });
    expect(parsed.rows[0]).toMatchObject({ publication_status: "published" });
    expect(parsed).not.toHaveProperty("automaticPublication");
  });
});
