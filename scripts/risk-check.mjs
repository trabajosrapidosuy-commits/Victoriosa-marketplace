import { victoriosaSeedProducts } from "../data/victoriosaSeedProducts.js";
const highRisk = victoriosaSeedProducts.filter((p) => p.risk_level === "high");
console.log(JSON.stringify({ total: victoriosaSeedProducts.length, highRisk: highRisk.length, rule: "High risk products must remain draft/needs_review" }, null, 2));
