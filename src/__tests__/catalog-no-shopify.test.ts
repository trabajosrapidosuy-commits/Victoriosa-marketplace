import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("catalog runtime is Shopify-free", () => {
  it("does not expose Shopify as a feed or UI option", () => {
    expect(read("src/lib/catalog/types.ts")).not.toContain("shopify");
    expect(read("src/app/admin/marketplace/catalog/actions.ts")).not.toContain("shopify");
    expect(read("src/app/admin/marketplace/catalog/page.tsx")).not.toContain("Shopify");
  });
  it("does not declare Shopify credentials or publishing responses", () => {
    expect(read(".env.example")).not.toContain("SHOPIFY_");
    expect(read("src/app/api/catalog/sync/route.ts")).not.toContain("shopify");
  });
});
