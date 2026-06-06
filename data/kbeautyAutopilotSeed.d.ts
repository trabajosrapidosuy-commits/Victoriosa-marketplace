export interface KbeautyBrandSeed {
  slug: string;
  name: string;
  country: string;
  officialSiteUrl: string;
  brandType: string;
  clinicCabinFit: number;
  retailFit: number;
  professionalFit: number;
  uruguayRepresentationPotential: string;
  evidenceUrls: string[];
  supplierContactUrl: string;
  supplierContactEmail: string;
  reputationNotes: string;
  warnings: string[];
  blockers: string[];
}

export interface KbeautyProductSeed {
  externalId: string;
  brandSlug: string;
  name: string;
  category: string;
  productType: string;
  targetConcern: string;
  shortDescription: string;
  detectedClaims: string[];
  highlightedIngredients: string[];
  officialSourceUrl: string;
  imageSourceUrl: string;
  imagePermissionStatus: string;
  publicReferencePrice: number | null;
  supplierPrice: number | null;
  estimatedMargin: number | null;
  regulatoryRisk: string;
  status: string;
  claimsValidationStatus: string;
  supplierValidationStatus: string;
}

export interface KbeautyAutopilotSeed {
  generatedAt: string;
  mode: string;
  brands: KbeautyBrandSeed[];
  products: KbeautyProductSeed[];
}

export const kbeautyAutopilotSeed: KbeautyAutopilotSeed;
