import { getServerClient } from '@/lib/supabase'
import type { SupplierProduct } from '@/types/sourcing'
import generateSeo from './seo-generator'
import calculatePricing from './pricing-engine'
import evaluateProduct from './product-score'

export interface AutoPublishEvaluation {
  eligible: boolean
  reasons: string[]
  score: number
  riskLevel: 'low' | 'medium' | 'high'
  fractionMargin: number
  categoryOk: boolean
  duplicateDetected: boolean
}

const beautyKeywords = [
  'belleza',
  'beauty',
  'estética',
  'estetica',
  'cuidado facial',
  'cuidado corporal',
  'cuidado personal',
  'maquillaje',
  'cosmética',
  'cosmetica',
  'skincare',
  'piel',
  'dermo',
  'spa',
  'rutina',
  'beauty routine',
  'beauty kit',
]

const suspiciousTrademarkTerms = [
  'marca registrada',
  'registered trademark',
  'authentic',
  'original',
  'genuine',
  '®',
  '™',
  'licensed',
  'garantizado',
  'con licencia',
  'producto oficial',
  'producto autentico',
  'producto original',
]

const medicalClaimTerms = [
  'cura',
  'curar',
  'acne severo',
  'acné severo',
  'melasma',
  'dermatitis',
  'hongos',
  'infeccion',
  'infección',
  'dolor',
  'enfermedad',
  'tratamiento',
  'recuperación',
  'terapia',
  'orgánica',
  'sanación',
]

const AUTO_PUBLISH_MINIMUMS = {
  score: 85,
  rating: 4.6,
  reviews: 100,
  sold: 300,
  images: 3,
  margin: 50,
  supplierRating: 3.5,
}

