
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
