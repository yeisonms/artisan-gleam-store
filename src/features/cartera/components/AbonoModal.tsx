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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-100 w-full max-w-md shadow-2xl rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#faf9f8]/50">
          <h2 className="font-serif text-xl text-charcoal flex items-center gap-3">
            <DollarSign size={20} /> Registrar Abono
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-gray-100 hover:text-charcoal transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 bg-white border-b border-gray-100 space-y-3">
          <p className="text-[13px] font-medium text-charcoal">Cliente: {deuda.cliente?.nombre || 'Desconocido'}</p>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Total Deuda:</span>
            <span className="font-medium text-charcoal">{formatCOP(deuda.total_cents)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Abonado hasta ahora:</span>
            <span className="font-medium text-green-600">{formatCOP(deuda.total_abonado_cents)}</span>
          </div>
          <div className="flex justify-between text-[13px] pt-3 border-t border-gray-100 mt-2">
            <span className="font-medium text-charcoal">Saldo Pendiente:</span>
            <span className="font-bold text-red-500">{formatCOP(deuda.saldo_pendiente_cents)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
                Monto a Abonar (COP) *
              </label>
              <input
                type="number"
                required
                min="1"
                max={Math.round(deuda.saldo_pendiente_cents / 100)}
                className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
                value={montoIngresado}
                onChange={(e) => setMontoIngresado(e.target.value)}
              />
              <p className="text-[11px] font-serif text-muted-foreground mt-2 text-right uppercase tracking-widest">
                Monto a registrar: <strong className="text-charcoal font-bold">{formatCOP((parseInt(montoIngresado) || 0) * 100)}</strong>
              </p>
            </div>

            <div>
              <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
                Método de Pago
              </label>
              <select
                className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow appearance-none"
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
              <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
                Notas (Opcional)
              </label>
              <textarea
                className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow resize-none"
                rows={2}
                placeholder="Ref de transferencia, etc."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-[#faf9f8]/50">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-charcoal hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm bg-gradient-to-br from-[#1a1a1a] to-black text-white rounded-full shadow-xl hover:from-black hover:to-[#111] transition-all disabled:opacity-50"
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
