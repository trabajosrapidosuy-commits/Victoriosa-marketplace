import type { SupplierProduct } from '@/types/sourcing'

export interface PricingResult {
  cost_total: number
  price_min: number
  price_recommended: number
  margin_estimated: number
}

export function calculatePricing(p: SupplierProduct, options: { currency?: string, multiplier?: number } = {}): PricingResult {
  const multiplier = options.multiplier ?? Number(process.env.DEFAULT_MARKUP_MULTIPLIER) || 2.8
  const cost = (p.price || 0) + (p.shipping_cost || 0)
  const cost_total = cost * 1.05 // safety buffer 5%
  const price_min = cost_total * 2
  const price_recommended = cost_total * multiplier

  const margin_estimated = ((price_recommended - cost_total) / price_recommended) * 100

  return {
    cost_total: Number(cost_total.toFixed(2)),
    price_min: Number(price_min.toFixed(2)),
    price_recommended: Number(price_recommended.toFixed(2)),
    margin_estimated: Number(margin_estimated.toFixed(2)),
  }
}

export default calculatePricing
