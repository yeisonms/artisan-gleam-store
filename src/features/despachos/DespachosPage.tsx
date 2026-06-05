import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Package, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { formatCOP } from '@/lib/cart';

// Tipado según lo que devuelve Supabase con los JOINs
type VentaDespacho = {
  id: string;
  created_at: string;
  estado_entrega: 'Pendiente' | 'Enviado' | 'Entregado';
  estado_pago: string;
  total_cents: number;
  clientes: {
    nombre: string;
    telefono: string | null;
  } | null;
  detalle_ventas: Array<{
    cantidad: number;
    product_variants: {
      variant_name: string;
      products: { name: string } | null;
    } | null;
  }>;
};

export default function DespachosPage() {
  const [ventas, setVentas] = useState<VentaDespacho[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDespachos = async () => {
    setLoading(true);
    // Extraer ventas Digitales (Web) y popular sus relaciones
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        id, 
        created_at, 
        estado_entrega, 
        estado_pago,
        total_cents,
        clientes (nombre, telefono),
        detalle_ventas (
          cantidad,
          product_variants (
            variant_name,
            products (name)
          )
        )
      `)
      .eq('canal', 'Digital')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error cargando despachos');
      console.error(error);
    } else {
      setVentas(data as unknown as VentaDespacho[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDespachos();
  }, []);

  const changeStatus = async (id: string, newStatus: 'Pendiente' | 'Enviado' | 'Entregado') => {
    const { error } = await supabase
      .from('ventas')
      .update({ estado_entrega: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar estado');
    } else {
      toast.success(`Pedido movido a ${newStatus}`);
      fetchDespachos(); // Recargar el tablero
    }
  };

  const Column = ({ title, status, icon: Icon, colorClass }: { title: string, status: string, icon: any, colorClass: string }) => {
    const filtered = ventas.filter(v => v.estado_entrega === status);

    return (
      <div className="bg-secondary/20 flex flex-col h-full rounded-sm border border-border">
        <div className={`p-4 border-b border-border font-medium flex items-center justify-between bg-card`}>
          <div className="flex items-center gap-2">
            <Icon size={18} className={colorClass} />
            <span className="uppercase tracking-wider text-sm">{title}</span>
          </div>
          <span className="bg-secondary text-xs px-2 py-1 rounded-full">{filtered.length}</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[500px]">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center pt-8">No hay pedidos</p>
          ) : (
            filtered.map(v => (
              <div key={v.id} className="bg-card border border-border p-4 shadow-sm hover:border-gold/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-muted-foreground">#{v.id.split('-')[0]}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    v.estado_pago === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {v.estado_pago}
                  </span>
                </div>
                
                <h3 className="font-display text-foreground text-base mb-1">
                  {v.clientes?.nombre || 'Cliente anónimo'}
                </h3>
                {v.clientes?.telefono && (
                  <p className="text-xs text-muted-foreground mb-3 font-mono">
                    Tel: {v.clientes.telefono}
                  </p>
                )}

                <div className="bg-secondary/30 p-2 rounded-sm mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider mb-2 text-muted-foreground">Artículos:</p>
                  <ul className="space-y-1">
                    {v.detalle_ventas.map((detalle, idx) => (
                      <li key={idx} className="text-xs text-foreground flex items-start gap-1">
                        <span className="font-bold">{detalle.cantidad}x</span> 
                        <span>{detalle.product_variants?.products?.name} - {detalle.product_variants?.variant_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <p className="text-sm font-bold text-foreground">{formatCOP(v.total_cents)}</p>
                  <div className="flex gap-2">
                    {status === 'Pendiente' && (
                      <button 
                        onClick={() => changeStatus(v.id, 'Enviado')}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 flex items-center gap-1 hover:bg-blue-700"
                      >
                        Enviar <ChevronRight size={14} />
                      </button>
                    )}
                    {status === 'Enviado' && (
                      <button 
                        onClick={() => changeStatus(v.id, 'Entregado')}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 flex items-center gap-1 hover:bg-green-700"
                      >
                        Entregar <CheckCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground flex items-center gap-2">
          <Truck size={24} /> Despachos y Logística (Web)
        </h1>
      </div>

      {loading ? (
        <div className="h-96 w-full flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Cargando tablero...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <Column title="Para Empacar" status="Pendiente" icon={Clock} colorClass="text-yellow-500" />
          <Column title="En Tránsito" status="Enviado" icon={Package} colorClass="text-blue-500" />
          <Column title="Entregados" status="Entregado" icon={CheckCircle} colorClass="text-green-500" />
        </div>
      )}
    </div>
  );
}