function normalizeText(product: SupplierProduct): string {
  return [
    product.title,
    product.category,
    product.supplier,
    product.raw?.description,
    product.raw?.brand,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function isBeautyRelated(product: SupplierProduct): boolean {
  const text = normalizeText(product)
  return beautyKeywords.some((keyword) => text.includes(keyword))
}

function containsSuspiciousTrademark(product: SupplierProduct): boolean {
  const text = normalizeText(product)
  return suspiciousTrademarkTerms.some((term) => text.includes(term))
}

function containsMedicalClaims(product: SupplierProduct): boolean {
  const text = normalizeText(product)
  return medicalClaimTerms.some((term) => text.includes(term))
}

function hasEnoughImages(product: SupplierProduct): boolean {
  return (product.images?.filter(Boolean).length ?? 0) >= AUTO_PUBLISH_MINIMUMS.images
}

function hasAvailableStock(product: SupplierProduct): boolean {
  return typeof product.stock === 'number' && product.stock > 0
}

function hasAcceptableSupplierReputation(product: SupplierProduct): boolean {
  return typeof product.supplier_rating === 'number' && product.supplier_rating >= AUTO_PUBLISH_MINIMUMS.supplierRating
}

async function isDuplicateProduct(product: SupplierProduct) {
  const supabase = getServerClient()
  if (product.supplier_product_id) {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('supplier_product_id', product.supplier_product_id)
      .limit(1)
    if (error) throw error
    if (data?.length) return true
  }

  if (product.supplier_url) {
    const { data, error } = await getServerClient()
      .from('products')
      .select('id')
      .eq('supplier_url', product.supplier_url)
      .limit(1)
    if (error) throw error
    if (data?.length) return true
  }

  return false
}

export async function evaluateAutoPublishCandidate(
  product: SupplierProduct,
  options: { checkDuplicate?: boolean } = {}
): Promise<AutoPublishEvaluation> {
  const evaluation = evaluateProduct(product)
  const pricing = calculatePricing(product)
  const reasons: string[] = []

  if (evaluation.score < AUTO_PUBLISH_MINIMUMS.score) {
    reasons.push(`ProductScore ${evaluation.score} is below ${AUTO_PUBLISH_MINIMUMS.score}`)
  }
  if (evaluation.risk_level !== 'low') {
    reasons.push(`risk_level is ${evaluation.risk_level}, expected low`)
  }
  if ((product.rating ?? 0) < AUTO_PUBLISH_MINIMUMS.rating) {
    reasons.push(`Rating ${product.rating ?? 0} is below ${AUTO_PUBLISH_MINIMUMS.rating}`)
  }
  if ((product.reviews ?? 0) < AUTO_PUBLISH_MINIMUMS.reviews) {
    reasons.push(`Reviews ${product.reviews ?? 0} is below ${AUTO_PUBLISH_MINIMUMS.reviews}`)
  }
  if ((product.sold ?? 0) < AUTO_PUBLISH_MINIMUMS.sold) {
    reasons.push(`Sales ${product.sold ?? 0} is below ${AUTO_PUBLISH_MINIMUMS.sold}`)
  }
  if (pricing.margin_estimated < AUTO_PUBLISH_MINIMUMS.margin) {
    reasons.push(`Estimated margin ${pricing.margin_estimated}% is below ${AUTO_PUBLISH_MINIMUMS.margin}%`)
  }
  if (!isBeautyRelated(product)) {
    reasons.push('Product does not clearly belong to beauty/esthetics/personal care')
  }
  if (containsSuspiciousTrademark(product)) {
    reasons.push('Suspicious trademark or doubtful brand claim detected')
  }
  if (containsMedicalClaims(product)) {
    reasons.push('Medical claim detected')
  }
  if (!hasEnoughImages(product)) {
    reasons.push('At least 3 valid images are required')
  }
  if (!hasAvailableStock(product)) {
    reasons.push('Stock is not available')
  }
  if (!hasAcceptableSupplierReputation(product)) {
    reasons.push('Supplier reputation is not acceptable')
  }

  let duplicateDetected = false
  if (options.checkDuplicate !== false) {
    duplicateDetected = await isDuplicateProduct(product)
    if (duplicateDetected) {
      reasons.push('Duplicate product already exists in the database')
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    score: evaluation.score,
    riskLevel: evaluation.risk_level,
    fractionMargin: pricing.margin_estimated,
    categoryOk: isBeautyRelated(product),
    duplicateDetected,
  }
}

function logAutoPublishReport(product: SupplierProduct, evaluation: AutoPublishEvaluation) {
  const status = evaluation.eligible ? 'published' : 'needs_review'
  const details = [
    `supplier=${product.supplier}`,
    `supplier_product_id=${product.supplier_product_id}`,
    `score=${evaluation.score}`,
    `risk_level=${evaluation.riskLevel}`,
    `margin=${evaluation.fractionMargin}%`,
    `images=${product.images?.length ?? 0}`,
    `stock=${product.stock ?? 0}`,
    `category=${product.category ?? 'unknown'}`,
    `supplier_rating=${product.supplier_rating ?? 'unknown'}`,
  ].join(' | ')

  console.info(`[AUTO_PUBLISH] ${status.toUpperCase()} - ${details}`)
  if (!evaluation.eligible) {
    console.warn(`[AUTO_PUBLISH] Review required: ${evaluation.reasons.join('; ')}`)
  }
}

function notifyAdminOfAutoPublish(product: SupplierProduct, evaluation: AutoPublishEvaluation) {
  console.info(
    `[AUTO_PUBLISH][ADMIN REPORT] ${evaluation.eligible ? 'Published' : 'Needs review'}: ${product.title} (${product.supplier_product_id}). Reasons: ${evaluation.reasons.join('; ')}`
  )
}

export async function publishProduct(p: SupplierProduct, opts: { autoPublish?: boolean } = {}) {
  const supabase = getServerClient()
  const seo = generateSeo(p)
  const pricing = calculatePricing(p)

  let status = opts.autoPublish ? 'published' : 'draft'
  let score: number | null = null
  let risk_level: 'low' | 'medium' | 'high' = 'low'
  let publishedAt: string | null = null

  if (opts.autoPublish) {
    const evaluation = await evaluateAutoPublishCandidate(p)
    score = evaluation.score
    risk_level = evaluation.riskLevel

    if (!evaluation.eligible) {
      status = 'needs_review'
    } else {
      publishedAt = new Date().toISOString()
      status = 'published'
    }

    logAutoPublishReport(p, evaluation)
    notifyAdminOfAutoPublish(p, evaluation)
  }

  const productRow = {
    supplier: p.supplier,
    supplier_product_id: p.supplier_product_id,
    supplier_url: p.supplier_url,
    title: seo.title,
    slug: seo.slug,
    short_description: seo.shortDescription,
    long_description: seo.longDescription,
    category: p.category || 'Belleza',
    tags: seo.metaKeywords,
    status,
    score,
    risk_level,
    cost_price: p.price,
    shipping_cost: p.shipping_cost || 0,
    sale_price: pricing.price_recommended,
    compare_at_price: null,
    estimated_margin: pricing.margin_estimated,
    currency: process.env.DEFAULT_CURRENCY || 'UYU',
    stock_status: p.stock && p.stock > 0 ? 'in_stock' : 'out_of_stock',
    variants: p.variants || null,
    images: p.images || [],
    seo_title: seo.seoTitle,
    seo_description: seo.seoDescription,
    meta_keywords: seo.metaKeywords,
    published_at: publishedAt,
  }

  const { data, error } = await supabase.from('products').insert(productRow).select().maybeSingle()
  if (error) throw error
  return data
}

export default publishProduct
