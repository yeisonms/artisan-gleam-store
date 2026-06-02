import { useState, useEffect } from 'react';
import { X, Check, DollarSign } from 'lucide-react';
import { VentaDeuda } from '../hooks/useCartera';
import { formatCOP } from '@/lib/cart';

interface AbonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  deuda: VentaDeuda | null;
  onSave: (
    ventaId: string,
    montoCents: number,
    metodoPago: string,
    notas: string,
    totalVentaCents: number,
    abonosPreviosCents: number
  ) => Promise<boolean>;
}

export function AbonoModal({ isOpen, onClose, deuda, onSave }: AbonoModalProps) {
  const [montoIngresado, setMontoIngresado] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && deuda) {
      // Por defecto sugerimos el saldo pendiente (convertido a pesos para el input)
      setMontoIngresado(Math.round(deuda.saldo_pendiente_cents / 100).toString());
      setMetodoPago('Efectivo');
      setNotas('');
    }
  }, [isOpen, deuda]);

  if (!isOpen || !deuda) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convertir el monto ingresado en pesos a centavos para la base de datos
    const montoCents = (parseInt(montoIngresado) || 0) * 100;
    
    setSaving(true);
    const success = await onSave(
      deuda.id,
      montoCents,
      metodoPago,
      notas,
      deuda.total_cents,
      deuda.total_abonado_cents
    );
    setSaving(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border w-full max-w-md shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <h2 className="font-display text-lg text-foreground flex items-center gap-2">
            <DollarSign size={18} /> Registrar Abono
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 bg-secondary/10 border-b border-border space-y-1">
          <p className="text-sm font-medium">Cliente: {deuda.cliente?.nombre || 'Desconocido'}</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Deuda:</span>
            <span className="font-medium">{formatCOP(deuda.total_cents)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Abonado hasta ahora:</span>
            <span className="font-medium text-green-600">{formatCOP(deuda.total_abonado_cents)}</span>
          </div>
          <div className="flex justify-between text-sm pt-1 border-t border-border mt-1">
            <span className="font-medium">Saldo Pendiente:</span>
            <span className="font-medium text-red-500">{formatCOP(deuda.saldo_pendiente_cents)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Monto a Abonar (COP) *
            </label>
            <input
              type="number"
              required
              min="1"
              max={Math.round(deuda.saldo_pendiente_cents / 100)}
              className="w-full px-3 py-2 text-sm border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              value={montoIngresado}
              onChange={(e) => setMontoIngresado(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              Monto a registrar: <strong className="text-foreground">{formatCOP((parseInt(montoIngresado) || 0) * 100)}</strong>
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Método de Pago
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Notas (Opcional)
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              rows={2}
              placeholder="Ref de transferencia, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Check size={16} />
              {saving ? 'Registrando...' : 'Confirmar Abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
