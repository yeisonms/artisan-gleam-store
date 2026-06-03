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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary text-primary-foreground p-6 border border-border flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="font-display text-sm tracking-wider uppercase opacity-80">Patrimonio Total</h3>
            <Building2 className="text-gold" size={20} />
          </div>
          <p className="font-display text-2xl lg:text-3xl text-gold">{formatCOP(totalPatrimonio)}</p>
        </div>

        <div className="bg-card p-6 border border-border flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="font-display text-sm tracking-wider uppercase text-muted-foreground">Caja General</h3>
            <Wallet className="text-green-500" size={20} />
          </div>
          <p className="font-display text-2xl text-foreground">{formatCOP(balance.caja_general)}</p>
        </div>

        <div className="bg-card p-6 border border-border flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="font-display text-sm tracking-wider uppercase text-muted-foreground">Valor Inventario</h3>
            <Package className="text-yellow-500" size={20} />
          </div>
          <p className="font-display text-2xl text-foreground">{formatCOP(balance.valor_inventario)}</p>
        </div>

        <div className="bg-card p-6 border border-border flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="font-display text-sm tracking-wider uppercase text-muted-foreground">Cuentas por Cobrar</h3>
            <HandCoins className="text-blue-500" size={20} />
          </div>
          <p className="font-display text-2xl text-foreground">{formatCOP(balance.cuentas_por_cobrar)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border p-6 h-[400px] flex flex-col">
          <h3 className="font-display text-lg text-foreground mb-4">Distribución del Capital</h3>
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
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCOP(value)}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="bg-card border border-border p-6">
           <h3 className="font-display text-lg text-foreground mb-4">Análisis de Liquidez</h3>
           <div className="space-y-4">
             <p className="text-sm text-muted-foreground">
               Tu negocio tiene un patrimonio total valorado en <strong className="text-foreground">{formatCOP(totalPatrimonio)}</strong>.
             </p>
             <p className="text-sm text-muted-foreground">
               El <strong>{totalPatrimonio ? ((balance.caja_general / totalPatrimonio) * 100).toFixed(1) : 0}%</strong> de tu patrimonio es dinero líquido (Efectivo/Bancos), disponible para obligaciones inmediatas.
             </p>
             <p className="text-sm text-muted-foreground">
               El <strong>{totalPatrimonio ? ((balance.valor_inventario / totalPatrimonio) * 100).toFixed(1) : 0}%</strong> de tu capital está inmovilizado en el inventario actual de joyas. Para liberar este capital, necesitas mover la mercancía.
             </p>
             <p className="text-sm text-muted-foreground">
               El <strong>{totalPatrimonio ? ((balance.cuentas_por_cobrar / totalPatrimonio) * 100).toFixed(1) : 0}%</strong> de tu capital se encuentra "en la calle", financiado a tus clientes mediante Cartera. Un cobro efectivo convertirá esto en liquidez.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
