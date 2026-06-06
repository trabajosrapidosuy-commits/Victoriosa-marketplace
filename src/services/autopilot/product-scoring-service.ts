export interface ProductScoreInput {
  name: string;
  brand: string;
  demandSignal: number;
  victoriosaFit: number;
  marginPotential: number;
  regulatoryRisk: number;
  differentiation: number;
  sourceEvidenceCount: number;
  educationEase: number;
  warnings?: string[];
  blockers?: string[];
}

export interface ProductScoreResult {
  demandScore: number;
  fitScore: number;
  marginScore: number;
  regulatoryScore: number;
  differentiationScore: number;
  evidenceScore: number;
  educationScore: number;
  totalScore: number;
  recommendationStatus: "reject" | "watchlist" | "shortlist" | "priority";
  positiveReasons: string[];
  risks: string[];
  missingFields: string[];
  nextAction: string;
}

export function scoreAutopilotProduct(input: ProductScoreInput): ProductScoreResult {
  const warnings = [...(input.warnings ?? [])];
  const blockers = [...(input.blockers ?? [])];
  const missingFields: string[] = [];

  const demandScore = clamp(input.demandSignal, 0, 20);
  const fitScore = clamp(input.victoriosaFit, 0, 20);
  const marginScore = clamp(input.marginPotential, 0, 15);
  const regulatoryScore = clamp(15 - input.regulatoryRisk, 0, 15);
  const differentiationScore = clamp(input.differentiation, 0, 10);
  const evidenceScore = clamp(input.sourceEvidenceCount * 5, 0, 10);
  const educationScore = clamp(input.educationEase, 0, 10);

  if (input.sourceEvidenceCount === 0) missingFields.push("official_source");
  if (input.regulatoryRisk >= 9) warnings.push("very_high_regulatory_risk");
  if (input.marginPotential <= 5) warnings.push("low_margin_headroom");

  const totalScore = demandScore + fitScore + marginScore + regulatoryScore + differentiationScore + evidenceScore + educationScore;
  const recommendationStatus = resolveProductRecommendation(totalScore, warnings, blockers);

  return {
    demandScore,
    fitScore,
    marginScore,
    regulatoryScore,
    differentiationScore,
    evidenceScore,
    educationScore,
    totalScore,
    recommendationStatus,
    positiveReasons: [
      `${input.brand} / ${input.name}: ajuste Victoriosa ${fitScore}/20.`,
      `Potencial de demanda ${demandScore}/20 con explicacion comercial simple ${educationScore}/10.`,
      `Evidencia oficial visible ${evidenceScore}/10.`,
    ],
    risks: Array.from(new Set([...warnings, ...blockers])),
    missingFields,
    nextAction: recommendationStatus === "priority"
      ? "Preparar contacto comercial y cargar como candidato review-only."
      : recommendationStatus === "shortlist"
        ? "Validar proveedor, imagenes y requisitos regulatorios antes de cargar."
        : recommendationStatus === "watchlist"
          ? "Mantener en observacion hasta completar evidencia oficial."
          : "No avanzar sin resolver blockers o riesgo regulatorio.",
  };
}

function resolveProductRecommendation(
  totalScore: number,
  warnings: string[],
  blockers: string[],
): ProductScoreResult["recommendationStatus"] {
  if (blockers.length > 0) return "reject";
  if (warnings.includes("very_high_regulatory_risk")) return totalScore >= 55 ? "watchlist" : "reject";
  if (totalScore >= 72) return "priority";
  if (totalScore >= 58) return "shortlist";
  if (totalScore >= 45) return "watchlist";
  return "reject";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
