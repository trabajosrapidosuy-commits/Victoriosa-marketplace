import type { ExternalProductInput, MarginRule } from "./types";

export const TEST_SUPPLIER = {
  name: "Victoriosa Catalog Lab",
  status: "draft",
  feedType: "json",
  country: "UY",
  currency: "USD",
} as const;

export const DEFAULT_MARGIN_RULES: MarginRule[] = [
  { currency: "USD", minCost: 0, maxCost: 5, multiplier: 2.4 },
  { currency: "USD", minCost: 5, maxCost: 15, multiplier: 2.1 },
  { currency: "USD", minCost: 15, maxCost: 30, multiplier: 1.8 },
  { currency: "USD", minCost: 30, maxCost: null, multiplier: 1.6 },
];

export const TEST_CATALOG: ExternalProductInput[] = [
  { externalId: "lab-001", sku: "LAB-CLEANSER", brand: "Muestra Lab", title: "Gel limpiador suave", description: "Limpieza facial de uso diario.", category: "Limpieza facial", cost: 4.5, currency: "USD", stock: 22, imageUrls: ["https://images.example.test/cleanser-1.jpg", "https://images.example.test/cleanser-2.jpg", "https://images.example.test/cleanser-3.jpg"], rawData: { fixture: true } },
  { externalId: "lab-002", sku: "LAB-SERUM", brand: "Muestra Lab", title: "Serum hidratante", description: "Serum ligero para rutina facial.", category: "Serums", cost: 12, currency: "USD", stock: 8, imageUrls: ["https://images.example.test/serum.jpg"], rawData: { fixture: true } },
  { externalId: "lab-003", sku: "LAB-MASK", title: "Mascarilla facial", description: "", cost: 6, currency: "USD", stock: 4, imageUrls: [], rawData: { fixture: true } },
  { externalId: "lab-004", sku: "LAB-TOOL", brand: "Muestra Lab", title: "Rodillo facial", description: "Accesorio de cuidado facial.", category: "Accesorios", cost: 16, currency: "USD", stock: 0, imageUrls: ["https://images.example.test/tool.jpg"], rawData: { fixture: true } },
  { externalId: "lab-005", sku: "LAB-KIT", brand: "Muestra Lab", title: "Kit de rutina facial", description: "Conjunto de productos de belleza para una rutina básica.", category: "Kits", cost: 33, currency: "USD", stock: 15, imageUrls: ["https://images.example.test/kit-1.jpg", "https://images.example.test/kit-2.jpg", "https://images.example.test/kit-3.jpg"], rawData: { fixture: true } },
];
