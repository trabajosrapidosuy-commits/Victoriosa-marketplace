import fs from "node:fs";
import path from "node:path";

const ignored = new Set([".git", ".next", "node_modules", "credenciales"]);
const forbidden = [/\bvercel\s+--prod\b/i, /\bvercel\s+promote\b/i];
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (!full.endsWith(path.join("scripts", "guard-no-production-deploy.mjs"))) {
      const text = fs.readFileSync(full, "utf8");
      if (forbidden.some((pattern) => pattern.test(text))) hits.push(full);
    }
  }
}

walk(process.cwd());

if (hits.length) {
  console.error("guard:no-production-deploy FAIL", hits);
  process.exit(1);
}

console.log("guard:no-production-deploy PASS");
