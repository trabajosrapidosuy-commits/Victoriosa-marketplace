import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') { current += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { result.push(current); current = ""; }
    else current += char;
  }
  result.push(current);
  return result;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, splitCsvLine(line)[index] ?? ""])));
}

const args = parseArgs(process.argv.slice(2));
if (!args.file) {
  console.error("Usage: npm run marketplace:import -- --file ./imports/products.csv --supplier \"AliExpress Manual\" --source aliexpress");
  process.exit(1);
}

const fullPath = path.resolve(args.file);
const text = fs.readFileSync(fullPath, "utf8");
const rows = fullPath.endsWith(".json") ? JSON.parse(text) : parseCsv(text);
const report = {
  source: args.source ?? "csv",
  supplier: args.supplier ?? "Manual",
  totalRows: rows.length,
  createdAs: "needs_review",
  autoPublished: false,
  warnings: ["No product was published automatically", "Persist this report to Supabase import batches when env is configured"],
  preview: rows.slice(0, 5)
};
console.log(JSON.stringify(report, null, 2));
