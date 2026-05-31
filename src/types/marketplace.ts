export type SupplierType =
  | "amazon"
  | "aliexpress"
  | "temu"
  | "cj_dropshipping"
  | "dropshipman"
  | "dsers"
  | "autods"
  | "zendrop"
  | "manual"
  | "csv"
  | "local"
  | "other";

export type TrustLevel = "unknown" | "low" | "medium" | "high" | "verified";
export type SupplierStatus = "active" | "paused" | "blocked" | "needs_review";
export type ImageRightsStatus = "unknown" | "allowed" | "not_allowed" | "own_image" | "needs_review";
export type StockStatus = "unknown" | "in_stock" | "out_of_stock" | "limited" | "preorder";
export type FulfillmentType = "direct_dropship" | "affiliate" | "manual_resale" | "local_stock" | "service_bundle";
export type ComplianceStatus = "draft" | "needs_review" | "approved" | "rejected" | "blocked";
export type PublicationStatus = "draft" | "published" | "archived" | "hidden";
export type RiskLevel = "low" | "medium" | "high" | "blocked";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "supplier_pending"
  | "supplier_ordered"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "disputed";

export interface MarketplaceSupplier {
  id: string;
  name: string;
  type: SupplierType;
  websiteUrl?: string;
  apiEnabled: boolean;
  trustLevel: TrustLevel;
  allowsDropshipping: boolean;
  allowsResale: boolean;
  allowsImageUse: boolean;
  allowsBranding: boolean;
  returnPolicyUrl?: string;
  averageShippingDaysMin?: number;
  averageShippingDaysMax?: number;
  riskNotes?: string;
  status: SupplierStatus;
}

export interface MarketplaceProduct {
  id: string;
  supplierId?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  brand?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  sourceUrl?: string;
  sourcePlatform?: SupplierType | string;
  externalProductId?: string;
  externalSku?: string;
  imageUrls: string[];
  mainImageUrl?: string;
  imageRightsStatus: ImageRightsStatus;
  costPrice: number;
  shippingCost: number;
  platformFeeEstimate: number;
  targetMarginPercent: number;
  targetMarginAmount: number;
  salePrice: number;
  compareAtPrice?: number;
  currency: string;
  localCurrency: string;
  fxRate: number;
  stockStatus: StockStatus;
  fulfillmentType: FulfillmentType;
  complianceStatus: ComplianceStatus;
  publicationStatus: PublicationStatus;
  riskLevel: RiskLevel;
  reviewNotes?: string;
  supplierRating?: number;
  estimatedDeliveryMinDays?: number;
  estimatedDeliveryMaxDays?: number;
  returnWindowDays?: number;
  warrantyNotes?: string;
}

export interface ImportRowResult {
  rowNumber: number;
  status: "created" | "updated" | "rejected" | "duplicate" | "needs_review";
  product?: MarketplaceProduct;
  errors: string[];
  warnings: string[];
}

export interface ImportReport {
  created: number;
  duplicates: number;
  rejected: number;
  marginNegative: number;
  withoutImage: number;
  withoutUrl: number;
  highRisk: number;
  needsLegalReview: number;
  rows: ImportRowResult[];
}
