export function createDraftProductRow(candidate: Record<string, unknown>, userId: string) {
  return {
    title: String(candidate.title),
    description: String(candidate.description ?? ""),
    source_url: candidate.source_url,
    image_urls: candidate.image_urls ?? [],
    main_image_url: Array.isArray(candidate.image_urls) ? candidate.image_urls[0] : undefined,
    image_rights_status: "needs_review",
    cost_price: Number(candidate.supplier_cost ?? 0),
    shipping_cost: Number(candidate.estimated_shipping_cost ?? 0),
    sale_price: Number(candidate.suggested_price ?? 0),
    currency: String(candidate.currency ?? "USD"),
    compliance_status: "needs_review",
    publication_status: "draft",
    risk_level: Array.isArray(candidate.risk_flags) && candidate.risk_flags.length ? "high" : "medium",
    created_by: userId,
  } as const;
}
