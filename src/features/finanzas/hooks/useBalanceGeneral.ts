import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BalanceGeneral {
  caja_general: number;
  valor_inventario: number;
  cuentas_por_cobrar: number;
}

export function useBalanceGeneral() {
  const [balance, setBalance] = useState<BalanceGeneral | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    setLoading(true);
    
    // Fetch balance general and all product variants
    const [bgRes, variantsRes] = await Promise.all([
      supabase.rpc('get_balance_general'),
      supabase.from('product_variants' as any).select('stock, cost_cents')
    ]);

    if (bgRes.error) {
      toast.error('Error cargando el balance general');
      console.error(bgRes.error);
    } else {
      const balanceData = bgRes.data as unknown as BalanceGeneral;
      
      // Calculate true inventory value based on cost
      let realInventoryValue = 0;
      if (variantsRes.data) {
        realInventoryValue = variantsRes.data.reduce((sum: number, variant: any) => {
          const cost = variant.cost_cents || 0;
          const stock = variant.stock || 0;
          return sum + (cost * stock);
        }, 0);
      }

      setBalance({
        ...balanceData,
        valor_inventario: realInventoryValue
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return { balance, loading, refetch: fetchBalance };
}
