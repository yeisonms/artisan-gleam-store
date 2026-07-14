import { useState } from 'react';
import { LineChart, TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
import { useFinanzas } from './hooks/useFinanzas';
import { EgresoModal } from './components/EgresoModal';
import { IngresoModal } from './components/IngresoModal';
import { formatCOP } from '@/lib/cart';
import BalanceGeneralTab from './components/BalanceGeneralTab';
import HistorialTab from './components/HistorialTab';

export default function FinanzasPage() {
  const { transacciones, loading, kpis, registrarEgreso, registrarIngreso } = useFinanzas();
  const [isEgresoModalOpen, setIsEgresoModalOpen] = useState(false);
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'flujo'|'balance'|'historial'>('balance');

  // Helper para pintar de colores los tipos
  const isEgreso = (tipo: string) => ['Egreso', 'Reembolso'].includes(tipo);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <h1 className="font-serif text-3xl text-charcoal flex items-center gap-3">
          Módulo Financiero
        </h1>
        <div className="flex gap-1.5 bg-[#faf9f8] p-1.5 rounded-full border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-6 py-2.5 text-sm font-medium transition-all rounded-full ${activeTab === 'balance' ? 'bg-white text-charcoal shadow-sm border border-gray-50' : 'text-muted-foreground hover:text-charcoal hover:bg-gray-50/50'}`}
          >
            Balance Patrimonial
          </button>
          <button
            onClick={() => setActiveTab('flujo')}
            className={`px-6 py-2.5 text-sm font-medium transition-all rounded-full ${activeTab === 'flujo' ? 'bg-white text-charcoal shadow-sm border border-gray-50' : 'text-muted-foreground hover:text-charcoal hover:bg-gray-50/50'}`}
          >
            Flujo de Caja
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`px-6 py-2.5 text-sm font-medium transition-all rounded-full ${activeTab === 'historial' ? 'bg-white text-charcoal shadow-sm border border-gray-50' : 'text-muted-foreground hover:text-charcoal hover:bg-gray-50/50'}`}
          >
            Historial
          </button>
        </div>
      </div>

      {activeTab === 'balance' && <BalanceGeneralTab />}

      {activeTab === 'historial' && <HistorialTab />}

      {activeTab === 'flujo' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-serif text-xl text-charcoal flex items-center gap-3">
              <LineChart size={24} /> Resumen de Caja Chica
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsIngresoModalOpen(true)}
                className="inline-flex items-center justify-center flex-1 sm:flex-none gap-2 px-6 py-2.5 text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200/50 rounded-full transition-all shadow-sm"
              >
                <Plus size={16} /> Nuevo Ingreso
              </button>
              <button
                onClick={() => setIsEgresoModalOpen(true)}
                className="inline-flex items-center justify-center flex-1 sm:flex-none gap-2 px-6 py-2.5 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 rounded-full transition-all shadow-sm"
              >
                <Plus size={16} /> Nuevo Egreso
              </button>
            </div>
          </div>

      {/* Tarjetas de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-50 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp size={80} className="text-green-500" />
          </div>
          <p className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2">Ingresos Totales</p>
          <p className="text-3xl font-serif text-charcoal">
            {formatCOP(kpis.ingresosTotalesCents)}
          </p>
        </div>

        <div className="bg-white border border-gray-50 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TrendingDown size={80} className="text-red-500" />
          </div>
          <p className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2">Egresos Totales</p>
          <p className="text-3xl font-serif text-charcoal">
            {formatCOP(kpis.egresosTotalesCents)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-black p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Wallet size={80} className="text-white" />
          </div>
          <p className="text-[11px] font-serif text-white/70 uppercase tracking-widest mb-2">Balance Neto</p>
          <p className="text-3xl font-serif text-white">
            {formatCOP(kpis.balanceNetoCents)}
          </p>
        </div>
      </div>

      {/* Tabla de Libro Mayor */}
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-[#faf9f8]/30">
          <h2 className="font-serif text-xl text-charcoal">Libro Mayor de Transacciones</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#faf9f8] animate-pulse rounded-lg border border-gray-50" />
            ))}
          </div>
        ) : transacciones.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Wallet size={48} className="opacity-20 text-charcoal" />
            <p className="font-serif tracking-widest uppercase text-sm">No hay transacciones registradas en este mes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#faf9f8]/50 text-left">
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase">Fecha</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase">Tipo</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden sm:table-cell">Descripción / Notas</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden md:table-cell">Método</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((t) => {
                  const out = isEgreso(t.tipo);
                  return (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-[#faf9f8] transition-colors group">
                      <td className="px-6 py-4 text-muted-foreground text-[13px]">
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-medium ${
                          out ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {t.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell max-w-xs truncate text-[13px] text-charcoal">
                        {t.notas || '—'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground hidden md:table-cell text-[13px]">
                        {t.metodo_pago || '—'}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${out ? 'text-red-500' : 'text-green-600'}`}>
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
