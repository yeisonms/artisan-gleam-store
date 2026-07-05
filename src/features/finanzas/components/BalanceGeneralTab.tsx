import { useBalanceGeneral } from '../hooks/useBalanceGeneral';
import { formatCOP } from '@/lib/cart';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wallet, Package, HandCoins, Building2 } from 'lucide-react';

const COLORS = ['#22c55e', '#eab308', '#3b82f6']; // Verde (Caja), Amarillo (Inventario), Azul (Cartera)

export default function BalanceGeneralTab() {
  const { balance, loading } = useBalanceGeneral();

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Calculando patrimonio...</div>;
  }

  if (!balance) return null;

  const totalPatrimonio = balance.caja_general + balance.valor_inventario + balance.cuentas_por_cobrar;

  const data = [
    { name: 'Caja General (Liquidez)', value: balance.caja_general },
    { name: 'Inventario (Activos)', value: balance.valor_inventario },
    { name: 'Cartera (Por cobrar)', value: balance.cuentas_por_cobrar },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-black p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Building2 className="text-white" size={80} />
          </div>
          <p className="text-[11px] font-serif text-white/70 uppercase tracking-widest mb-2">Patrimonio Total</p>
          <p className="text-3xl font-serif text-white">{formatCOP(totalPatrimonio)}</p>
        </div>

        <div className="bg-white border border-gray-50 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="text-green-500" size={80} />
          </div>
          <p className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2">Caja General</p>
          <p className="text-3xl font-serif text-charcoal">{formatCOP(balance.caja_general)}</p>
        </div>

        <div className="bg-white border border-gray-50 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Package className="text-yellow-500" size={80} />
          </div>
          <p className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2">Valor Inventario</p>
          <p className="text-3xl font-serif text-charcoal">{formatCOP(balance.valor_inventario)}</p>
        </div>

        <div className="bg-white border border-gray-50 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <HandCoins className="text-blue-500" size={80} />
          </div>
          <p className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2">Cuentas por Cobrar</p>
          <p className="text-3xl font-serif text-charcoal">{formatCOP(balance.cuentas_por_cobrar)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 p-8 h-[450px] flex flex-col">
          <h3 className="font-serif text-xl text-charcoal mb-6">Distribución del Capital</h3>
          {totalPatrimonio === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">No hay capital registrado.</div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCOP(value)}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontFamily: 'serif' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 p-8 flex flex-col">
           <h3 className="font-serif text-xl text-charcoal mb-6">Análisis de Liquidez</h3>
           <div className="space-y-6 flex-1 flex flex-col justify-center">
             <div className="p-4 bg-[#faf9f8] rounded-xl border border-gray-100">
               <p className="text-[13px] text-muted-foreground leading-relaxed">
                 Tu negocio tiene un patrimonio total valorado en <strong className="text-charcoal font-semibold">{formatCOP(totalPatrimonio)}</strong>.
               </p>
             </div>
             <div className="p-4 bg-[#faf9f8] rounded-xl border border-gray-100">
               <p className="text-[13px] text-muted-foreground leading-relaxed">
                 El <strong className="text-green-600 font-semibold">{totalPatrimonio ? ((balance.caja_general / totalPatrimonio) * 100).toFixed(1) : 0}%</strong> de tu patrimonio es dinero líquido (Efectivo/Bancos), disponible para obligaciones inmediatas.
               </p>
             </div>
             <div className="p-4 bg-[#faf9f8] rounded-xl border border-gray-100">
               <p className="text-[13px] text-muted-foreground leading-relaxed">
                 El <strong className="text-yellow-600 font-semibold">{totalPatrimonio ? ((balance.valor_inventario / totalPatrimonio) * 100).toFixed(1) : 0}%</strong> de tu capital está inmovilizado en el inventario actual de joyas. Para liberar este capital, necesitas mover la mercancía.
               </p>
             </div>
             <div className="p-4 bg-[#faf9f8] rounded-xl border border-gray-100">
               <p className="text-[13px] text-muted-foreground leading-relaxed">
                 El <strong className="text-blue-600 font-semibold">{totalPatrimonio ? ((balance.cuentas_por_cobrar / totalPatrimonio) * 100).toFixed(1) : 0}%</strong> de tu capital se encuentra "en la calle", financiado a tus clientes mediante Cartera. Un cobro efectivo convertirá esto en liquidez.
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
