import { describe, expect, it } from "vitest";
import { importProductsFromRows, parseCsv } from "@/services/import-service";

describe("import-service", () => {
  it("imports CSV rows as needs_review", () => {
    const rows = parseCsv("title,category,cost_price,shipping_cost,target_margin_percent\nSerum demo,Cuidado facial,10,3,55");
    const report = importProductsFromRows(rows);
    expect(report.created).toBe(1);
    expect(report.rows[0].status).toBe("needs_review");
    expect(report.rows[0].product?.publicationStatus).toBe("draft");
  });
});
