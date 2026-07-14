import { useState } from 'react';
import { usePosCart } from './hooks/usePosCart';
import { usePosCheckout } from './hooks/usePosCheckout';
import { PosProductGrid } from './components/PosProductGrid';
import { PosCartSidebar } from './components/PosCartSidebar';
import { ServiceModal } from './components/ServiceModal';

export default function PosPage() {
  const { items, totalCents, addItem, addCustomService, removeItem, updateQuantity, clearCart } = usePosCart();
  const { processCheckout, loading } = usePosCheckout();
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-secondary/10 relative">
      {/* Columna Izquierda: Grilla de Productos */}
      <div className="flex-1 overflow-hidden h-full flex flex-col">
        <PosProductGrid 
          onAddToCart={addItem} 
          onOpenServiceModal={() => setIsServiceModalOpen(true)}
        />
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

      <ServiceModal 
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onAddService={addCustomService}
      />
    </div>
  );
}
