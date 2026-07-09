import { useState } from 'react';
import { BookOpen, DollarSign } from 'lucide-react';
import { useCartera, VentaDeuda } from './hooks/useCartera';
import { AbonoModal } from './components/AbonoModal';
import { formatCOP } from '@/lib/cart';

export default function CarteraPage() {
  const { deudas, loading, registrarAbono } = useCartera();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<VentaDeuda | null>(null);

  const handleOpenAbono = (deuda: VentaDeuda) => {
    setDeudaSeleccionada(deuda);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-charcoal flex items-center gap-3">
          <BookOpen size={28} /> Cuentas por Cobrar
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-[#faf9f8]/30">
          <p className="text-[13px] text-muted-foreground font-medium">
            Listado de ventas activas en estado <strong className="text-charcoal font-semibold">Crédito</strong> o <strong className="text-charcoal font-semibold">Abonado</strong>.
          </p>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#faf9f8] animate-pulse rounded-lg border border-gray-50" />
            ))}
          </div>
        ) : deudas.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <BookOpen size={48} className="opacity-20 text-charcoal" />
            <p className="font-serif tracking-widest uppercase text-sm">No hay cuentas por cobrar actualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#faf9f8]/50 text-left">
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase">Cliente</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden sm:table-cell">Fecha / Canal</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden md:table-cell">Total Venta</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase">Abonado</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-red-500 uppercase">Saldo</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {deudas.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-[#faf9f8] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-serif font-medium text-charcoal">{d.cliente?.nombre || 'Desconocido'}</p>
                      <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-medium mt-2 inline-block ${
                        d.estado_pago === 'Abonado' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {d.estado_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="text-charcoal text-[13px]">{new Date(d.created_at).toLocaleDateString()}</div>
                      <div className="text-[12px] text-muted-foreground mt-1">{d.canal}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell text-[13px]">
                      {formatCOP(d.total_cents)}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium">
                      {formatCOP(d.total_abonado_cents)}
                    </td>
                    <td className="px-6 py-4 text-red-500 font-bold">
                      {formatCOP(d.saldo_pendiente_cents)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenAbono(d)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium bg-charcoal text-white hover:bg-black rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <DollarSign size={14} /> Registrar Abono
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AbonoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deuda={deudaSeleccionada}
        onSave={registrarAbono}
      />
    </div>
  );
}
