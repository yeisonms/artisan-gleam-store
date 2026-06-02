import { useState } from 'react';
import { X, Check, TrendingDown } from 'lucide-react';
import { formatCOP } from '@/lib/cart';

interface EgresoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (montoCents: number, notas: string, metodoPago: string) => Promise<boolean>;
}

export function EgresoModal({ isOpen, onClose, onSave }: EgresoModalProps) {
  const [montoIngresado, setMontoIngresado] = useState('');
  const [notas, setNotas] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoCents = (parseInt(montoIngresado) || 0) * 100;

    setSaving(true);
    const success = await onSave(montoCents, notas, metodoPago);
    setSaving(false);

    if (success) {
      setMontoIngresado('');
      setNotas('');
      setMetodoPago('Efectivo');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border w-full max-w-md shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-red-500/10">
          <h2 className="font-display text-lg text-red-600 flex items-center gap-2">
            <TrendingDown size={18} /> Registrar Egreso
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Monto del Egreso (COP) *
            </label>
            <input
              type="number"
              required
              min="1"
              className="w-full px-3 py-2 text-sm border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
              value={montoIngresado}
              onChange={(e) => setMontoIngresado(e.target.value)}
              placeholder="Ej. 15000"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              Salida registrada: <strong className="text-red-500">{formatCOP((parseInt(montoIngresado) || 0) * 100)}</strong>
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Descripción del Gasto *
            </label>
            <textarea
              required
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-500"
              rows={2}
              placeholder="Ej. Compra de empaques, Nómina, Recibos..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Método de Pago
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-500"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white hover:opacity-90 disabled:opacity-50"
            >
              <Check size={16} />
              {saving ? 'Guardando...' : 'Confirmar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
