import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VentasFilters {
  search: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  channel: string;
  paymentStatus: string;
}

export function useHistorialVentas(filters: VentasFilters) {
  return useQuery({
    queryKey: ['historial-ventas', filters],
    queryFn: async () => {
      // Usamos 'any' porque las tablas no están en types.ts aún
      let query = supabase
        .from('ventas' as any)
        .select(`
          *,
          clientes!inner (
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        // En Supabase, para buscar en una relación hay que hacerlo con un inner join, 
        // pero la sintaxis simple de filter sobre una relación (clientes.nombre)
        // puede requerir configuración adicional o inner joins. 
        // Si falla, consideraremos ignorarlo aquí y filtrar en frontend,
        // pero probaremos la sintaxis de PostgREST primero.
        query = query.ilike('clientes.nombre', `%${filters.search}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setDate(toDate.getDate() + 1);
        query = query.lte('created_at', toDate.toISOString());
      }

      if (filters.channel && filters.channel !== 'todos') {
        const canalFormat = filters.channel === 'fisico' ? 'Fisico' : 'Digital';
        query = query.eq('canal', canalFormat);
      }

      if (filters.paymentStatus && filters.paymentStatus !== 'todos') {
        const statusMap: Record<string, string> = {
          'paid': 'Pagado',
          'pending_payment': 'Credito',
          'canceled': 'Cancelado',
          'abonado': 'Abonado'
        };
        const mappedStatus = statusMap[filters.paymentStatus] || filters.paymentStatus;
        query = query.eq('estado_pago', mappedStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching historial ventas", error);
        throw error;
      }

      return data;
    },
  });
}
