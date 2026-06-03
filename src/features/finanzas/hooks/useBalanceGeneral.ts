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
    const { data, error } = await supabase.rpc('get_balance_general');
    if (error) {
      toast.error('Error cargando el balance general');
      console.error(error);
    } else {
      setBalance(data as unknown as BalanceGeneral);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return { balance, loading, refetch: fetchBalance };
}
