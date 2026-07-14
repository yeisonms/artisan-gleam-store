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
  monto_abonado_cents?: number;
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
      const productItems = items.filter(i => i.type === 'product' && i.variant);
      const serviceItems = items.filter(i => i.type === 'custom_service');

      const detallesJSON = productItems.map((item) => ({
        variante_id: item.variant!.id,
        cantidad: item.quantity,
        precio_unitario_cents: item.price_cents,
        subtotal_cents: item.subtotal_cents,
      }));

      if (detallesJSON.length > 0) {
        // Usar RPC si hay productos
        const { error: rpcError } = await supabase.rpc('procesar_venta_omnicanal', {
          p_cliente_id: finalCustomerId,
          p_canal: options.canal,
          p_estado_pago: options.estado_pago,
          p_total_cents: totalCents, // Incluye el costo de servicios
          p_detalles: detallesJSON,
        });

        if (rpcError) {
          throw new Error(rpcError.message || 'Error procesando la transacción omnicanal');
        }

        // FIX: El RPC asienta una transacción por el 100% del valor. 
        // Si la venta es a crédito o con abono, debemos corregir ese registro.
        if (options.estado_pago !== 'Pagado') {
          const { data: latestVenta } = await supabase.from('ventas')
            .select('id')
            .eq('cliente_id', finalCustomerId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (latestVenta) {
            if (options.estado_pago === 'Credito') {
              // Si es crédito, no ha pagado nada, eliminamos el ingreso fantasma
              await supabase.from('transacciones_financieras')
                .delete()
                .eq('venta_id', latestVenta.id);
            } else if (options.estado_pago === 'Abonado') {
              // Borramos lo que haya hecho el RPC para estar seguros
              await supabase.from('transacciones_financieras')
                .delete()
                .eq('venta_id', latestVenta.id);

              const abono = options.monto_abonado_cents || 0;
              if (abono > 0) {
                // E insertamos el abono correcto
                await supabase.from('transacciones_financieras')
                  .insert({
                    venta_id: latestVenta.id,
                    tipo: 'Ingreso',
                    monto_cents: abono,
                    metodo_pago: 'Efectivo',
                    notas: 'Abono Inicial de Venta POS'
                  });
              }
            }
          }
        }
      } else {
        // Solo hay servicios: Inserción directa (bypass del RPC)
        const serviceNotes = serviceItems.map(s => `${s.title}`).join(", ");
        const { data: ventaData, error: ventaError } = await supabase
          .from('ventas')
          .insert({
            cliente_id: finalCustomerId,
            canal: options.canal,
            estado_pago: options.estado_pago,
            total_cents: totalCents,
            estado_entrega: 'Entregado'
          })
          .select('id')
          .single();
          
        if (ventaError) throw new Error(ventaError.message);

        // Registro financiero
        if (options.estado_pago === 'Pagado') {
          const { error: finError } = await supabase
            .from('transacciones_financieras')
            .insert({
              venta_id: ventaData.id,
              tipo: 'Ingreso',
              monto_cents: totalCents,
              metodo_pago: 'Efectivo', // Default
              notas: `Venta de Servicios POS (Pagado): ${serviceNotes}`
            });
          if (finError) throw new Error(finError.message);
        } else if (options.estado_pago === 'Abonado') {
          const abono = options.monto_abonado_cents || 0;
          if (abono > 0) {
            const { error: finError } = await supabase
              .from('transacciones_financieras')
              .insert({
                venta_id: ventaData.id,
                tipo: 'Ingreso',
                monto_cents: abono,
                metodo_pago: 'Efectivo',
                notas: `Abono Inicial de Servicios POS: ${serviceNotes}`
              });
            if (finError) throw new Error(finError.message);
          }
        }
        // Si es Credito, no registramos ingreso porque no ha pagado nada.
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
