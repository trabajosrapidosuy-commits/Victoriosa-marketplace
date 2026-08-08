import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { publishMarketplaceProduct } from "@/repositories/marketplace-repository";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

function productStub(product: Record<string, unknown>) {
  const updates: Record<string, unknown>[] = [];
  const chain = {
    select() { return chain; }, eq() { return chain; }, single() { return Promise.resolve({ data: product, error: null }); },
    update(value: Record<string, unknown>) { updates.push(value); return chain; },
  };
  return { client: { from: () => chain }, updates };
}

describe("canonical marketplace API boundary", () => {
  it("routes legacy admin pages to canonical marketplace surfaces", () => {
    expect(read("src/app/admin/products/page.tsx")).toContain('redirect("/admin/marketplace/products")');
    expect(read("src/app/admin/pricing/page.tsx")).toContain('redirect("/admin/marketplace/products")');
    expect(read("src/app/admin/orders/page.tsx")).toContain('redirect("/admin/marketplace/orders")');
    expect(read("src/app/admin/imports/page.tsx")).toContain('redirect("/admin/marketplace/products/import")');
  });
  it("guards canonical admin APIs with requireAdmin", () => {
    for (const file of ["src/app/api/admin/marketplace/products/route.ts", "src/app/api/admin/marketplace/products/[id]/route.ts", "src/app/api/admin/marketplace/suppliers/route.ts", "src/app/api/admin/marketplace/reviews/route.ts", "src/app/api/admin/marketplace/orders/route.ts"]) {
      expect(read(file)).toContain("requireAdmin");
    }
  });
  it("refuses publication unless all publication gates pass", async () => {
    const { client, updates } = productStub({ id: "1d931953-b2b7-48e6-9c78-6fcecd760fd9", title: "Draft", slug: "draft", category: "Care", sale_price: 10, compliance_status: "needs_review", risk_level: "medium" });
    await expect(publishMarketplaceProduct(client as never, { id: "1d931953-b2b7-48e6-9c78-6fcecd760fd9" })).rejects.toThrow("publication gates");
    expect(updates).toHaveLength(0);
  });
  it("allows only approved low-risk products with required commerce fields", async () => {
    const { client, updates } = productStub({ id: "1d931953-b2b7-48e6-9c78-6fcecd760fd9", title: "Ready", slug: "ready", category: "Care", sale_price: 10, compliance_status: "approved", risk_level: "low" });
    await publishMarketplaceProduct(client as never, { id: "1d931953-b2b7-48e6-9c78-6fcecd760fd9" });
    expect(updates[0]).toMatchObject({ publication_status: "published" });
  });
});
