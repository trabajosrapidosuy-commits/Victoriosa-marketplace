import { scoreCandidate } from "@/lib/autopilot/core/scoring";
import { AUTOPILOT_FLAGS } from "@/lib/autopilot/config";
import { listMockSupplierProducts } from "@/lib/autopilot/providers/mock-provider";
import type {
  AutopilotConnector,
  CandidateScore,
  DiscoveryInput,
  DiscoveryResult,
  ProductCandidate,
} from "@/types/autopilot";

const baseConnectors: AutopilotConnector[] = [
  { id: "mock", name: "Mock Connector", type: "mock", status: "sandbox", capabilities: ["product_search", "price_sync_simulation"], requiredEnvVars: [] },
  { id: "csv-json", name: "CSV/JSON Import", type: "file_import", status: "enabled", capabilities: ["product_search", "batch_import"], requiredEnvVars: [] },
  { id: "cj", name: "CJdropshipping", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "price_sync", "order_fulfillment", "tracking_sync"], requiredEnvVars: ["CJ_DROPSHIPPING_API_KEY"] },
  { id: "aliexpress", name: "AliExpress", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "price_sync"], requiredEnvVars: ["ALIEXPRESS_API_KEY"] },
  { id: "alibaba", name: "Alibaba", type: "api", status: "needs_credentials", capabilities: ["product_search"], requiredEnvVars: ["ALIBABA_API_KEY"] },
  { id: "zendrop", name: "Zendrop", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "order_fulfillment", "tracking_sync"], requiredEnvVars: ["ZENDROP_API_KEY"] },
  { id: "dropi", name: "Dropi", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "order_fulfillment", "tracking_sync"], requiredEnvVars: ["DROPI_API_KEY"] },
  { id: "autods", name: "AutoDS", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "price_sync"], requiredEnvVars: ["AUTODS_API_KEY"] },
  { id: "dsers", name: "DSers", type: "api", status: "needs_credentials", capabilities: ["product_search", "order_fulfillment"], requiredEnvVars: ["DSERS_API_KEY"] },
];

export function listAutopilotConnectors(): AutopilotConnector[] {
  return baseConnectors.map((connector) => ({
    ...connector,
    status: connector.type === "api" && !AUTOPILOT_FLAGS.liveConnectorsEnabled ? "disabled" : connector.status,
    capabilities: [...connector.capabilities],
    requiredEnvVars: [...connector.requiredEnvVars],
  }));
}

export function runProductDiscovery(input: DiscoveryInput): DiscoveryResult {
  const connectors = listAutopilotConnectors();
  const connector = connectors.find((item) => item.id === input.connectorId) ?? connectors[0];
  if (connector.status === "disabled") {
    return { status: "needs_credentials", connector, candidates: [], message: `${connector.name} esta deshabilitado por safety flags en esta fase.` };
  }
  if (connector.status === "needs_credentials") {
    return { status: "needs_credentials", connector, candidates: [], message: `${connector.name} requiere credenciales externas cargadas de forma segura.` };
  }

  const maximumResults = Math.max(1, Math.min(input.maximumResults ?? 10, 50));
  const normalizedKeyword = input.keyword?.trim().toLowerCase();
  const candidates = listMockSupplierProducts()
    .filter((item) => !input.category || item.category === input.category)
    .filter((item) => !normalizedKeyword || `${item.title} ${item.description}`.toLowerCase().includes(normalizedKeyword))
    .filter((item) => item.buyPrice <= (input.maximumSupplierPrice ?? Number.POSITIVE_INFINITY))
    .filter((item) => (item.deliveryEstimateDays ?? 0) <= (input.maximumShippingDays ?? Number.POSITIVE_INFINITY))
    .map((item, index) => createCandidate(item, index, connector.id))
    .filter((item) => item.estimatedMarginPercent >= (input.minimumMarginPercent ?? 0))
    .slice(0, maximumResults);

  return { status: "completed", connector, candidates, message: `${candidates.length} candidatos creados en pending_admin_review.` };
}

export function getDemoCandidates(): ProductCandidate[] {
  return runProductDiscovery({ connectorId: "mock", maximumResults: 10 }).candidates;
}

export function calculateCandidateScore(input: {
  marginPercent: number;
  supplierCost: number;
  shippingCost: number;
  deliveryDays: number;
  viralPotential: number;
  riskFlags: string[];
}): CandidateScore {
  const profitability = clamp(Math.round(input.marginPercent * 1.35 - input.supplierCost * 0.8 - input.shippingCost));
  const viral = clamp(input.viralPotential);
  const compliance = input.riskFlags.length === 0 ? 92 : input.riskFlags.includes("blocked_commercial_risk") ? 0 : 45;
  const logistics = clamp(100 - input.deliveryDays * 2 - input.shippingCost * 2);
  const supplier = 58;
  const total = clamp(Math.round(profitability * 0.3 + viral * 0.22 + compliance * 0.22 + logistics * 0.16 + supplier * 0.1));
  return {
    profitability,
    viral,
    compliance,
    logistics,
    supplier,
    total,
    explanation: [
      `Margen estimado: ${input.marginPercent.toFixed(1)}%.`,
      `Entrega estimada: ${input.deliveryDays} dias.`,
      input.riskFlags.length === 0 ? "Sin alertas comerciales automaticas." : `Alertas: ${input.riskFlags.join(", ")}.`,
      "Todo candidato requiere revision humana antes de importarse o publicarse.",
    ],
  };
}

function createCandidate(item: ReturnType<typeof listMockSupplierProducts>[number], index: number, connectorId: string): ProductCandidate {
  const intelligence = scoreCandidate(item);
  return {
    id: `candidate-mock-${index + 1}`,
    connectorId,
    supplierName: "Proveedor sandbox Victoriosa",
    title: item.title,
    description: item.description,
    category: item.category,
    sourceUrl: "https://example.invalid/sandbox-product",
    imageUrl: item.images[0],
    supplierCost: item.buyPrice,
    shippingCost: item.shippingCost,
    currency: "USD",
    estimatedDeliveryDays: item.deliveryEstimateDays ?? 0,
    suggestedSalePrice: intelligence.pricing.estimatedSellPrice,
    estimatedMarginPercent: intelligence.pricing.estimatedMarginPercent,
    score: {
      profitability: intelligence.profitabilityScore,
      viral: intelligence.viralSignal,
      compliance: 100 - intelligence.riskScore,
      logistics: intelligence.logisticsScore,
      supplier: intelligence.inventoryScore,
      supplierReliability: intelligence.supplierReliabilityScore,
      complianceRisk: intelligence.complianceRiskScore,
      shipping: intelligence.shippingScore,
      marketFit: intelligence.marketFitScore,
      total: intelligence.finalScore,
      explanation: [...intelligence.strengths, ...intelligence.weaknesses],
      brandFitScore: intelligence.brandFitScore,
      riskScore: intelligence.riskScore,
      contentQualityScore: intelligence.contentQualityScore,
      scoreBreakdown: intelligence.scoreBreakdown,
      strengths: intelligence.strengths,
      weaknesses: intelligence.weaknesses,
      warnings: intelligence.warnings,
      blockers: intelligence.blockers,
      recommendation: intelligence.recommendation,
    },
    riskFlags: intelligence.riskFlags,
    status: "pending_admin_review",
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
