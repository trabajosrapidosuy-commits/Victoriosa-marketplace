export interface DecisionEngineResult {
  recommendation: string;
  score: number;
  riskLevel: "low" | "medium" | "medium_high" | "high";
  complianceStatus: string;
  commercialPotential: string;
  estimatedMargin: string;
  viralityPotential: string;
  brandFit: string;
  supplierReliability: string;
  logisticsRisk: string;
  regulatoryRisk: string;
  professionalTrainingNeed: string;
  blockers: string[];
  warnings: string[];
  nextActions: string[];
  adminSummary: string;
  evidence: unknown[];
}

interface CandidateInput {
  slug: string;
  brandType?: string;
  warnings?: string[];
  blockers?: string[];
}

export function evaluateBrandCandidate(candidate: CandidateInput): DecisionEngineResult {
  let result: DecisionEngineResult = {
    recommendation: "review",
    score: 50,
    riskLevel: "medium",
    complianceStatus: "blocked_pending_documentation",
    commercialPotential: "medium",
    estimatedMargin: "medium",
    viralityPotential: "medium",
    brandFit: "medium",
    supplierReliability: "unknown",
    logisticsRisk: "medium",
    regulatoryRisk: "medium",
    professionalTrainingNeed: "medium",
    blockers: candidate.blockers ?? [],
    warnings: candidate.warnings ?? [],
    nextActions: [],
    adminSummary: "",
    evidence: [],
  };

  if (candidate.slug === "dermafirm") {
    result = {
      recommendation: "review",
      score: 75,
      riskLevel: "medium",
      complianceStatus: "blocked_pending_documentation",
      commercialPotential: "high",
      estimatedMargin: "high",
      viralityPotential: "medium",
      brandFit: "high",
      supplierReliability: "medium",
      logisticsRisk: "medium",
      regulatoryRisk: "medium",
      professionalTrainingNeed: "medium",
      blockers: [
        "no_official_authorization_uy",
        "no_msp_registration",
        "no_importer_validation",
        "no_wholesale_list",
        "no_moq_confirmed",
      ],
      warnings: [
        "verify_msp_documentation",
        "certify_free_sale",
        "request_full_inci",
        "request_gmp_iso",
        "avoid_medical_claims",
        "review_rx_exosome_lines",
      ],
      nextActions: [
        "solicitar_catalogo_b2b",
        "solicitar_lista_mayorista",
        "confirmar_moq",
        "solicitar_muestras",
        "solicitar_documentacion_regulatoria",
        "validar_con_despachante_msp",
        "evaluar_lote_bajo_riesgo",
      ],
      adminSummary: "DERMAFIRM es una marca dermocosmética premium con potencial alto. Se requiere documentación regulatoria antes de proceder.",
      evidence: [],
    };
  } else if (candidate.slug === "krx-aesthetics") {
    result = {
      recommendation: "review",
      score: 70,
      riskLevel: "medium_high",
      complianceStatus: "blocked_pending_documentation",
      commercialPotential: "medium_high",
      estimatedMargin: "medium",
      viralityPotential: "high",
      brandFit: "high",
      supplierReliability: "medium",
      logisticsRisk: "medium",
      regulatoryRisk: "medium_high",
      professionalTrainingNeed: "high",
      blockers: [
        "no_official_authorization_uy",
        "no_msp_registration",
        "no_importer_validation",
        "no_training_confirmed",
        "no_wholesale_list",
        "no_latam_distribution",
      ],
      warnings: [
        "professional_use_only",
        "review_peels_microneedling_carboxy_acids",
        "verify_msp_documentation",
        "no_public_sales_without_training",
        "confirm_latam_distribution",
      ],
      nextActions: [
        "contactar_casa_matriz_latam",
        "solicitar_catalogo_b2b",
        "solicitar_documentacion_regulatoria",
        "exigir_requisitos_formacion",
        "solicitar_muestras",
        "separar_lineas_home_care_y_profesionales",
        "evaluar_productos_bajo_riesgo",
      ],
      adminSummary: "KRX Aesthetics se orienta a tratamientos profesionales con riesgo medio-alto. Documentación y capacitación son obligatorias.",
      evidence: [],
    };
  }

  return result;
}
