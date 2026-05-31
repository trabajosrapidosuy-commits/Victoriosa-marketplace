export interface SupplierProduct {
  title: string
  supplier: string
  supplier_product_id: string
  supplier_url: string
  images: string[]
  videos?: string[]
  price: number
  shipping_cost?: number
  ships_to?: string[]
  delivery_time_days?: number | null
  sold?: number
  rating?: number
  reviews?: number
  variants?: any[]
  stock?: number | null
  category?: string | null
  supplier_rating?: number | null
  return_policy?: string | null
  weight_grams?: number | null
  dimensions?: any
  raw?: any
}
