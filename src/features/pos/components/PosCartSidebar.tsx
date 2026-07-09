import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, UserPlus, CreditCard } from 'lucide-react';
import { PosCartItem } from '../hooks/usePosCart';
import { PosCustomerForm, CheckoutOptions } from '../hooks/usePosCheckout';
import { formatCOP } from '@/lib/cart';

interface PosCartSidebarProps {
  items: PosCartItem[];
  totalCents: number;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
  onProcessCheckout: (customer: PosCustomerForm, options: CheckoutOptions) => Promise<boolean>;
  loading: boolean;
}

export function PosCartSidebar({
  items,
  totalCents,
  removeItem,
  updateQuantity,
  clearCart,
  onProcessCheckout,
  loading,
}: PosCartSidebarProps) {
  const [customer, setCustomer] = useState<PosCustomerForm>({ nombre: '', email: '', telefono: '' });
  const [options, setOptions] = useState<CheckoutOptions>({ canal: 'Fisico', estado_pago: 'Pagado' });

  const handleCheckoutClick = async () => {
    const success = await onProcessCheckout(customer, options);
    if (success) {
      clearCart();
      setCustomer({ nombre: '', email: '', telefono: '' });
      setOptions({ canal: 'Fisico', estado_pago: 'Pagado' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] z-10 w-full lg:w-[400px] xl:w-[450px] shrink-0 border-l border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
        <h2 className="font-serif text-xl flex items-center gap-3 text-charcoal">
          <ShoppingBag size={20} /> Carrito POS
        </h2>
        {items.length > 0 && (
          <button 
            onClick={clearCart}
            className="text-[10px] tracking-widest uppercase font-medium text-muted-foreground hover:text-red-500 transition-colors bg-red-50/50 hover:bg-red-50 px-3 py-1.5 rounded-full"
          >
            Vaciar todo
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#faf9f8]/30">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3">
            <ShoppingBag size={32} className="opacity-20 text-charcoal" />
            <p className="text-sm font-serif tracking-widest uppercase">El carrito está vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.variant.id} className="flex flex-col gap-3 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-3">
                  <p className="text-sm font-serif font-medium text-charcoal leading-tight">{item.variant.name}</p>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">{item.variant.variant_name}</p>
                  <p className="text-sm font-medium text-gold mt-1.5">{formatCOP(item.variant.price_cents)} <span className="text-[10px] text-muted-foreground">c/u</span></p>
                </div>
                <button 
                  onClick={() => removeItem(item.variant.id)}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50">
                <div className="flex items-center bg-[#faf9f8] rounded-full border border-gray-100 p-0.5">
                  <button 
                    onClick={() => updateQuantity(item.variant.id, -1)}
                    className="p-1.5 text-charcoal hover:bg-white rounded-full transition-colors shadow-sm disabled:opacity-30 disabled:shadow-none"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-charcoal">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.variant.id, 1)}
                    className="p-1.5 text-charcoal hover:bg-white rounded-full transition-colors shadow-sm disabled:opacity-30 disabled:shadow-none"
                    disabled={item.quantity >= item.variant.stock}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-sm font-medium text-charcoal">
                  {formatCOP(item.subtotal_cents)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkout Options & Customer Info */}
      <div className="p-6 border-t border-gray-100 bg-white space-y-6">
        {/* Customer Form */}
        <div className="space-y-3">
          <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <UserPlus size={14} /> Datos del Cliente
          </label>
          <input 
            type="text" 
            placeholder="Nombre del cliente *" 
            className="w-full px-4 py-3 text-sm border border-gray-100 bg-[#faf9f8] rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
            value={customer.nombre}
            onChange={(e) => setCustomer({ ...customer, nombre: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="email" 
              placeholder="Email (opcional)" 
              className="w-full px-4 py-3 text-sm border border-gray-100 bg-[#faf9f8] rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
            <input 
              type="tel" 
              placeholder="Teléfono (opcional)" 
              className="w-full px-4 py-3 text-sm border border-gray-100 bg-[#faf9f8] rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
              value={customer.telefono}
              onChange={(e) => setCustomer({ ...customer, telefono: e.target.value })}
            />
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">Canal</label>
            <select 
              className="w-full px-4 py-3 text-sm border border-gray-100 bg-[#faf9f8] rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow appearance-none"
              value={options.canal}
              onChange={(e) => setOptions({ ...options, canal: e.target.value as 'Fisico' | 'Digital' })}
            >
              <option value="Fisico">Tienda Física</option>
              <option value="Digital">Canal Digital (WA/IG)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">Pago</label>
            <select 
              className="w-full px-4 py-3 text-sm border border-gray-100 bg-[#faf9f8] rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow appearance-none"
              value={options.estado_pago}
              onChange={(e) => setOptions({ ...options, estado_pago: e.target.value as 'Pagado' | 'Credito' | 'Abonado' })}
            >
              <option value="Pagado">Pagado 100%</option>
              <option value="Abonado">Abonado (Parcial)</option>
              <option value="Credito">A Crédito</option>
            </select>
          </div>
        </div>

        {/* Totals & Submit */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <span className="text-xs font-serif tracking-widest uppercase text-muted-foreground">Total a Cobrar</span>
            <span className="text-3xl font-serif text-charcoal">{formatCOP(totalCents)}</span>
          </div>
          <button
            onClick={handleCheckoutClick}
            disabled={loading || items.length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#1a1a1a] to-black text-white rounded-full shadow-xl hover:from-black hover:to-[#111] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard size={18} />
            {loading ? 'Procesando...' : 'Procesar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}
