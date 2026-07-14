import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransaccionHistorial {
  id: string;
  venta_id: string | null;
  tipo: string;
  monto_cents: number;
  metodo_pago: string | null;
  notas: string | null;
  created_at: string;
}

export function useHistorialFinanzas() {
  const [transacciones, setTransacciones] = useState<TransaccionHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('Todos'); // 'Todos', 'Ingresos', 'Egresos'

  const fetchHistorial = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('transacciones_financieras')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros de fecha si existen
    if (fechaInicio) {
      query = query.gte('created_at', `${fechaInicio}T00:00:00.000Z`);
    }
    if (fechaFin) {
      query = query.lte('created_at', `${fechaFin}T23:59:59.999Z`);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Error al cargar historial financiero');
      console.error(error);
    } else {
      let filteredData = data || [];
      
      if (tipoFiltro === 'Ingresos') {
        filteredData = filteredData.filter(t => ['Ingreso', 'Abono', 'Pago Completo'].includes(t.tipo));
      } else if (tipoFiltro === 'Egresos') {
        filteredData = filteredData.filter(t => ['Egreso', 'Reembolso'].includes(t.tipo));
      }

      setTransacciones(filteredData as TransaccionHistorial[]);
    }
    setLoading(false);
  }, [fechaInicio, fechaFin, tipoFiltro]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  return {
    transacciones,
    loading,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    tipoFiltro,
    setTipoFiltro
  };
}
