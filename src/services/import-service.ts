import { normalizeMarketplaceProduct } from "./marketplace-product-service";
import type { ImportReport } from "@/types/marketplace";

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export function importProductsFromRows(rows: Record<string, unknown>[]): ImportReport {
  const report: ImportReport = {
    created: 0,
    duplicates: 0,
    rejected: 0,
    marginNegative: 0,
    withoutImage: 0,
    withoutUrl: 0,
    highRisk: 0,
    needsLegalReview: 0,
    rows: []
  };

  const seen = new Set<string>();
  rows.forEach((row, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    try {
      const product = normalizeMarketplaceProduct(row);
      const duplicateKey = product.sourceUrl || `${product.title}:${product.sourcePlatform ?? "manual"}`;
      if (seen.has(duplicateKey)) {
        report.duplicates += 1;
        report.rows.push({ rowNumber: index + 2, status: "duplicate", product, errors, warnings: ["duplicate_detected"] });
        return;
      }
      seen.add(duplicateKey);

      if (!product.sourceUrl) { report.withoutUrl += 1; warnings.push("without_source_url"); }
      if (!product.mainImageUrl) { report.withoutImage += 1; warnings.push("without_image"); }
      if (product.targetMarginAmount <= 0) { report.marginNegative += 1; warnings.push("margin_negative_or_zero"); }
      if (product.riskLevel === "high" || product.riskLevel === "blocked") { report.highRisk += 1; warnings.push("high_risk_product"); }
      if (product.riskLevel !== "low" || product.imageRightsStatus !== "allowed") { report.needsLegalReview += 1; warnings.push("needs_legal_review"); }

      product.complianceStatus = "needs_review";
      product.publicationStatus = "draft";
      report.created += 1;
      report.rows.push({ rowNumber: index + 2, status: "needs_review", product, errors, warnings });
    } catch (error) {
      report.rejected += 1;
      errors.push(error instanceof Error ? error.message : "unknown_error");
      report.rows.push({ rowNumber: index + 2, status: "rejected", errors, warnings });
    }
  });

  return report;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
