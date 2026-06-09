export interface ComplianceResult {
  complianceStatus: "blocked_pending_documentation" | "needs_review" | "eligible_for_draft_review";
  blockers: string[];
  warnings: string[];
  requiredDocuments: string[];
  publicationAllowed: boolean;
  draftAllowed: boolean;
  professionalOnly: boolean;
}

interface CandidateComplianceInput {
  slug: string;
  brandType?: string;
}

export function checkCompliance(candidate: CandidateComplianceInput): ComplianceResult {
  let result: ComplianceResult = {
    complianceStatus: "needs_review",
    blockers: [],
    warnings: [],
    requiredDocuments: [],
    publicationAllowed: false,
    draftAllowed: true,
    professionalOnly: false,
  };

  if (candidate.slug === "dermafirm") {
    result = {
      complianceStatus: "blocked_pending_documentation",
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
      requiredDocuments: [
        "autorizacion_oficial_uy",
        "registro_msp",
        "certificado_libre_venta",
        "listado_inci_completo",
        "gmp_o_iso",
      ],
      publicationAllowed: false,
      draftAllowed: true,
      professionalOnly: false,
    };
  } else if (candidate.slug === "krx-aesthetics") {
    result = {
      complianceStatus: "blocked_pending_documentation",
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
      requiredDocuments: [
        "autorizacion_oficial_uy",
        "registro_msp",
        "certificado_libre_venta",
        "listado_inci_completo",
        "licencia_importador",
        "documentos_entrenamiento",
        "canal_latam_autorizado",
      ],
      publicationAllowed: false,
      draftAllowed: true,
      professionalOnly: true,
    };
  }

  return result;
}
