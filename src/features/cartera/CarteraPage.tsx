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
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground flex items-center gap-2">
          <BookOpen size={24} /> Cuentas por Cobrar (Cartera)
        </h1>
      </div>

      <div className="bg-card border border-border shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Listado de ventas activas en estado <strong>Crédito</strong> o <strong>Abonado</strong>.
          </p>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-secondary animate-pulse rounded border border-border/50" />
            ))}
          </div>
        ) : deudas.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <BookOpen size={48} className="opacity-20" />
            <p>No hay cuentas por cobrar actualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs">Cliente</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden sm:table-cell">Fecha / Canal</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">Total Venta</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs">Abonado</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs text-red-500">Saldo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {deudas.map((d) => (
                  <tr key={d.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{d.cliente?.nombre || 'Desconocido'}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                        d.estado_pago === 'Abonado' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {d.estado_pago}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground/70">{d.canal}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatCOP(d.total_cents)}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      {formatCOP(d.total_abonado_cents)}
                    </td>
                    <td className="px-4 py-3 text-red-500 font-bold">
                      {formatCOP(d.saldo_pendiente_cents)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenAbono(d)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
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
