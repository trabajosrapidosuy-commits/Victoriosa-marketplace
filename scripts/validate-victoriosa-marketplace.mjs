const required = [
  "supabase/migrations/20260531000100_victoriosa_marketplace_foundation.sql",
  "templates/victoriosa-products-import-template.csv",
  "docs/VICTORIOSA_DROPSHIPPING_MARKETPLACE_PLAN.md",
  "docs/VICTORIOSA_SUPPLIER_POLICY.md",
  "docs/VICTORIOSA_ADMIN_RUNBOOK.md"
];
const fs = await import("node:fs");
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) { console.error({ missing }); process.exit(1); }
console.log("Victoriosa marketplace validation PASS");
