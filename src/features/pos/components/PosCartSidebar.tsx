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
    <div className="flex flex-col h-full bg-card shadow-lg z-10 w-full lg:w-[400px] xl:w-[450px] shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h2 className="font-display text-lg flex items-center gap-2">
          <ShoppingBag size={18} /> Carrito POS
        </h2>
        {items.length > 0 && (
          <button 
            onClick={clearCart}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Vaciar todo
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
            <ShoppingBag size={32} className="opacity-20" />
            <p className="text-sm">El carrito está vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.variant.id} className="flex flex-col gap-2 p-3 border border-border bg-background">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <p className="text-sm font-medium leading-tight">{item.variant.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.variant.variant_name}</p>
                  <p className="text-xs text-gold mt-1">{formatCOP(item.variant.price_cents)} c/u</p>
                </div>
                <button 
                  onClick={() => removeItem(item.variant.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center border border-border bg-card">
                  <button 
                    onClick={() => updateQuantity(item.variant.id, -1)}
                    className="p-1 hover:bg-secondary transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.variant.id, 1)}
                    className="p-1 hover:bg-secondary transition-colors"
                    disabled={item.quantity >= item.variant.stock}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-sm font-medium">
                  {formatCOP(item.subtotal_cents)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkout Options & Customer Info */}
      <div className="p-4 border-t border-border bg-muted/10 space-y-4">
        {/* Customer Form */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <UserPlus size={12} /> Datos del Cliente
          </label>
          <input 
            type="text" 
            placeholder="Nombre del cliente *" 
            className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            value={customer.nombre}
            onChange={(e) => setCustomer({ ...customer, nombre: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="email" 
              placeholder="Email (opcional)" 
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
            <input 
              type="tel" 
              placeholder="Teléfono (opcional)" 
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={customer.telefono}
              onChange={(e) => setCustomer({ ...customer, telefono: e.target.value })}
            />
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Canal</label>
            <select 
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={options.canal}
              onChange={(e) => setOptions({ ...options, canal: e.target.value as 'Fisico' | 'Digital' })}
            >
              <option value="Fisico">Tienda Física</option>
              <option value="Digital">Canal Digital (WA/IG)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Pago</label>
            <select 
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
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
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-medium text-muted-foreground">Total a Cobrar</span>
            <span className="text-2xl font-display text-gold">{formatCOP(totalCents)}</span>
          </div>
          <button
            onClick={handleCheckoutClick}
            disabled={loading || items.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard size={18} />
            {loading ? 'Procesando...' : 'Procesar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}
