import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VentaDeuda {
  id: string;
  created_at: string;
  canal: string;
  estado_pago: string;
  total_cents: number;
  cliente: {
    id: string;
    nombre: string;
    telefono: string | null;
  } | null;
  total_abonado_cents: number;
  saldo_pendiente_cents: number;
}

export function useCartera() {
  const [deudas, setDeudas] = useState<VentaDeuda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeudas = useCallback(async () => {
    setLoading(true);
    // Traemos ventas que están en Crédito o Abonado, e incluimos cliente y transacciones
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        id,
        created_at,
        canal,
        estado_pago,
        total_cents,
        clientes ( id, nombre, telefono ),
        transacciones_financieras ( monto_cents, tipo )
      `)
      .in('estado_pago', ['Credito', 'Abonado'])
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar la cartera');
      console.error(error);
      setLoading(false);
      return;
    }

    const processedData: VentaDeuda[] = (data || []).map((venta: any) => {
      const transacciones = venta.transacciones_financieras || [];
      const totalAbonado = transacciones.reduce((sum: number, t: any) => sum + (t.monto_cents || 0), 0);
      const saldoPendiente = Math.max(0, venta.total_cents - totalAbonado);

      return {
        id: venta.id,
        created_at: venta.created_at,
        canal: venta.canal,
        estado_pago: venta.estado_pago,
        total_cents: venta.total_cents,
        cliente: venta.clientes,
        total_abonado_cents: totalAbonado,
        saldo_pendiente_cents: saldoPendiente,
      };
    });

    setDeudas(processedData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDeudas();
  }, [fetchDeudas]);

  const registrarAbono = async (
    ventaId: string,
    montoCents: number,
    metodoPago: string,
    notas: string,
    totalVentaCents: number,
    abonosPreviosCents: number
  ) => {
    if (montoCents <= 0) {
      toast.error('El monto a abonar debe ser mayor a 0');
      return false;
    }

    try {
      // 1. Insertar el abono
      const { error: insertError } = await supabase.from('transacciones_financieras').insert({
        venta_id: ventaId,
        tipo: 'Abono',
        monto_cents: montoCents,
        metodo_pago: metodoPago,
        notas: notas.trim() || null,
      });

      if (insertError) throw insertError;

      // 2. Comprobar si se ha saldado la deuda
      const totalAbonadoActual = abonosPreviosCents + montoCents;
      let nuevoEstadoPago = 'Abonado';
      
      if (totalAbonadoActual >= totalVentaCents) {
        nuevoEstadoPago = 'Pagado';
      }

      // 3. Actualizar estado de la venta
      const { error: updateError } = await supabase
        .from('ventas')
        .update({ estado_pago: nuevoEstadoPago })
        .eq('id', ventaId);

      if (updateError) throw updateError;

      toast.success(nuevoEstadoPago === 'Pagado' ? '¡Deuda saldada completamente!' : 'Abono registrado con éxito');
      
      // 4. Refrescar datos
      await fetchDeudas();
      return true;

    } catch (error: any) {
      console.error('Error al registrar abono:', error);
      toast.error(error.message || 'Error inesperado al registrar abono');
      return false;
    }
  };

  return {
    deudas,
    loading,
    registrarAbono,
    refreshCartera: fetchDeudas,
  };
}
