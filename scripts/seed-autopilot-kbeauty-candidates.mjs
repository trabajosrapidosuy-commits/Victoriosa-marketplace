import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { kbeautyAutopilotSeed } from "../data/kbeautyAutopilotSeed.js";

const cli = parseArgs(process.argv.slice(2));
const loadedEnv = loadLocalEnv();
const mergedEnv = { ...loadedEnv, ...process.env };
const url = mergedEnv.SUPABASE_URL;
const serviceRoleKey = mergedEnv.SUPABASE_SERVICE_ROLE_KEY;
const publicUrl = mergedEnv.NEXT_PUBLIC_SUPABASE_URL;
const publicAnonKey = mergedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const productionStatus = readProductionStatus();
const allowWrite = cli.write;
const target = cli.target ?? "staging";
const explicitWriteFlag = mergedEnv.AUTOPILOT_KBEAUTY_SEED_WRITE === "true" || cli.confirmReviewOnly;
const expectedStagingUrl = "https://ngliugfcwydnfbpalkpb.supabase.co";
const authorizedStagingTarget = mergedEnv.AUTHORIZED_STAGING_TARGET === "true";

const summary = {
  mode: kbeautyAutopilotSeed.mode,
  generatedAt: kbeautyAutopilotSeed.generatedAt,
  writeEnabled: allowWrite,
  target,
  targetStatus: url
    ? url === expectedStagingUrl
      ? authorizedStagingTarget
        ? "CONFIRMED_STAGING"
        : "BLOCKED_TARGET_NOT_CONFIRMED"
      : "BLOCKED_TARGET_NOT_CONFIRMED"
    : "BLOCKED_EXTERNAL_CREDENTIALS",
  brandCount: kbeautyAutopilotSeed.brands.length,
  productCount: kbeautyAutopilotSeed.products.length,
  productStatuses: Array.from(new Set(kbeautyAutopilotSeed.products.map((product) => product.status))).sort(),
  supplierValidationStates: Array.from(new Set(kbeautyAutopilotSeed.products.map((product) => product.supplierValidationStatus))).sort(),
  publication: "NEVER_PUBLISHED_BY_THIS_SCRIPT",
  envStatus: {
    SUPABASE_URL: url ? "SET" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey ? "SET" : "MISSING",
    NEXT_PUBLIC_SUPABASE_URL: publicUrl ? "SET" : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publicAnonKey ? "SET" : "MISSING",
    AUTHORIZED_STAGING_TARGET: mergedEnv.AUTHORIZED_STAGING_TARGET ? "SET" : "MISSING",
  },
};

if (!allowWrite || cli.dryRun) {
  console.log(JSON.stringify({ dryRun: true, ...summary }, null, 2));
  process.exit(0);
}

if (productionStatus !== "NO-GO_PRODUCTION") {
  console.error(JSON.stringify({
    dryRun: false,
    error: "Refusing to write because PRODUCTION_STATUS is not NO-GO_PRODUCTION.",
    productionStatus,
  }, null, 2));
  process.exit(1);
}

if (target !== "staging") {
  console.error(JSON.stringify({
    dryRun: false,
    error: "Write mode only allows --target=staging in this phase.",
    target,
  }, null, 2));
  process.exit(1);
}

if (!explicitWriteFlag) {
  console.error(JSON.stringify({
    dryRun: false,
    error: "Write mode requires explicit confirmation via --confirm-review-only or AUTOPILOT_KBEAUTY_SEED_WRITE=true.",
  }, null, 2));
  process.exit(1);
}

if (!url || !serviceRoleKey) {
  console.error(JSON.stringify({
    dryRun: false,
    error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for write mode.",
    envStatus: summary.envStatus,
  }, null, 2));
  process.exit(1);
}

if (url !== expectedStagingUrl) {
  console.error(JSON.stringify({
    dryRun: false,
    error: "Refusing to write because SUPABASE_URL does not match the authorized staging target.",
    targetStatus: "BLOCKED_TARGET_NOT_CONFIRMED",
  }, null, 2));
  process.exit(1);
}

if (!authorizedStagingTarget) {
  console.error(JSON.stringify({
    dryRun: false,
    error: "Refusing to write because AUTHORIZED_STAGING_TARGET=true is required for this phase.",
    targetStatus: "BLOCKED_TARGET_NOT_CONFIRMED",
  }, null, 2));
  process.exit(1);
}

