// Database types for Victoriosa marketplace

export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  role: 'customer' | 'admin' | 'supplier'
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  category: string
  supplier_id: string
  supplier_cost: number
  margin_percentage: number
  retail_price: number
  currency: string
  status: 'draft' | 'active' | 'archived'
  image_url: string | null
  stock_quantity: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  currency: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface SupplierImport {
  id: string
  supplier_id: string
  import_method: 'csv' | 'json' | 'api' | 'manual'
  file_name: string | null
  product_count: number
  imported_count: number
  failed_count: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface AnalyticsEvent {
  id: string
  event_type: string
  user_id: string | null
  product_id: string | null
  order_id: string | null
  data: Record<string, any> | null
  created_at: string
}

// Request/Response types for API endpoints

export interface CreateProductRequest {
  sku: string
  name: string
  description?: string
  category: string
  supplier_cost: number
  margin_percentage?: number
  image_url?: string
  stock_quantity?: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  category?: string
  supplier_cost?: number
  margin_percentage?: number
  retail_price?: number
  image_url?: string
  stock_quantity?: number
  status?: 'draft' | 'active' | 'archived'
}

export interface CreateOrderRequest {
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_address?: string
  items: Array<{
    product_id: string
    quantity: number
  }>
  notes?: string
}

export interface ImportProductsRequest {
  import_method: 'csv' | 'json' | 'api' | 'manual'
  file_content?: string // CSV or JSON data as string
  data?: Array<CreateProductRequest>
}
