import { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService: (description: string, priceCents: number) => void;
}

export function ServiceModal({ isOpen, onClose, onAddService }: ServiceModalProps) {
  const [description, setDescription] = useState('');
  const [priceStr, setPriceStr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('La descripción del servicio es requerida');
      return;
    }

    const numericPrice = parseFloat(priceStr.replace(/[^\d]/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0');
      return;
    }

    onAddService(description.trim(), numericPrice * 100);
    setDescription('');
    setPriceStr('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-[#faf9f8] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-charcoal/5 rounded-lg">
              <Wrench size={20} className="text-charcoal" />
            </div>
            <h2 className="font-serif text-xl text-charcoal">Servicio Personalizado</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                id="service-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="peer w-full bg-white border border-gray-200 rounded-xl px-4 pt-6 pb-2 text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all shadow-sm placeholder-transparent"
                placeholder="Descripción (ej. Ajuste de talla)"
                autoComplete="off"
              />
              <label 
                htmlFor="service-desc"
                className="absolute left-4 top-2 text-[10px] font-serif uppercase tracking-widest text-muted-foreground transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:font-sans peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-serif peer-focus:uppercase"
              >
                Descripción del Servicio
              </label>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <input
                type="text"
                id="service-price"
                value={priceStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setPriceStr(val ? parseInt(val).toLocaleString('es-CO') : '');
                }}
                className="peer w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 pt-6 pb-2 text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all shadow-sm placeholder-transparent"
                placeholder="0"
                autoComplete="off"
              />
              <label 
                htmlFor="service-price"
                className="absolute left-8 top-2 text-[10px] font-serif uppercase tracking-widest text-muted-foreground transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:font-sans peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-serif peer-focus:uppercase"
              >
                Precio (COP)
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-charcoal transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-[#1a1a1a] to-black text-white rounded-xl hover:shadow-lg transition-all"
            >
              Añadir al Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