if ((process.env.VERCEL_ENV ?? "").toLowerCase() === "production") {
  console.error(JSON.stringify({
    dryRun: false,
    error: "Refusing to write in production environment.",
  }, null, 2));
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const readiness = await verifyWriteReadiness(supabase);
if (!readiness.ok) {
  console.error(JSON.stringify({
    dryRun: false,
    error: "Target is not ready for write mode.",
    readiness,
  }, null, 2));
  process.exit(1);
}

const runId = crypto.randomUUID();

await insertResearchRun(supabase, runId);
const brandIdBySlug = await upsertBrands(supabase, runId);
await upsertSupplierContacts(supabase, brandIdBySlug);
await upsertImportRequirements(supabase, brandIdBySlug);
await upsertCandidates(supabase, brandIdBySlug);

console.log(JSON.stringify({ dryRun: false, ...summary, runId, readiness }, null, 2));

async function verifyWriteReadiness(client) {
  const requiredTables = [
    "autopilot_research_runs",
    "autopilot_brand_candidates",
    "autopilot_supplier_contacts",
    "autopilot_import_requirements",
    "autopilot_product_candidates",
  ];
  const states = {};
  for (const table of requiredTables) {
    const { error } = await client.from(table).select("id").limit(1);
    states[table] = error ? "MISSING_OR_INACCESSIBLE" : "READY";
  }
  const missingTables = Object.entries(states)
    .filter(([, state]) => state !== "READY")
    .map(([table]) => table);
  return {
    ok: missingTables.length === 0,
    requiredTables: states,
    publicationGuard: "review_only",
    target,
    missingTables,
  };
}

async function insertResearchRun(client, runId) {
  const { error } = await client.from("autopilot_research_runs").upsert({
    id: runId,
    mode: "manual_research",
    title: "Victoriosa K-beauty research review-only seed",
    summary: {
      brands: kbeautyAutopilotSeed.brands.length,
      products: kbeautyAutopilotSeed.products.length,
      publication: "review_only",
    },
    status: "completed",
  });
  if (error) throw new Error(error.message);
}

async function upsertBrands(client, runId) {
  const result = new Map();
  for (const brand of kbeautyAutopilotSeed.brands) {
    const payload = {
      research_run_id: runId,
      name: brand.name,
      country: brand.country,
      official_site_url: brand.officialSiteUrl,
      brand_type: brand.brandType,
      professional_fit: brand.professionalFit,
      retail_fit: brand.retailFit,
      clinic_cabin_fit: brand.clinicCabinFit,
      reputation_notes: brand.reputationNotes,
      evidence_urls: brand.evidenceUrls,
      certifications_claimed: [],
      certifications_validation_status: "pending_validation",
      international_presence: "documented_public_presence",
      supplier_contact_url: brand.supplierContactUrl,
      supplier_contact_email: brand.supplierContactEmail || null,
      uruguay_representation_potential: brand.uruguayRepresentationPotential,
      regulatory_risk: brand.warnings.includes("higher_regulatory_attention") ? 6 : 3,
      claims_risk: brand.name === "KRX Aesthetics" ? 6 : 3,
      counterfeit_risk: brand.name === "AESTURA" ? 4 : 3,
      estimated_margin_potential: brand.name === "AESTURA" ? 6 : 8,
      differentiation_score: 0,
      trust_score: 0,
      profitability_score: 0,
      total_score: 0,
      recommendation_status: "watchlist",
      metadata: {
        slug: brand.slug,
        warnings: brand.warnings,
        blockers: brand.blockers,
      },
    };
    const { data: existing, error: existingError } = await client
      .from("autopilot_brand_candidates")
      .select("id")
      .ilike("name", brand.name)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    if (existing?.id) {
      const { error } = await client
        .from("autopilot_brand_candidates")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      result.set(brand.slug, existing.id);
      continue;
    }

    const { data, error } = await client
      .from("autopilot_brand_candidates")
      .insert(payload)
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? `Could not insert brand ${brand.name}`);
    result.set(brand.slug, data.id);
  }
  return result;
}

