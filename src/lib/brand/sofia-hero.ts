export type SofiaHeroMode =
  | "approved_brand_asset"
  | "approved_legacy_asset"
  | "placeholder_pending_real_asset";

export interface SofiaHeroAsset {
  alt: string;
  caption: string;
  desktopSrc: string;
  mobileSrc: string;
  mode: SofiaHeroMode;
}

const BRAND_DESKTOP_SRC = "/brand/sofia-victoria-hero.jpg";
const BRAND_MOBILE_SRC = "/brand/sofia-victoria-hero-mobile.jpg";
const LEGACY_APPROVED_SRC = "/victoriosa-hero-editorial.png";
const PLACEHOLDER_SRC = "/placeholder-product.svg";

export function getSofiaHeroAsset(): SofiaHeroAsset {
  return {
    alt: "Sofía Victoria, fundadora de Victoriosa, en un ritual de belleza consciente",
    caption: "Sofía Victoria - ritual de belleza consciente",
    desktopSrc: BRAND_DESKTOP_SRC,
    mobileSrc: BRAND_MOBILE_SRC,
    mode: "approved_brand_asset",
  };
}
