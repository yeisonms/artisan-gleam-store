import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DashboardMetrics {
  ventasDelDiaCents: number;
  carteraActivaCents: number;
  valorInventarioCents: number;
}

export interface ChartData {
  fecha: string;
  total_ingresos: number;
}

export interface CriticalStock {
  id: string;
  variant_name: string;
  stock: number;
  sku: string | null;
  products: {
    name: string;
    product_images?: { url: string }[];
  } | null;
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ventasDelDiaCents: 0,
    carteraActivaCents: 0,
    valorInventarioCents: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [criticalStock, setCriticalStock] = useState<CriticalStock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Ejecutar las RPCs en paralelo (SARGable operations en la BD)
      const [
        { data: ventasDia, error: error1 },
        { data: cartera, error: error2 },
        { data: ingresosChart, error: error4 },
        { data: criticalItems, error: error5 },
        { data: variantsRes, error: error6 },
      ] = await Promise.all([
        supabase.rpc('get_ventas_del_dia'),
        supabase.rpc('get_cartera_activa'),
        supabase.rpc('get_ingresos_7_dias'),
        supabase
          .from('product_variants')
          .select('id, variant_name, stock, sku, products (name, product_images(url))')
          .lt('stock', 3)
          .order('stock', { ascending: true })
          .limit(5),
        supabase.from('product_variants').select('stock, cost_cents')
      ]);

      if (error1 || error2 || error4 || error5 || error6) {
        console.error("Dashboard Errors:", { error1, error2, error4, error5, error6 });
        toast.error('Error al cargar algunas métricas del panel');
      }

      let realInventoryValue = 0;
      if (variantsRes) {
        realInventoryValue = variantsRes.reduce((sum: number, variant: any) => {
          const cost = variant.cost_cents || 0;
          const stock = variant.stock || 0;
          return sum + (cost * stock);
        }, 0);
      }

      setMetrics({
        ventasDelDiaCents: ventasDia || 0,
        carteraActivaCents: cartera || 0,
        valorInventarioCents: realInventoryValue,
      });

      // El RPC retorna un arreglo JSON (puede venir como string o como objeto dependiendo del driver de supabase-js, típicamente parseado)
      if (typeof ingresosChart === 'string') {
        setChartData(JSON.parse(ingresosChart));
      } else {
        setChartData(ingresosChart as ChartData[] || []);
      }

      setCriticalStock((criticalItems as unknown as CriticalStock[]) || []);

    } catch (err: any) {
      console.error('Fetch Metrics Exception:', err);
      toast.error('Error procesando las métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    chartData,
    criticalStock,
    loading,
    refreshMetrics: fetchMetrics,
  };
}
