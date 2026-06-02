import { usePosCart } from './hooks/usePosCart';
import { usePosCheckout } from './hooks/usePosCheckout';
import { PosProductGrid } from './components/PosProductGrid';
import { PosCartSidebar } from './components/PosCartSidebar';

export default function PosPage() {
  const { items, totalCents, addItem, removeItem, updateQuantity, clearCart } = usePosCart();
  const { processCheckout, loading } = usePosCheckout();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-secondary/10">
      {/* Columna Izquierda: Grilla de Productos */}
      <div className="flex-1 overflow-hidden h-full">
        <PosProductGrid onAddToCart={addItem} />
      </div>

      {/* Columna Derecha: Sidebar de Checkout */}
      <PosCartSidebar
        items={items}
        totalCents={totalCents}
        removeItem={removeItem}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        onProcessCheckout={(customer, options) => processCheckout(items, totalCents, customer, options)}
        loading={loading}
      />
    </div>
  );
}