async function upsertSupplierContacts(client, brandIdBySlug) {
  for (const brand of kbeautyAutopilotSeed.brands) {
    const brandId = brandIdBySlug.get(brand.slug);
    const { error } = await client.from("autopilot_supplier_contacts").upsert({
      brand_candidate_id: brandId,
      contact_channel: brand.supplierContactEmail ? "email" : "web",
      contact_name: brand.name,
      contact_value: brand.supplierContactEmail || brand.supplierContactUrl,
      source_url: brand.supplierContactUrl,
      outreach_status: "not_contacted",
      notes: "Prepared locally only. No outbound message sent by script.",
    }, { onConflict: "brand_candidate_id,contact_value" });
    if (error) throw new Error(error.message);
  }
}

async function upsertImportRequirements(client, brandIdBySlug) {
  for (const brand of kbeautyAutopilotSeed.brands) {
    const brandId = brandIdBySlug.get(brand.slug);
    const { error } = await client.from("autopilot_import_requirements").upsert({
      brand_candidate_id: brandId,
      country: "UY",
      checklist_status: "pending_review",
      requirements: [
        "validar_importador_local",
        "validar_rotulado",
        "validar_claims_cosmeticos",
        "validar_documentacion_fabricante",
      ],
      notes: "Checklist general no legal definitiva. Mantener review-only.",
    }, { onConflict: "brand_candidate_id,country" });
    if (error) throw new Error(error.message);
  }
}

async function upsertCandidates(client, brandIdBySlug) {
  for (const product of kbeautyAutopilotSeed.products) {
    const brandId = brandIdBySlug.get(product.brandSlug);
    const brand = kbeautyAutopilotSeed.brands.find((item) => item.slug === product.brandSlug);
    const { error } = await client.from("autopilot_product_candidates").upsert({
      supplier_name: brand?.name ?? product.brandSlug,
      title: product.name,
      description: product.shortDescription,
      category: product.category,
      source_url: product.officialSourceUrl,
      raw_payload: {
        source: "kbeauty_seed_review_only",
        officialSourceUrl: product.officialSourceUrl,
        imageSourceUrl: product.imageSourceUrl,
        claimsValidationStatus: product.claimsValidationStatus,
        supplierValidationStatus: product.supplierValidationStatus,
        highlightedIngredients: product.highlightedIngredients,
      },
      pricing: {},
      scoring: {},
      risk_flags: product.regulatoryRisk === "high" ? ["blocked_commercial_risk"] : ["needs_supplier_validation"],
      supplier_cost: 0,
      estimated_shipping_cost: 0,
      suggested_price: 0,
      margin_percent: 0,
      profitability_score: 0,
      viral_score: 0,
      compliance_score: product.regulatoryRisk === "high" ? 10 : 45,
      logistics_score: 0,
      supplier_score: 0,
      total_score: 0,
      provider: "manual",
      external_id: product.externalId,
      image_url: product.imageSourceUrl,
      landed_cost: 0,
      brand_fit_score: 0,
      risk_score: product.regulatoryRisk === "high" ? 80 : 45,
      content_quality_score: 0,
      score_breakdown: {
        recommendation: "review",
        warnings: ["kbeauty_seed_pending_validation"],
        blockers: product.regulatoryRisk === "high" ? ["professional_treatment_validation_required"] : [],
      },
      strengths: [],
      weaknesses: ["pending_supplier_validation", "pending_claims_validation"],
      currency: "USD",
      image_urls: product.imageSourceUrl ? [product.imageSourceUrl] : [],
      status: "pending_admin_review",
      review_status: "pending_admin_review",
      brand_candidate_id: brandId,
      product_type: product.productType,
      target_concern: product.targetConcern,
      short_description: product.shortDescription,
      detected_claims: product.detectedClaims,
      claims_validation_status: product.claimsValidationStatus,
      highlighted_ingredients: product.highlightedIngredients,
      official_source_url: product.officialSourceUrl,
      image_source_url: product.imageSourceUrl,
      image_permission_status: product.imagePermissionStatus,
      public_reference_price: product.publicReferencePrice,
      estimated_margin: product.estimatedMargin,
      research_status: product.status,
      supplier_validation_status: product.supplierValidationStatus,
      representation_status: "not_official",
    }, { onConflict: "provider,external_id" });
    if (error) throw new Error(error.message);
  }
}

function parseArgs(args) {
  return {
    dryRun: args.includes("--dry-run"),
    write: args.includes("--write"),
    confirmReviewOnly: args.includes("--confirm-review-only"),
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
