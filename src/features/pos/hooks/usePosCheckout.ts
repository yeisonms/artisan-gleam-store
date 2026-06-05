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

      // 2. Transacción Omnicanal ACID
      const detallesJSON = items.map((item) => ({
        variante_id: item.variant.id,
        cantidad: item.quantity,
        precio_unitario_cents: item.variant.price_cents,
        subtotal_cents: item.subtotal_cents,
      }));

      const { error: rpcError } = await supabase.rpc('procesar_venta_omnicanal', {
        p_cliente_id: finalCustomerId,
        p_canal: options.canal,
        p_estado_pago: options.estado_pago,
        p_total_cents: totalCents,
        p_detalles: detallesJSON,
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Error procesando la transacción omnicanal');
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
