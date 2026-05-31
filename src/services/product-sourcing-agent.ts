import type { SupplierProduct } from '@/types/sourcing'
import fs from 'node:fs'
import path from 'node:path'

// ProductSourcingAgent: scaffold that uses API keys when available, otherwise
// falls back to reading a local seed file for testing. Replace fetchAliExpress
// with an official API call when API credentials are present.

export class ProductSourcingAgent {
  apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ALIEXPRESS_API_KEY
  }

  async search(keywords: string[], opts: { limit?: number } = {}): Promise<SupplierProduct[]> {
    // If real API key available, implement call to provider API here.
    if (this.apiKey) {
      // TODO: implement official API integration
      return []
    }

    // Fallback: read local seed (used for tests and dev preview)
    const seedPath = path.join(process.cwd(), 'data', 'victoriosaSeedProducts.js')
    if (fs.existsSync(seedPath)) {
            const seed = require(seedPath)
      const all = seed.default || seed
      return all.slice(0, opts.limit || 20)
    }

    return []
  }

  // Example: normalize external product payload to internal SupplierProduct
  normalize(raw: any): SupplierProduct {
    return {
      title: raw.title || raw.name || raw.product_name,
      supplier: raw.supplier || raw.shop_name || 'unknown',
      supplier_product_id: String(raw.id || raw.product_id || ''),
      supplier_url: raw.url || raw.link || '',
      images: raw.images || raw.image_urls || [],
      videos: raw.videos || [],
      price: Number(raw.price || raw.sale_price || 0),
      shipping_cost: Number(raw.shipping_cost || 0),
      ships_to: raw.ships_to || [],
      delivery_time_days: raw.delivery_time_days || null,
      sold: Number(raw.sold || raw.orders || 0),
      rating: Number(raw.rating || raw.score || 0),
      reviews: Number(raw.reviews || raw.review_count || 0),
      variants: raw.variants || [],
      stock: raw.stock || raw.quantity || null,
      category: raw.category || null,
      supplier_rating: raw.supplier_rating || null,
      return_policy: raw.return_policy || null,
      weight_grams: raw.weight_grams || null,
      dimensions: raw.dimensions || null,
      raw,
    }
  }
}

export default ProductSourcingAgent
