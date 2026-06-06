import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const cli = parseArgs(process.argv.slice(2));
const env = { ...loadLocalEnv(), ...process.env };
const target = cli.target ?? "staging";
const mode = cli.write ? "write" : "dry-run";
const productionStatus = readProductionStatus();
const requiredTables = [
  "autopilot_discovery_runs",
  "autopilot_product_candidates",
  "autopilot_review_events",
  "autopilot_research_runs",
  "autopilot_brand_candidates",
  "autopilot_supplier_contacts",
  "autopilot_import_requirements",
];

const summary = {
  mode,
  target,
  productionStatus,
  envStatus: {
    SUPABASE_URL: env.SUPABASE_URL ? "SET" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
  },
  noAutoPublish: true,
  allowedStatuses: [
    "pending_admin_review",
    "needs_review",
    "needs_supplier_validation",
    "not_official",
  ],
};

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log(JSON.stringify({
    ...summary,
    readiness: "PARTIAL",
    tableStatus: Object.fromEntries(requiredTables.map((table) => [table, "UNKNOWN_NO_SERVER_CREDENTIALS"])),
    issues: mode === "write" ? ["Missing server-side credentials for write mode."] : [],
  }, null, 2));
  process.exit(mode === "write" ? 1 : 0);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tableStatus = {};
for (const table of requiredTables) {
  const { error } = await supabase.from(table).select("id").limit(1);
  tableStatus[table] = error ? "MISSING_OR_INACCESSIBLE" : "READY";
}

const issues = [];
if (productionStatus !== "NO-GO_PRODUCTION") issues.push("Production status is not NO-GO_PRODUCTION.");
if (target !== "staging") issues.push("Target must remain staging in this phase.");
if (mode === "write" && Object.values(tableStatus).some((state) => state !== "READY")) {
  issues.push("Required persistence tables are not fully ready for write mode.");
}

console.log(JSON.stringify({
  ...summary,
  readiness: issues.length === 0 ? "READY" : "BLOCKED",
  tableStatus,
  issues,
}, null, 2));

if (issues.length > 0) process.exit(1);

function parseArgs(args) {
  return {
    write: args.includes("--write"),
    target: args.find((arg) => arg.startsWith("--target="))?.slice("--target=".length),
  };
}

function loadLocalEnv() {
  const files = [".env", ".env.local"];
  const loaded = {};
  for (const file of files) {
    const absolute = path.join(process.cwd(), file);
    if (!fs.existsSync(absolute)) continue;
    const content = fs.readFileSync(absolute, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      loaded[key] = value;
    }
  }
  return loaded;
}

function readProductionStatus() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "docs", "victoriosa-director-status.json"), "utf8");
    return JSON.parse(raw).productionStatus ?? "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}
