import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("manual commerce flow", () => {
  it("creates orders from server-validated product ids instead of browser prices", () => {
    const source = read("src/services/manual-commerce-service.ts");
    expect(source).toContain("manualOrderSchema");
    expect(source).toContain(".match(PUBLIC_PRODUCT_FILTER)");
    expect(source).toContain("sale_price_snapshot");
    expect(source).not.toContain("input.items.reduce");
  });
  it("limits customer order reads to the signed-in user", () => {
    const source = read("src/services/manual-commerce-service.ts");
    expect(source).toContain('.eq("buyer_user_id", userId)');
    expect(source).toContain('.eq("id", orderId).eq("buyer_user_id", userId)');
  });
  it("persists consultations through a server action", () => {
    const source = read("src/app/evaluacion-online/actions.ts");
    expect(source).toContain("consultationSchema");
    expect(source).toContain('.from("beauty_consultations").insert');
  });
  it("keeps checkout and order tracking free of payment and supplier actions", () => {
    expect(read("src/app/checkout/page.tsx")).toContain("pagos online siguen deshabilitados");
    expect(read("src/app/account/orders/[id]/page.tsx")).toContain("No se ejecutó pago, compra a proveedor ni envío automático");
  });
});
