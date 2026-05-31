import { victoriosaSeedProducts } from "../data/victoriosaSeedProducts.js";
console.log(JSON.stringify({ products: victoriosaSeedProducts.length, publicationStatus: "draft", complianceStatus: "needs_review_or_draft" }, null, 2));
