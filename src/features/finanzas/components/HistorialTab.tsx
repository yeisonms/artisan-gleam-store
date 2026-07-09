import { useHistorialFinanzas } from '../hooks/useHistorialFinanzas';
import { formatCOP } from '@/lib/cart';
import { Search, Filter, Calendar } from 'lucide-react';

export default function HistorialTab() {
  const {
    transacciones,
    loading,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    tipoFiltro,
    setTipoFiltro
  } = useHistorialFinanzas();

  const isEgreso = (tipo: string) => ['Egreso', 'Reembolso'].includes(tipo);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-serif text-xl text-charcoal flex items-center gap-3">
          <Search size={24} /> Historial de Movimientos
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Barra de Filtros */}
        <div className="p-6 border-b border-gray-100 bg-[#faf9f8]/50 flex flex-col sm:flex-row flex-wrap gap-4 items-end">
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
              Tipo de Movimiento
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow appearance-none"
              >
                <option value="Todos">Todos (Ingresos y Egresos)</option>
                <option value="Ingresos">Solo Ingresos</option>
                <option value="Egresos">Solo Egresos</option>
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
              Fecha Inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
              Fecha Fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <button 
              onClick={() => { setFechaInicio(''); setFechaFin(''); setTipoFiltro('Todos'); }}
              className="w-full sm:w-auto px-6 py-2.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground hover:text-charcoal border border-transparent hover:border-gray-200 bg-transparent hover:bg-white rounded-lg transition-all"
            >
              Limpiar Filtros
            </button>
          </div>

        </div>

        {/* Tabla */}
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#faf9f8] animate-pulse rounded-lg border border-gray-50" />
            ))}
          </div>
        ) : transacciones.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground space-y-4 bg-white">
            <Search size={48} className="opacity-20 text-charcoal" />
            <p className="font-serif tracking-widest uppercase text-sm">No hay movimientos en este periodo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#faf9f8]/30 text-left">
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase">Fecha / Tipo</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden md:table-cell">Método</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden sm:table-cell">Observaciones</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-[#faf9f8] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-serif font-medium text-charcoal">
                        {new Date(t.created_at).toLocaleString('es-CO', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-medium mt-2 inline-block ${
                        isEgreso(t.tipo) ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell text-[13px]">
                      {t.metodo_pago || '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell text-[13px] max-w-xs truncate">
                      {t.notas || '—'}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${isEgreso(t.tipo) ? 'text-red-500' : 'text-green-600'}`}>
                      {isEgreso(t.tipo) ? '-' : '+'}{formatCOP(t.monto_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
