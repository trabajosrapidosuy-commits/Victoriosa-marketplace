import { beforeAll, describe, expect, it } from "vitest"

process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key'

import type { SupplierProduct } from "@/types/sourcing"

let evaluateAutoPublishCandidate: (
  product: SupplierProduct,
  options?: { checkDuplicate?: boolean }
) => Promise<{
  eligible: boolean
  reasons: string[]
  score: number
  riskLevel: string
  fractionMargin: number
  categoryOk: boolean
  duplicateDetected: boolean
}>

beforeAll(async () => {
  const productPublisherModule = await import("@/services/product-publisher")
  evaluateAutoPublishCandidate = productPublisherModule.evaluateAutoPublishCandidate
})

describe("product-publisher auto publish evaluation", () => {
  const candidate: SupplierProduct = {
    title: "Sérum facial concentrado belleza premium",
    supplier: "Proveedor confiable",
    supplier_product_id: "prod-123",
    supplier_url: "https://example.com/product/123",
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg", "https://example.com/img3.jpg"],
    price: 12,
    shipping_cost: 3,
    sold: 520,
    rating: 4.7,
    reviews: 180,
    variants: [],
    stock: 25,
    category: "Cuidado facial",
    supplier_rating: 4.2,
    return_policy: null,
    weight_grams: 120,
    dimensions: null,
    raw: {
      description: "Sérum para piel radiante y rutina de belleza sin claims médicos.",
      brand: "Marca segura"
    }
  }

  it("approves a valid beauty product candidate for auto publish", async () => {
    const result = await evaluateAutoPublishCandidate(candidate, { checkDuplicate: false })
    expect(result.eligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
    expect(result.score).toBeGreaterThanOrEqual(85)
    expect(result.riskLevel).toBe("low")
    expect(result.fractionMargin).toBeGreaterThanOrEqual(50)
    expect(result.categoryOk).toBe(true)
  })

  it("rejects a candidate with medical claims, low score and missing stock", async () => {
    const badCandidate = {
      ...candidate,
      title: "Tratamiento de dermatitis severa",
      category: "Medicamento dermatológico",
      rating: 3.8,
      reviews: 20,
      sold: 15,
      stock: 0,
      raw: {
        description: "Cura la dermatitis severa y elimina hongos en pocos días.",
        brand: "Marca dudosa"
      }
    }
    const result = await evaluateAutoPublishCandidate(badCandidate, { checkDuplicate: false })
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain("Rating 3.8 is below 4.6")
    expect(result.reasons).toContain("Reviews 20 is below 100")
    expect(result.reasons).toContain("Sales 15 is below 300")
    expect(result.reasons).toContain("Medical claim detected")
    expect(result.reasons).toContain("Stock is not available")
  })
})
