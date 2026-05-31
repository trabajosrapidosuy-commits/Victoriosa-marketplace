import fs from "node:fs";
import path from "node:path";
const forbidden = [/service_role[_-]?[a-z0-9]{10,}/i, /sk-[A-Za-z0-9]{20,}/, /ghp_[A-Za-z0-9]{20,}/, /SUPABASE_SERVICE_ROLE_KEY=\S+/];
const ignore = new Set(["node_modules", ".git", ".next"]);
const hits = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    // Skip scanning this scanner script itself to avoid false positives
    if (full === path.join(process.cwd(), 'scripts', 'secret-scan.mjs')) continue;
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|mjs|json|md|env|sql|csv)$/i.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      forbidden.forEach((regex) => { if (regex.test(text)) hits.push(full); });
    }
  }
}
walk(process.cwd());
if (hits.length) { console.error("Potential secrets found", hits); process.exit(1); }
console.log("secret:scan PASS");
