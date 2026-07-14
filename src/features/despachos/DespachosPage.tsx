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
      <div className="bg-[#faf9f8] flex flex-col h-full rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className={`p-5 border-b border-gray-100 font-medium flex items-center justify-between bg-white/50 backdrop-blur-sm`}>
          <div className="flex items-center gap-2">
            <Icon size={18} className={colorClass} />
            <span className="font-serif uppercase tracking-widest text-[11px] text-charcoal">{title}</span>
          </div>
          <span className="bg-white border border-gray-100 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm text-muted-foreground">{filtered.length}</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-4 min-h-[500px]">
          {filtered.length === 0 ? (
            <p className="font-serif tracking-widest uppercase text-[11px] text-muted-foreground text-center pt-8">No hay pedidos</p>
          ) : (
            filtered.map(v => (
              <div key={v.id} className="bg-white border border-gray-50 p-5 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gold/30 transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-mono text-muted-foreground bg-[#faf9f8] px-2 py-1 rounded-md border border-gray-100">#{v.id.split('-')[0]}</span>
                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${
                    v.estado_pago === 'Pagado' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {v.estado_pago}
                  </span>
                </div>
                
                <h3 className="font-serif text-charcoal text-lg mb-1 line-clamp-1">
                  {v.clientes?.nombre || 'Cliente anónimo'}
                </h3>
                {v.clientes?.telefono && (
                  <p className="text-[12px] text-muted-foreground mb-4 font-mono">
                    Tel: {v.clientes.telefono}
                  </p>
                )}

                <div className="bg-[#faf9f8] p-3 rounded-lg mb-4 border border-gray-50">
                  <p className="text-[10px] font-serif uppercase tracking-widest mb-2 text-muted-foreground">Artículos:</p>
                  <ul className="space-y-1.5">
                    {v.detalle_ventas.map((detalle, idx) => (
                      <li key={idx} className="text-[12px] text-charcoal flex items-start gap-2 leading-tight">
                        <span className="font-bold text-muted-foreground">{detalle.cantidad}x</span> 
                        <span className="line-clamp-2">{detalle.product_variants?.products?.name} <span className="text-muted-foreground italic">- {detalle.product_variants?.variant_name}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <p className="text-[15px] font-serif font-bold text-charcoal">{formatCOP(v.total_cents)}</p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {status === 'Pendiente' && (
                      <button 
                        onClick={() => changeStatus(v.id, 'Enviado')}
                        className="text-[11px] font-medium uppercase tracking-widest bg-charcoal text-white px-4 py-2 rounded-full shadow-md hover:bg-black transition-colors flex items-center gap-1.5"
                      >
                        Enviar <ChevronRight size={14} />
                      </button>
                    )}
                    {status === 'Enviado' && (
                      <button 
                        onClick={() => changeStatus(v.id, 'Entregado')}
                        className="text-[11px] font-medium uppercase tracking-widest bg-green-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-700 transition-colors flex items-center gap-1.5"
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-charcoal flex items-center gap-3">
          <Truck size={28} /> Despachos y Logística
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
