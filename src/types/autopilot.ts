import type {
  AIDraft,
  AutopilotConnectorStatus,
  AutopilotRecommendation,
  ComplianceDecision,
  ProductCandidate as CoreProductCandidate,
  DiscoveryInput,
  DiscoveryRun,
  PricingDecision,
  ProductCandidateStatus,
  ReviewEvent,
  ScoringDecision,
  SupplierConnector,
} from "@/lib/autopilot/core/types";

export type { AIDraft, AutopilotConnectorStatus, AutopilotRecommendation, ComplianceDecision, DiscoveryInput, DiscoveryRun, PricingDecision, ProductCandidateStatus, ReviewEvent, ScoringDecision };

export type AutopilotConnector = SupplierConnector;

export interface CandidateScore {
  profitability: number;
  viral: number;
  compliance: number;
  logistics: number;
  supplier: number;
  total: number;
  explanation: string[];
  supplierReliability?: number;
  complianceRisk?: number;
  shipping?: number;
  marketFit?: number;
  brandFitScore?: number;
  riskScore?: number;
  contentQualityScore?: number;
  scoreBreakdown?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  warnings?: string[];
  blockers?: string[];
  recommendation?: AutopilotRecommendation;
}

export interface ProductCandidate extends Omit<CoreProductCandidate, "score"> {
  score: CandidateScore;
}

export interface DiscoveryResult {
  status: "completed" | "needs_credentials";
  connector: AutopilotConnector;
  candidates: ProductCandidate[];
  message: string;
}
