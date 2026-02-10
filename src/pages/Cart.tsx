import { Link } from "react-router-dom";
import { useCart, formatCOP } from "@/lib/cart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center container">
        <ShoppingBag size={48} className="text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl text-foreground mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">Explora nuestra colección y encuentra algo especial.</p>
        <Link
          to="/productos"
          className="px-8 py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors"
        >
          Explorar Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12 min-h-screen">
      <h1 className="font-display text-3xl text-foreground mb-2">Carrito</h1>
      <div className="w-12 h-px bg-gold mb-8" />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.variantId}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 p-4 border border-border bg-card"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-secondary flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-sm">MA</div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-sm text-foreground">{item.productName}</h3>
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1 text-muted-foreground hover:text-foreground">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1 text-muted-foreground hover:text-foreground">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{formatCOP(item.unitPriceCents * item.quantity)}</span>
                    <button onClick={() => removeItem(item.variantId)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="border border-border bg-card p-6 h-fit sticky top-24">
          <h2 className="font-display text-lg text-foreground mb-4">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCOP(totalCents())}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Envío</span>
              <span className="text-gold">Gratis</span>
            </div>
          </div>
          <div className="border-t border-border mt-4 pt-4">
            <div className="flex justify-between font-display text-lg text-foreground">
              <span>Total</span>
              <span>{formatCOP(totalCents())}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="block mt-6 text-center px-8 py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors"
          >
            Proceder al Pago
          </Link>
        </div>
      </div>
    </div>
  );
}
