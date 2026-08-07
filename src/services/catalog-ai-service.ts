import "server-only";

/**
 * AI boundary for a future Vercel AI SDK + AI Gateway implementation.
 * This phase never calls a model. It keeps all output review-only and forbids unsupported claims.
 * When enabled, install `ai` and use `generateObject` with AI_GATEWAY_API_KEY or Vercel OIDC.
 */
export function getCatalogAiReadiness() {
  return {
    enabled: process.env.CATALOG_AI_ENABLED === "true",
    gatewayConfigured: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN),
    mode: "review_only" as const,
    prohibited: ["prices", "stock", "ingredients", "technical_features", "certifications", "brands", "medical_benefits"],
  };
}

export function buildSourceGroundedCatalogPrompt(source: { title: string; description?: string; brand?: string; category?: string }) {
  return [
    "Transform only the supplied source fields. Return missing fields as missing.",
    "Never invent prices, stock, ingredients, technical features, certifications, brands, medical benefits, or unsupported claims.",
    `title: ${source.title}`,
    `description: ${source.description ?? "[missing]"}`,
    `brand: ${source.brand ?? "[missing]"}`,
    `category: ${source.category ?? "[missing]"}`,
  ].join("\n");
}
