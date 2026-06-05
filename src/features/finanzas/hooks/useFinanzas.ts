import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransaccionFinanciera {
  id: string;
  venta_id: string | null;
  tipo: string;
  monto_cents: number;
  metodo_pago: string | null;
  notas: string | null;
  created_at: string;
}

export interface FinanzasKPIs {
  ingresosTotalesCents: number;
  egresosTotalesCents: number;
  balanceNetoCents: number;
}

export function useFinanzas() {
  const [transacciones, setTransacciones] = useState<TransaccionFinanciera[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtramos por el mes actual
  const fetchTransacciones = useCallback(async () => {
    setLoading(true);
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('transacciones_financieras')
      .select('*')
      .gte('created_at', firstDay)
      .lte('created_at', lastDay)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar flujo de caja');
      console.error(error);
    } else {
      setTransacciones(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransacciones();
  }, [fetchTransacciones]);

  // Cálculos reactivos en memoria de los registros ya filtrados SARGables del mes
  const kpis: FinanzasKPIs = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;

    transacciones.forEach((t) => {
      if (['Ingreso', 'Abono', 'Pago Completo'].includes(t.tipo)) {
        ingresos += t.monto_cents;
      } else if (['Egreso', 'Reembolso'].includes(t.tipo)) {
        egresos += t.monto_cents;
      }
    });

    return {
      ingresosTotalesCents: ingresos,
      egresosTotalesCents: egresos,
      balanceNetoCents: ingresos - egresos,
    };
  }, [transacciones]);

  const registrarEgreso = async (montoCents: number, notas: string, metodoPago: string) => {
    if (montoCents <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return false;
    }

    const { error } = await supabase.from('transacciones_financieras').insert({
      tipo: 'Egreso',
      monto_cents: montoCents,
      notas: notas.trim(),
      metodo_pago: metodoPago,
    });

    if (error) {
      console.error('Error insertando egreso', error);
      toast.error(error.message || 'Error al registrar el egreso');
      return false;
    }

    toast.success('Egreso registrado exitosamente');
    await fetchTransacciones();
    return true;
  };

  const registrarIngreso = async (montoCents: number, notas: string, metodoPago: string) => {
    if (montoCents <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return false;
    }

    const { error } = await supabase.from('transacciones_financieras').insert({
      tipo: 'Ingreso',
      monto_cents: montoCents,
      notas: notas.trim(),
      metodo_pago: metodoPago,
    });

    if (error) {
      console.error('Error insertando ingreso', error);
      toast.error(error.message || 'Error al registrar el ingreso');
      return false;
    }

    toast.success('Ingreso registrado exitosamente');
    await fetchTransacciones();
    return true;
  };

  return {
    transacciones,
    loading,
    kpis,
    registrarEgreso,
    registrarIngreso,
    refreshFinanzas: fetchTransacciones,
  };
}
