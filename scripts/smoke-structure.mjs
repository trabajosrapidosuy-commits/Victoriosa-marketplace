import fs from "node:fs";
const required = ["src/app/page.tsx", "src/app/productos/page.tsx", "src/app/admin/marketplace/page.tsx", "src/services/pricing-service.ts", "src/services/compliance-service.ts"];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) { console.error("Missing files", missing); process.exit(1); }
console.log("smoke:structure PASS");
