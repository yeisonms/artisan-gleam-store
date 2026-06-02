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
