import { useState } from 'react';
import { LineChart, TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
import { useFinanzas } from './hooks/useFinanzas';
import { EgresoModal } from './components/EgresoModal';
import { IngresoModal } from './components/IngresoModal';
import { formatCOP } from '@/lib/cart';
import BalanceGeneralTab from './components/BalanceGeneralTab';

export default function FinanzasPage() {
  const { transacciones, loading, kpis, registrarEgreso, registrarIngreso } = useFinanzas();
  const [isEgresoModalOpen, setIsEgresoModalOpen] = useState(false);
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'flujo'|'balance'>('balance');

  // Helper para pintar de colores los tipos
  const isEgreso = (tipo: string) => ['Egreso', 'Reembolso'].includes(tipo);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-foreground flex items-center gap-2">
          Módulo Financiero
        </h1>
        <div className="flex gap-2 bg-secondary/50 p-1 rounded border border-border">
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-4 py-2 text-sm transition-colors rounded-sm ${activeTab === 'balance' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Balance Patrimonial
          </button>
          <button
            onClick={() => setActiveTab('flujo')}
            className={`px-4 py-2 text-sm transition-colors rounded-sm ${activeTab === 'flujo' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Flujo de Caja (Mes)
          </button>
        </div>
      </div>

      {activeTab === 'balance' && <BalanceGeneralTab />}

      {activeTab === 'flujo' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-display text-lg text-foreground flex items-center gap-2">
              <LineChart size={20} /> Resumen de Caja Chica
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsIngresoModalOpen(true)}
                className="inline-flex items-center justify-center flex-1 sm:flex-none gap-1.5 px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus size={16} /> Nuevo Ingreso
              </button>
              <button
                onClick={() => setIsEgresoModalOpen(true)}
                className="inline-flex items-center justify-center flex-1 sm:flex-none gap-1.5 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                <Plus size={16} /> Nuevo Egreso
              </button>
            </div>
          </div>

      {/* Tarjetas de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={64} className="text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Ingresos Totales</p>
          <p className="text-3xl font-display text-green-600">
            {formatCOP(kpis.ingresosTotalesCents)}
          </p>
        </div>

        <div className="bg-card border border-border p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingDown size={64} className="text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Egresos Totales</p>
          <p className="text-3xl font-display text-red-600">
            {formatCOP(kpis.egresosTotalesCents)}
          </p>
        </div>

        <div className="bg-primary text-primary-foreground p-5 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={64} />
          </div>
          <p className="text-sm text-primary-foreground/70 uppercase tracking-wider mb-1">Balance Neto</p>
          <p className="text-3xl font-display">
            {formatCOP(kpis.balanceNetoCents)}
          </p>
        </div>
      </div>

      {/* Tabla de Libro Mayor */}
      <div className="bg-card border border-border shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-display text-lg text-foreground">Libro Mayor de Transacciones</h2>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-secondary animate-pulse rounded border border-border/50" />
            ))}
          </div>
        ) : transacciones.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <Wallet size={48} className="opacity-20" />
            <p>No hay transacciones registradas en este mes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs">Fecha</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs">Tipo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden sm:table-cell">Descripción / Notas</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">Método</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((t) => {
                  const out = isEgreso(t.tipo);
                  return (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${
                          out ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {t.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell max-w-xs truncate">
                        {t.notas || '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {t.metodo_pago || '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${out ? 'text-red-500' : 'text-green-600'}`}>
                        {out ? '-' : '+'}{formatCOP(t.monto_cents)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )}
      <EgresoModal
        isOpen={isEgresoModalOpen}
        onClose={() => setIsEgresoModalOpen(false)}
        onSave={registrarEgreso}
      />
      <IngresoModal
        isOpen={isIngresoModalOpen}
        onClose={() => setIsIngresoModalOpen(false)}
        onSave={registrarIngreso}
      />
    </div>
  );
}
