import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { formatCOP } from '@/lib/cart';
import { LineChart as LineIcon, Activity, AlertTriangle, Box, DollarSign } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  TooltipProps 
} from 'recharts';

// Custom Tooltip para el gráfico de Recharts (formateo COP)
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-sm rounded-xl border border-gray-50">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-serif font-medium text-charcoal">
          {formatCOP(payload[0].value || 0)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { metrics, chartData, criticalStock, loading } = useDashboardMetrics();

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="h-8 w-48 bg-secondary animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-secondary animate-pulse border border-border"></div>
          <div className="h-28 bg-secondary animate-pulse border border-border"></div>
          <div className="h-28 bg-secondary animate-pulse border border-border"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-secondary animate-pulse border border-border"></div>
          <div className="h-[400px] bg-secondary animate-pulse border border-border"></div>
        </div>
      </div>
    );
  }

  // Pre-procesar data del chart (asegurar que las fechas cortas se vean bien y el total sea numérico)
  const formattedChartData = chartData.map(item => {
    // Tomar solo el mes y día para el XAxis (ej. '06-01') si la fecha es 'YYYY-MM-DD'
    const shortDate = item.fecha.split('-').slice(1).join('/');
    return {
      fechaVisual: shortDate,
      total: Number(item.total_ingresos || 0),
    };
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-charcoal flex items-center gap-3">
           Dashboard Analítico
        </h1>
      </div>

      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={80} className="text-gold" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Ventas del Día</p>
          <p className="text-4xl font-serif text-charcoal">
            {formatCOP(metrics.ventasDelDiaCents)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={80} className="text-red-500" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Cartera Activa</p>
          <p className="text-4xl font-serif text-red-500">
            {formatCOP(metrics.carteraActivaCents)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-black p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Box size={80} className="text-white" />
          </div>
          <p className="text-xs text-white/70 uppercase tracking-widest font-medium mb-3">Valor Total Inventario</p>
          <p className="text-4xl font-serif text-white">
            {formatCOP(metrics.valorInventarioCents)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Tendencias */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
            Ingresos (Últimos 7 Días)
          </h2>
          <div className="h-[320px] w-full">
            {formattedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="fechaVisual" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `$${value / 100000}k`} // Formateo simple para el eje Y
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--gold))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--gold))', r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border">
                No hay datos de ingresos en los últimos 7 días
              </div>
            )}
          </div>
        </div>

        {/* Panel Operativo - Alertas */}
        <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" />
            Alertas de Stock
          </h2>
          
          <div className="flex-1 overflow-y-auto">
            {criticalStock.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm space-y-2 py-8">
                <Box size={32} className="opacity-20" />
                <p>El inventario está saludable.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalStock.map((item) => {
                  const imageUrl = item.products?.product_images?.[0]?.url;
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-[#faf9f8] hover:bg-gray-50 transition-colors">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.products?.name || "Producto"} className="w-12 h-12 object-cover rounded-md shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-white flex items-center justify-center rounded-md border border-gray-100 shrink-0">
                          <Box size={18} className="text-muted-foreground opacity-50" />
                        </div>
                      )}
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs text-muted-foreground truncate">{item.products?.name}</p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.variant_name} {item.sku && <span className="text-xs text-muted-foreground font-normal ml-1">({item.sku})</span>}
                        </p>
                      </div>
                      <div className={`px-2 py-1 text-xs font-bold rounded-sm shrink-0 ${
                        item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.stock} u.
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {criticalStock.length > 0 && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center pt-5 border-t border-gray-100 mt-5">
              Mostrando los 5 productos con menor stock.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
