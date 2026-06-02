import fs from "node:fs";

const migration = fs
  .readdirSync("supabase/migrations")
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => fs.readFileSync(`supabase/migrations/${file}`, "utf8"))
  .join("\n");
const tables = [...migration.matchAll(/create table if not exists public\.([a-z0-9_]+)/g)].map(
  ([, table]) => table,
);
const failures = [];

for (const table of tables) {
  if (!migration.includes(`alter table public.${table} enable row level security;`)) {
    failures.push(`RLS is not enabled for public.${table}`);
  }
}

if (/disable row level security/i.test(migration)) failures.push("RLS disable statement found");
const publicFunctions = migration.match(
  /create or replace function public\.[a-z0-9_]+\([^)]*\)[\s\S]*?as \$\$[\s\S]*?\$\$;/gi,
) ?? [];
if (publicFunctions.some((definition) => /security definer/i.test(definition))) {
  failures.push("Security definer function found in exposed public schema");
}
if (!migration.includes("marketplace_products_publication_safety")) {
  failures.push("Marketplace product publication safety constraint is missing");
}
if (!migration.includes("revoke update on public.marketplace_profiles from authenticated;")) {
  failures.push("Authenticated profile UPDATE privilege is not narrowed before safe column grants");
}
if (!migration.includes("before update of role on public.marketplace_profiles")) {
  failures.push("Marketplace profile role escalation trigger is missing");
}
if (!migration.includes("products public approved published")) {
  failures.push("Public product visibility policy is missing");
}
if (!migration.includes("create or replace function public.is_autopilot_admin()")) {
  failures.push("Strict Autopilot admin helper is missing");
}
if (!migration.includes("where id = auth.uid() and role in ('admin','marketplace_admin')")) {
  failures.push("Strict Autopilot admin helper accepts unexpected roles");
}
if (!migration.includes("send_enabled boolean not null default false check (send_enabled = false)")) {
  failures.push("Autopilot campaign send lock is missing");
}

const autopilotTables = tables.filter((table) => table.startsWith("autopilot_"));
for (const table of autopilotTables) {
  if (!migration.includes(`revoke all on public.${table} from anon;`)) {
    failures.push(`Anonymous access is not explicitly revoked for public.${table}`);
  }
}

const allowedPublicInsertPolicies = [
  'create policy "click events public insert" on public.marketplace_click_events for insert with check (true);',
  'create policy "consultations public insert" on public.beauty_consultations for insert with check (true);',
];
const publicTrueChecks = migration.match(/create policy .* with check \(true\);/gi) ?? [];
for (const policy of publicTrueChecks) {
  if (!allowedPublicInsertPolicies.includes(policy)) failures.push(`Unreviewed public insert policy: ${policy}`);
}

if (failures.length) {
  console.error("test:rls:static FAIL", failures);
  process.exit(1);
}

console.log(`test:rls:static PASS: ${tables.length} public tables checked`);
