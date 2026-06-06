import { createClient } from "@supabase/supabase-js";
import { kbeautyAutopilotSeed } from "../data/kbeautyAutopilotSeed.js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const allowWrite = process.env.AUTOPILOT_KBEAUTY_SEED_WRITE === "true";

const summary = {
  mode: kbeautyAutopilotSeed.mode,
  generatedAt: kbeautyAutopilotSeed.generatedAt,
  writeEnabled: allowWrite,
  brandCount: kbeautyAutopilotSeed.brands.length,
  productCount: kbeautyAutopilotSeed.products.length,
  productStatuses: Array.from(new Set(kbeautyAutopilotSeed.products.map((product) => product.status))).sort(),
  supplierValidationStates: Array.from(new Set(kbeautyAutopilotSeed.products.map((product) => product.supplierValidationStatus))).sort(),
  publication: "NEVER_PUBLISHED_BY_THIS_SCRIPT",
};

if (!allowWrite) {
  console.log(JSON.stringify({ dryRun: true, ...summary }, null, 2));
  process.exit(0);
}

if (!url || !serviceRoleKey) {
  console.error(JSON.stringify({
    dryRun: false,
    error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for write mode.",
    envStatus: {
      SUPABASE_URL: url ? "SET" : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey ? "SET" : "MISSING",
    },
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

const runId = crypto.randomUUID();

await insertResearchRun(supabase, runId);
const brandIdBySlug = await upsertBrands(supabase, runId);
await upsertSupplierContacts(supabase, brandIdBySlug);
await upsertImportRequirements(supabase, brandIdBySlug);
await upsertCandidates(supabase, brandIdBySlug);

console.log(JSON.stringify({ dryRun: false, ...summary, runId }, null, 2));

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
