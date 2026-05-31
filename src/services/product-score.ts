import type { SupplierProduct } from '@/types/sourcing'

export interface ScoreResult {
  score: number
  reasons: string[]
  risk_level: 'low' | 'medium' | 'high'
}

export function evaluateProduct(p: SupplierProduct): ScoreResult {
  const reasons: string[] = []
  let score = 50

  // Rating
  if (p.rating && p.rating >= 4.6) {
    score += 20
  } else if (p.rating && p.rating >= 4.3) {
    score += 10
  } else {
    reasons.push('Low rating')
    score -= 10
  }

  // Reviews
  if ((p.reviews || 0) >= 100) {
    score += 15
  } else if ((p.reviews || 0) >= 50) {
    score += 5
  } else {
    reasons.push('Few reviews')
    score -= 5
  }

  // Sales
  if ((p.sold || 0) >= 300) {
    score += 15
  } else if ((p.sold || 0) >= 100) {
    score += 5
  } else {
    reasons.push('Low sales')
    score -= 5
  }

  // Price/weight heuristics
  if ((p.weight_grams || 0) > 2000) {
    reasons.push('Heavy product')
    score -= 10
  }

  // Images
  if (p.images && p.images.length >= 3) {
    score += 10
  } else {
    reasons.push('Insufficient images')
    score -= 5
  }

  // Variants
  if (p.variants && p.variants.length > 0) {
    score += 5
  }

  // Clamp
  score = Math.max(0, Math.min(100, score))

  // Risk determination (simple heuristics)
  let risk: ScoreResult['risk_level'] = 'low'
  if ((p.rating || 0) < 4 || (p.reviews || 0) < 20) risk = 'medium'
  if ((p.rating || 0) < 3 || (p.reviews || 0) < 5 || (p.sold || 0) < 10) risk = 'high'

  return { score, reasons, risk_level: risk }
}

export default evaluateProduct
