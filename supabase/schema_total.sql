-- ==========================================
-- SCRIPT TOTAL DE BASE DE DATOS SUPABASE
-- ==========================================
-- Ejecuta este script en el SQL Editor de tu nuevo proyecto de Supabase
-- para recrear la estructura completa de pruebas o desarrollo.

-- ----------------------------------------------------------------------------
-- 1. 20260210034438_0a564e91-46f5-4721-adb2-9d4f3f726bf2.sql
-- ----------------------------------------------------------------------------

-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Enum for order status
CREATE TYPE public.order_status AS ENUM ('pending_payment', 'paid', 'preparing', 'shipped', 'canceled', 'refunded');

-- Enum for custom request status
CREATE TYPE public.custom_request_status AS ENUM ('new', 'contacted', 'quoted', 'closed');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Shorthand for admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'COP',
  is_active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  is_custom_request BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Product variants
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT UNIQUE,
  variant_name TEXT NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}',
  price_cents BIGINT,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending_payment',
  subtotal_cents BIGINT NOT NULL DEFAULT 0,
  shipping_cents BIGINT NOT NULL DEFAULT 0,
  tax_cents BIGINT NOT NULL DEFAULT 0,
  total_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'COP',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  payment_provider TEXT,
  payment_link_id TEXT,
  payment_link_url TEXT,
  transaction_id TEXT,
  payment_status_raw TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  variant_snapshot JSONB,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_cents BIGINT NOT NULL DEFAULT 0
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Custom requests
CREATE TABLE public.custom_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  category_hint TEXT,
  budget_cents BIGINT,
  details TEXT NOT NULL,
  reference_images JSONB DEFAULT '[]',
  status custom_request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- user_roles: only admins can manage, users can read own
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- categories: public read active, admin full
CREATE POLICY "Public can read active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- products: public read active, admin full
CREATE POLICY "Public can read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin());

-- product_images: public read (via active product), admin full
CREATE POLICY "Public can read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (public.is_admin());

-- product_variants: public read, admin full
CREATE POLICY "Public can read product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variants" ON public.product_variants FOR ALL USING (public.is_admin());

-- orders: guests can insert, admins can manage all
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- order_items: linked to orders
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (public.is_admin());
CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- custom_requests: anyone can insert, admins can manage
CREATE POLICY "Anyone can create custom requests" ON public.custom_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage custom requests" ON public.custom_requests FOR ALL USING (public.is_admin());

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_requests_updated_at BEFORE UPDATE ON public.custom_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 2. 20260210211447_164a991e-c1c2-4995-b55f-9c593a06865e.sql
-- ----------------------------------------------------------------------------

-- 1. Add explicit SELECT policy for custom_requests (only admins)
CREATE POLICY "Only admins can read custom requests"
  ON public.custom_requests
  FOR SELECT
  USING (public.is_admin());

-- 2. Drop overly permissive INSERT policies on orders and order_items
DROP POLICY "Anyone can create orders" ON public.orders;
DROP POLICY "Anyone can create order items" ON public.order_items;

-- 3. Create restricted INSERT policy for orders - only allow pending_payment status and reasonable defaults
CREATE POLICY "Users can create pending orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    status = 'pending_payment'
    AND subtotal_cents >= 0
    AND shipping_cents >= 0
    AND tax_cents >= 0
    AND total_cents >= 0
    AND transaction_id IS NULL
    AND payment_status_raw IS NULL
  );

-- 4. Create restricted INSERT policy for order_items - must reference an existing order
CREATE POLICY "Users can create order items for valid orders"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    quantity > 0
    AND quantity <= 100
    AND unit_price_cents >= 0
    AND EXISTS (
      SELECT 1 FROM public.orders WHERE id = order_id
    )
  );

-- 5. Add database constraints for data integrity
ALTER TABLE public.orders ADD CONSTRAINT orders_positive_totals
  CHECK (subtotal_cents >= 0 AND shipping_cents >= 0 AND tax_cents >= 0 AND total_cents >= 0);

ALTER TABLE public.order_items ADD CONSTRAINT order_items_positive_quantity
  CHECK (quantity > 0 AND quantity <= 1000);

ALTER TABLE public.order_items ADD CONSTRAINT order_items_positive_price
  CHECK (unit_price_cents >= 0);


-- ----------------------------------------------------------------------------
-- 3. 20260210213341_20f72f40-d8e8-4cd7-94fa-b9c62361b65b.sql
-- ----------------------------------------------------------------------------

-- Replace overly permissive INSERT policy on custom_requests with validated one
DROP POLICY "Anyone can create custom requests" ON public.custom_requests;

CREATE POLICY "Anyone can create custom requests with valid data"
  ON public.custom_requests
  FOR INSERT
  WITH CHECK (
    status = 'new'
    AND length(full_name) >= 2 AND length(full_name) <= 200
    AND length(email) >= 5 AND length(email) <= 255
    AND length(phone) >= 7 AND length(phone) <= 30
    AND length(details) >= 10 AND length(details) <= 5000
    AND (budget_cents IS NULL OR budget_cents >= 0)
  );


-- ----------------------------------------------------------------------------
-- 4. 20260211041824_13f4f1e0-d3f7-4f88-b55d-65518e8c2121.sql
-- ----------------------------------------------------------------------------

-- Auto-assign admin role to the first user who signs up (via auth trigger)
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign admin role if no admin exists yet
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert (fires when a new user signs up)
CREATE TRIGGER on_first_admin_assignment
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_admin();


-- ----------------------------------------------------------------------------
-- 5. 20260211193723_9a0746f3-e6e6-4bdb-8b9c-a0587b327900.sql
-- ----------------------------------------------------------------------------

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Allow admins to update product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.is_admin());

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.is_admin());


-- ----------------------------------------------------------------------------
-- 6. 20260601000000_create_pos_tables.sql
-- ----------------------------------------------------------------------------

-- 1. Tabla Clientes
CREATE TABLE public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla Ventas (POS)
CREATE TABLE public.ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    canal VARCHAR(50) NOT NULL CHECK (canal IN ('Fisico', 'Digital')),
    estado_pago VARCHAR(50) NOT NULL CHECK (estado_pago IN ('Pagado', 'Credito', 'Abonado')),
    estado_entrega VARCHAR(50) DEFAULT 'Entregado',
    total_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla Detalle de Ventas
CREATE TABLE public.detalle_ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id UUID NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_cents INTEGER NOT NULL,
    subtotal_cents INTEGER NOT NULL
);

-- Políticas de Seguridad (RLS) básicas para acceso de Admin
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_ventas ENABLE ROW LEVEL SECURITY;

-- Asumiendo que hay una función is_admin() o similar para permisos
CREATE POLICY "Admins can do everything on clientes" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Admins can do everything on ventas" ON public.ventas FOR ALL USING (true);
CREATE POLICY "Admins can do everything on detalle_ventas" ON public.detalle_ventas FOR ALL USING (true);


-- ----------------------------------------------------------------------------
-- 7. 20260603194655_create_custom_requests_bucket.sql
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) 
VALUES ('custom_requests', 'custom_requests', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload to custom_requests" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'custom_requests' );

CREATE POLICY "Admins can view custom_requests" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'custom_requests' AND public.is_admin() );
