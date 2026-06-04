export type SupplierCurrency = "USD" | "UYU";
export type AutopilotRecommendation = "approve_candidate" | "review" | "reject";
export type AutopilotConnectorStatus = "sandbox" | "enabled" | "disabled" | "needs_credentials";
export type ProductCandidateStatus = "pending_admin_review" | "approved" | "rejected" | "imported_to_draft" | "archived";
export type DiscoveryTargetMarket = "Uruguay" | "LATAM" | "global";
export type ReviewEventType =
  | "discovered"
  | "scored"
  | "shortlisted"
  | "approved"
  | "rejected"
  | "imported_draft"
  | "note_added"
  | "risk_flag_added"
  | "needs_review";

export interface NormalizedSupplierProduct {
  provider: string;
  providerProductId?: string;
  providerVariantId?: string;
  sku?: string;
  sourceUrl?: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  niche: string;
  sourceCountry?: string;
  targetCountry: string;
  currency: SupplierCurrency;
  buyPrice: number;
  shippingCost: number;
  inventoryTotal: number;
  verifiedInventory: number;
  listedCount?: number;
  rating?: number;
  reviewsCount?: number;
  hasVideo?: boolean;
  freeShipping?: boolean;
  deliveryEstimateDays?: number;
  weight?: number;
  dimensions?: string;
  tags: string[];
  raw: Record<string, unknown>;
}

export interface PricingResult {
  buyPrice: number;
  shippingCost: number;
  landedCost: number;
  markupPercent: number;
  estimatedSellPrice: number;
  estimatedMarginPercent: number;
  estimatedProfit: number;
}

export interface PricingDecision extends PricingResult {}

export interface ComplianceDecision {
  riskScore: number;
  riskFlags: string[];
  recommendation: AutopilotRecommendation;
  recommendedAction: "approve_candidate" | "needs_review" | "reject";
}

export type RiskAssessment = ComplianceDecision;

export interface ScoringDecision {
  profitabilityScore: number;
  supplierReliabilityScore: number;
  complianceRiskScore: number;
  shippingScore: number;
  marketFitScore: number;
  inventoryScore: number;
  viralSignal: number;
  brandFitScore: number;
  contentQualityScore: number;
  riskScore: number;
  logisticsScore: number;
  finalScore: number;
  scoreBreakdown: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  warnings: string[];
  blockers: string[];
  riskFlags: string[];
  recommendedAction: ComplianceDecision["recommendedAction"];
  recommendation: AutopilotRecommendation;
  pricing: PricingDecision;
}

export type CandidateScoreResult = ScoringDecision;

export interface SupplierConnector {
  id: string;
  name: string;
  type: string;
  status: AutopilotConnectorStatus;
  capabilities: string[];
  requiredEnvVars: string[];
}

export interface DiscoveryInput {
  connectorId: string;
  category?: string;
  keyword?: string;
  minimumMarginPercent?: number;
  maximumSupplierPrice?: number;
  targetMarket?: DiscoveryTargetMarket;
  maximumShippingDays?: number;
  maximumResults?: number;
}

export interface ProductCandidate {
  id: string;
  connectorId: string;
  supplierName: string;
  title: string;
  description: string;
  category: string;
  sourceUrl: string;
  imageUrl?: string;
  supplierCost: number;
  shippingCost: number;
  currency: SupplierCurrency;
  estimatedDeliveryDays: number;
  suggestedSalePrice: number;
  estimatedMarginPercent: number;
  score: ScoringDecision;
  riskFlags: string[];
  status: ProductCandidateStatus;
}

export interface DiscoveryRun {
  id: string;
  connectorId: string;
  status: "pending" | "running" | "completed" | "needs_credentials" | "failed";
  filters: Record<string, unknown>;
  query?: string;
  category?: string;
  targetMarket?: DiscoveryTargetMarket;
  startedAt?: string;
  completedAt?: string;
}

export interface AIDraft {
  title: string;
  subtitle: string;
  benefits: string[];
  socialCaption: string;
  whatsappText: string;
  emailSubject: string;
  emailPreview: string;
  emailBody: string;
  safetyNotice: string;
}

export interface ReviewEvent {
  candidateId: string;
  eventType: ReviewEventType;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}
