import { supabase } from '@/integrations/supabase/client';

export interface WebOrderPayload {
  cliente_id: string; // UUID del cliente autenticado o recién creado por la web
  canal: 'Digital';
  estado_pago: 'Pagado' | 'Credito';
  total_cents: number;
  detalles: Array<{
    variante_id: string;
    cantidad: number;
    precio_unitario_cents: number;
    subtotal_cents: number;
  }>;
}

/**
 * Servicio diseñado para ser invocado cuando la página web externa
 * confirma un pago o envía una orden al sistema.
 * Utiliza la transacción omnicanal para garantizar ACID.
 */
export const processWebOrder = async (payload: WebOrderPayload) => {
  try {
    const { error: rpcError } = await supabase.rpc('procesar_venta_omnicanal', {
      p_cliente_id: payload.cliente_id,
      p_canal: payload.canal,
      p_estado_pago: payload.estado_pago,
      p_total_cents: payload.total_cents,
      p_detalles: payload.detalles,
    });

    if (rpcError) {
      throw new Error(rpcError.message || 'Error en la transacción omnicanal');
    }

    return { success: true, message: 'Orden web procesada correctamente' };
  } catch (error: any) {
    console.error('Webhook Service Error:', error);
    return { success: false, error: error.message };
  }
};
