import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PosCartItem } from './usePosCart';

export interface PosCustomerForm {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
}

export interface CheckoutOptions {
  canal: 'Fisico' | 'Digital';
  estado_pago: 'Pagado' | 'Credito' | 'Abonado';
}

export function usePosCheckout() {
  const [loading, setLoading] = useState(false);

  const processCheckout = async (
    items: PosCartItem[],
    totalCents: number,
    customer: PosCustomerForm,
    options: CheckoutOptions
  ): Promise<boolean> => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return false;
    }
    if (!customer.nombre.trim()) {
      toast.error('Debe seleccionar o registrar un cliente (Nombre requerido)');
      return false;
    }

    setLoading(true);

    try {
      let finalCustomerId = customer.id;

      // 1. Crear cliente si es nuevo (no tiene ID)
      if (!finalCustomerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('clientes')
          .insert({
            nombre: customer.nombre.trim(),
            email: customer.email.trim() || null,
            telefono: customer.telefono.trim() || null,
          })
          .select('id')
          .single();

        if (customerError) throw new Error(`Error al crear cliente: ${customerError.message}`);
        finalCustomerId = newCustomer.id;
      }

      // 2. Crear la Venta
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert({
          cliente_id: finalCustomerId,
          canal: options.canal,
          estado_pago: options.estado_pago,
          estado_entrega: options.canal === 'Fisico' ? 'Entregado' : 'Pendiente',
          total_cents: totalCents,
        })
        .select('id')
        .single();

      if (ventaError) throw new Error(`Error al registrar venta: ${ventaError.message}`);
      const ventaId = venta.id;

      // 3. Crear los Detalles de Venta
      const detalles = items.map((item) => ({
        venta_id: ventaId,
        variante_id: item.variant.id,
        cantidad: item.quantity,
        precio_unitario_cents: item.variant.price_cents,
        subtotal_cents: item.subtotal_cents,
      }));

      const { error: detallesError } = await supabase.from('detalle_ventas').insert(detalles);
      if (detallesError) throw new Error(`Error al guardar detalles: ${detallesError.message}`);

      // 3.5 Registrar ingreso en caja si se pagó de contado
      if (options.estado_pago === 'Pagado') {
        const { error: ingresoError } = await supabase.from('transacciones_financieras').insert({
          venta_id: ventaId,
          tipo: 'Ingreso',
          monto_cents: totalCents,
          metodo_pago: 'Efectivo',
          notas: `Pago completo POS - ${options.canal}`,
        });
        if (ingresoError) {
          console.error("Error registrando el ingreso en transacciones_financieras", ingresoError);
        }
      }

      // 4. Actualizar Stock (Secuencial por cada variante en el carrito)
      for (const item of items) {
        const remainingStock = item.variant.stock - item.quantity;
        
        // Evitar dejar stock en negativo
        const updatedStock = remainingStock < 0 ? 0 : remainingStock;
        
        const { error: stockError } = await supabase
          .from('product_variants')
          .update({ stock: updatedStock })
          .eq('id', item.variant.id);
          
        if (stockError) {
           console.error(`Error actualizando stock de la variante ${item.variant.id}`, stockError);
           // Notificamos pero no detenemos todo, la venta ya se registró
           toast.warning(`La venta se registró, pero hubo un problema ajustando el stock de ${item.variant.name}`);
        }
      }

      toast.success('¡Venta procesada con éxito!');
      setLoading(false);
      return true;

    } catch (error: any) {
      console.error('Error en checkout:', error);
      toast.error(error.message || 'Error inesperado al procesar la venta');
      setLoading(false);
      return false;
    }
  };

  return {
    processCheckout,
    loading,
  };
}
