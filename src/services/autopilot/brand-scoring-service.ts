export interface BrandScoreInput {
  name: string;
  officialEvidenceCount: number;
  professionalFit: number;
  differentiationUruguay: number;
  marginPotential: number;
  logisticsFeasibility: number;
  regulatoryRisk: number;
  reputationSignals: number;
  representationPotential: "high" | "medium" | "low";
  warnings?: string[];
  blockers?: string[];
}

export interface BrandScoreResult {
  reputationScore: number;
  professionalFitScore: number;
  differentiationScore: number;
  evidenceScore: number;
  marginScore: number;
  logisticsScore: number;
  regulatoryScore: number;
  totalScore: number;
  recommendationStatus: "reject" | "watchlist" | "shortlist" | "priority";
  positiveReasons: string[];
  risks: string[];
  missingFields: string[];
  nextAction: string;
}

export function scoreAutopilotBrand(input: BrandScoreInput): BrandScoreResult {
  const warnings = input.warnings ?? [];
  const blockers = input.blockers ?? [];
  const reputationScore = clamp(input.reputationSignals, 0, 20);
  const professionalFitScore = clamp(input.professionalFit, 0, 20);
  const differentiationScore = clamp(input.differentiationUruguay, 0, 15);
  const evidenceScore = clamp(input.officialEvidenceCount * 5, 0, 15);
  const marginScore = clamp(input.marginPotential, 0, 10);
  const logisticsScore = clamp(input.logisticsFeasibility, 0, 10);
  const regulatoryScore = clamp(10 - input.regulatoryRisk, 0, 10);
  const totalScore = reputationScore + professionalFitScore + differentiationScore + evidenceScore + marginScore + logisticsScore + regulatoryScore;
  const missingFields = [];

  if (input.officialEvidenceCount === 0) missingFields.push("official_evidence");
  if (input.representationPotential === "low") warnings.push("representation_path_unclear");
  if (input.regulatoryRisk >= 7) warnings.push("high_regulatory_risk");

  const recommendationStatus = resolveBrandRecommendation(totalScore, warnings, blockers);
  const positiveReasons = [
    `${input.name} tiene evidencia oficial contable: ${input.officialEvidenceCount} fuentes principales.`,
    `Fit profesional/estetica: ${professionalFitScore}/20.`,
    `Diferenciacion Uruguay: ${differentiationScore}/15.`,
  ];

  return {
    reputationScore,
    professionalFitScore,
    differentiationScore,
    evidenceScore,
    marginScore,
    logisticsScore,
    regulatoryScore,
    totalScore,
    recommendationStatus,
    positiveReasons,
    risks: Array.from(new Set([...warnings, ...blockers])),
    missingFields,
    nextAction: recommendationStatus === "priority"
      ? "Solicitar catalogo mayorista, condiciones de distribucion y exclusividad Uruguay."
      : recommendationStatus === "shortlist"
        ? "Pedir contacto comercial y validar requisitos regulatorios."
        : recommendationStatus === "watchlist"
          ? "Monitorear evidencia adicional y canal de distribucion."
          : "No avanzar sin evidencia y validacion adicional.",
  };
}

function resolveBrandRecommendation(
  totalScore: number,
  warnings: string[],
  blockers: string[],
): BrandScoreResult["recommendationStatus"] {
  if (blockers.length > 0) return "reject";
  if (warnings.includes("high_regulatory_risk")) return totalScore >= 60 ? "watchlist" : "reject";
  if (totalScore >= 72) return "priority";
  if (totalScore >= 58) return "shortlist";
  if (totalScore >= 45) return "watchlist";
  return "reject";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
