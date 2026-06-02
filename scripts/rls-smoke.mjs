const required = ["SUPABASE_STAGING_URL", "SUPABASE_STAGING_ANON_KEY"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`rls:smoke CHECK_NOT_RUN: missing secure environment variables: ${missing.join(", ")}`);
  process.exit(2);
}

const restUrl = `${process.env.SUPABASE_STAGING_URL}/rest/v1`;
const headers = {
  apikey: process.env.SUPABASE_STAGING_ANON_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_STAGING_ANON_KEY}`,
};

async function getProducts(query) {
  const response = await fetch(`${restUrl}/marketplace_products?${query}`, { headers });
  if (!response.ok) {
    console.error(`rls:smoke FAIL: anonymous REST request returned HTTP ${response.status}`);
    process.exit(1);
  }
  return response.json();
}

async function assertInternalTableHidden(table) {
  const response = await fetch(`${restUrl}/${table}?select=id&limit=1`, { headers });
  if (response.status === 401 || response.status === 403) return;
  if (!response.ok) {
    console.error(`rls:smoke FAIL: unexpected HTTP ${response.status} while checking ${table}`);
    process.exit(1);
  }
  const rows = await response.json();
  if (rows.length) {
    console.error(`rls:smoke FAIL: anonymous request exposed internal table ${table}`);
    process.exit(1);
  }
}

const visibleProducts = await getProducts(
  "select=id,publication_status,compliance_status,risk_level&limit=100",
);
const unsafeVisible = visibleProducts.filter(
  (product) =>
    product.publication_status !== "published" ||
    product.compliance_status !== "approved" ||
    product.risk_level !== "low",
);
if (unsafeVisible.length) {
  console.error("rls:smoke FAIL: anonymous catalog exposed non-publishable products");
  process.exit(1);
}

const draftProducts = await getProducts("select=id&publication_status=eq.draft&limit=1");
if (draftProducts.length) {
  console.error("rls:smoke FAIL: anonymous catalog exposed draft products");
  process.exit(1);
}

const internalTables = [
  "autopilot_supplier_connectors",
  "autopilot_discovery_runs",
  "autopilot_product_candidates",
  "autopilot_ai_product_drafts",
  "autopilot_logs",
  "autopilot_campaign_drafts",
  "autopilot_marketing_opt_ins",
];
for (const table of internalTables) await assertInternalTableHidden(table);

console.log(`rls:smoke PASS: anonymous catalog boundary and ${internalTables.length} internal Autopilot tables verified (${visibleProducts.length} visible rows)`);
