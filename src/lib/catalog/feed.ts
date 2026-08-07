import { externalProductSchema } from "./normalize";
import type { ExternalProductInput } from "./types";

/** Parses supplied payloads only. Network retrieval is intentionally separate and server-only. */
export function parseCatalogPayload(feedType: "csv" | "xml" | "json", payload: string): ExternalProductInput[] {
  if (feedType === "json") return parseJson(payload);
  if (feedType === "csv") return parseCsv(payload);
  return parseXml(payload);
}

function parseJson(payload: string) {
  const parsed: unknown = JSON.parse(payload);
  const rows = Array.isArray(parsed) ? parsed : isRecord(parsed) && Array.isArray(parsed.products) ? parsed.products : [];
  return rows.map(mapRow).map((row) => externalProductSchema.parse(row));
}

function parseCsv(payload: string) {
  const [header, ...lines] = payload.trim().split(/\r?\n/);
  if (!header) return [];
  const keys = splitCsv(header);
  return lines.filter(Boolean).map((line) => Object.fromEntries(keys.map((key, index) => [key, splitCsv(line)[index] ?? ""]))).map(mapRow).map((row) => externalProductSchema.parse(row));
}

function parseXml(payload: string) {
  const products = [...payload.matchAll(/<product>([\s\S]*?)<\/product>/gi)].map((match) => match[1]);
  return products.map((block) => {
    const get = (name: string) => new RegExp(`<${name}>([\s\S]*?)<\/${name}>`, "i").exec(block)?.[1]?.trim();
    return externalProductSchema.parse(mapRow({ id: get("id"), sku: get("sku"), title: get("title"), description: get("description"), brand: get("brand"), category: get("category"), cost: get("cost"), currency: get("currency"), stock: get("stock"), image_urls: get("image_urls"), product_url: get("product_url") }));
  });
}

function mapRow(row: unknown): ExternalProductInput {
  const item = isRecord(row) ? row : {};
  return {
    externalId: stringValue(item.externalId ?? item.external_id ?? item.id ?? item.sku),
    sku: optional(item.sku), ean: optional(item.ean), brand: optional(item.brand),
    title: stringValue(item.title ?? item.name), description: optional(item.description), category: optional(item.category),
    cost: numberValue(item.cost ?? item.price), currency: optional(item.currency), stock: integerValue(item.stock ?? item.inventory),
    imageUrls: urls(item.imageUrls ?? item.image_urls ?? item.images), productUrl: optional(item.productUrl ?? item.product_url ?? item.url), rawData: item,
  };
}

function splitCsv(line: string) { return line.split(",").map((item) => item.trim().replace(/^"|"$/g, "")); }
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
function stringValue(value: unknown) { return String(value ?? "").trim(); }
function optional(value: unknown) { const result = stringValue(value); return result || undefined; }
function numberValue(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; }
function integerValue(value: unknown) { const parsed = numberValue(value); return parsed === undefined ? undefined : Math.trunc(parsed); }
function urls(value: unknown) { if (Array.isArray(value)) return value.map(stringValue).filter(Boolean); return optional(value)?.split("|").map((item) => item.trim()).filter(Boolean); }
