export type AutopilotConnectorStatus = "sandbox" | "enabled" | "disabled" | "needs_credentials";
export type ProductCandidateStatus = "pending_admin_review" | "approved" | "rejected" | "imported_to_draft" | "archived";

export interface AutopilotConnector {
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
  targetMarket?: "Uruguay" | "LATAM" | "global";
  maximumShippingDays?: number;
  maximumResults?: number;
}

export interface CandidateScore {
  profitability: number;
  viral: number;
  compliance: number;
  logistics: number;
  supplier: number;
  total: number;
  explanation: string[];
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
  currency: "USD" | "UYU";
  estimatedDeliveryDays: number;
  suggestedSalePrice: number;
  estimatedMarginPercent: number;
  score: CandidateScore;
  riskFlags: string[];
  status: ProductCandidateStatus;
}

export interface DiscoveryResult {
  status: "completed" | "needs_credentials";
  connector: AutopilotConnector;
  candidates: ProductCandidate[];
  message: string;
}
