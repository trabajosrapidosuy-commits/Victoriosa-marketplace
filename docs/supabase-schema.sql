-- Victoriosa Marketplace - Supabase Schema & RLS Setup
-- This file contains all database structure and security policies

-- ============================================================================
-- 1. USERS TABLE (managed by Supabase Auth, but extended with profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'supplier')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Only admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Only admins can insert/delete profiles
CREATE POLICY "Admins can insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 2. PRODUCTS TABLE (main product catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  supplier_id uuid NOT NULL REFERENCES public.user_profiles(id),
  supplier_cost numeric(10, 2) NOT NULL CHECK (supplier_cost > 0),
  margin_percentage numeric(5, 2) DEFAULT 75 CHECK (margin_percentage >= 0 AND margin_percentage <= 100),
  retail_price numeric(10, 2) NOT NULL CHECK (retail_price > 0),
  currency text DEFAULT 'UYU',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  image_url text,
  stock_quantity integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products
CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT USING (status = 'active');

-- Suppliers can read their own draft products
CREATE POLICY "Suppliers can read own products" ON public.products
  FOR SELECT USING (
    supplier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Suppliers can insert products (but only as draft)
CREATE POLICY "Suppliers can create products" ON public.products
  FOR INSERT WITH CHECK (
    supplier_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('supplier', 'admin')
    )
  );

-- Suppliers can update their own products
CREATE POLICY "Suppliers can update own products" ON public.products
  FOR UPDATE USING (supplier_id = auth.uid());

-- Only admins can delete products
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 3. ORDERS TABLE (customer orders)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.user_profiles(id),
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'UYU',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_address text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can read their own orders
CREATE POLICY "Customers can read own orders" ON public.orders
  FOR SELECT USING (customer_id = auth.uid());

-- Admins can read all orders
CREATE POLICY "Admins can read all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Customers can create orders
CREATE POLICY "Customers can create orders" ON public.orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Customers can update their own orders (limited fields)
CREATE POLICY "Customers can update own orders" ON public.orders
  FOR UPDATE USING (customer_id = auth.uid());

-- Only admins can fully manage orders
CREATE POLICY "Admins manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. ORDER_ITEMS TABLE (line items in orders)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price > 0),
  subtotal numeric(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can read order items for orders they own
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        ))
    )
  );

-- ============================================================================
-- 5. SUPPLIER_IMPORTS TABLE (track product imports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.supplier_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.user_profiles(id),
  import_method text NOT NULL CHECK (import_method IN ('csv', 'json', 'api', 'manual')),
  file_name text,
  product_count integer DEFAULT 0,
  imported_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

-- Enable RLS on supplier_imports
ALTER TABLE public.supplier_imports ENABLE ROW LEVEL SECURITY;

-- Suppliers can read their own imports
CREATE POLICY "Suppliers can read own imports" ON public.supplier_imports
  FOR SELECT USING (supplier_id = auth.uid());

-- Admins can read all imports
CREATE POLICY "Admins can read all imports" ON public.supplier_imports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Suppliers can create imports
CREATE POLICY "Suppliers can create imports" ON public.supplier_imports
  FOR INSERT WITH CHECK (supplier_id = auth.uid());

-- ============================================================================
-- 6. ANALYTICS TABLE (simple event tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id),
  product_id uuid REFERENCES public.products(id),
  order_id uuid REFERENCES public.orders(id),
  data jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read analytics
CREATE POLICY "Admins can read analytics" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_supplier_imports_supplier_id ON public.supplier_imports(supplier_id);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);

-- ============================================================================
-- 8. FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to calculate retail price from supplier cost + margin
CREATE OR REPLACE FUNCTION public.calculate_retail_price(
  supplier_cost numeric,
  margin_pct numeric
) RETURNS numeric AS $$
  SELECT supplier_cost + (supplier_cost * margin_pct / 100);
$$ LANGUAGE SQL IMMUTABLE;

-- Function to update product updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_timestamp
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_timestamp();

-- Function to update order timestamp
CREATE OR REPLACE FUNCTION public.update_order_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_timestamp
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_timestamp();

-- Function to update user profile timestamp
CREATE OR REPLACE FUNCTION public.update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profile_timestamp
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profile_timestamp();

-- ============================================================================
-- END OF SCHEMA SETUP
-- ============================================================================
