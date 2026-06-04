function readBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined || value === "") return defaultValue;
  return value.toLowerCase() === "true";
}

function resolveBoolean(primary: string, fallback: string | undefined, defaultValue: boolean) {
  const primaryValue = process.env[primary];
  if (primaryValue !== undefined && primaryValue !== "") return readBoolean(primaryValue, defaultValue);
  if (fallback) return readBoolean(process.env[fallback], defaultValue);
  return defaultValue;
}

export const AUTOPILOT_FLAGS = {
  enabled: resolveBoolean("AUTOPILOT_ENABLED", undefined, true),
  aiEnabled: resolveBoolean("AUTOPILOT_AI_ENABLED", "ENABLE_AI_AUTOMATION", false),
  liveConnectorsEnabled: resolveBoolean("AUTOPILOT_LIVE_CONNECTORS_ENABLED", undefined, false),
  autoPublishEnabled: resolveBoolean("AUTOPILOT_AUTO_PUBLISH_ENABLED", "ENABLE_AUTO_PUBLICATION", false),
  realFulfillmentEnabled: resolveBoolean("AUTOPILOT_REAL_FULFILLMENT_ENABLED", undefined, false),
  supplierPurchaseEnabled: resolveBoolean("AUTOPILOT_SUPPLIER_PURCHASE_ENABLED", undefined, false),
  outboundEmailEnabled: resolveBoolean("AUTOPILOT_OUTBOUND_EMAIL_ENABLED", undefined, false),
} as const;

export const AUTOPILOT_MODE_FLAGS = {
  autoPublish: AUTOPILOT_FLAGS.autoPublishEnabled ? "ON" : "OFF",
  liveProviders: AUTOPILOT_FLAGS.liveConnectorsEnabled ? "ON" : "OFF",
  unauthorizedScraping: "OFF",
  humanReview: AUTOPILOT_FLAGS.autoPublishEnabled ? "OFF" : "ON",
  currentMode: AUTOPILOT_FLAGS.enabled
    ? AUTOPILOT_FLAGS.aiEnabled
      ? "safe/ai-ready/review"
      : "safe/mock/review"
    : "disabled",
  rls: "STRICT_ADMIN_ONLY",
} as const;

export function getAutopilotFeatureSummary() {
  return {
    enabled: AUTOPILOT_FLAGS.enabled,
    aiDrafts: AUTOPILOT_FLAGS.aiEnabled ? "FLAGGED_REAL_AI_DISABLED_IN_PHASE_1" : "MOCK_SAFE_ONLY",
    liveConnectors: AUTOPILOT_FLAGS.liveConnectorsEnabled ? "ON" : "OFF",
    autoPublish: AUTOPILOT_FLAGS.autoPublishEnabled ? "ON" : "OFF",
    realFulfillment: AUTOPILOT_FLAGS.realFulfillmentEnabled ? "ON" : "OFF",
    supplierPurchase: AUTOPILOT_FLAGS.supplierPurchaseEnabled ? "ON" : "OFF",
    outboundEmail: AUTOPILOT_FLAGS.outboundEmailEnabled ? "ON" : "OFF",
  } as const;
}
