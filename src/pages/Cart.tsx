import { Link } from "react-router-dom";
import { useCart, formatCOP } from "@/lib/cart";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f8] flex flex-col items-center justify-center container pt-20">
        <div className="bg-white p-16 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center max-w-md w-full border border-border/40">
          <ShoppingBag size={48} className="text-gold/50 mb-6 stroke-[1.5]" />
          <h1 className="font-serif text-2xl text-charcoal mb-3 tracking-wide">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8 text-center text-sm">Aún no has seleccionado ninguna joya para tu colección.</p>
          <Link
            to="/productos"
            className="w-full text-center px-8 py-4 bg-gradient-to-br from-[#1a1a1a] to-black text-white text-sm tracking-widest uppercase hover:from-black hover:to-[#111] transition-all shadow-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)]"
          >
            Explorar Colección
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f8] pt-40 md:pt-48 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-gold/20 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-3 tracking-wide">Tu Carrito</h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Revisa tu selección</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Columna Izquierda: Lista de Productos */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-border/40 p-6 sm:p-8 space-y-6">
            {items.map((item) => (
              <motion.div
                key={item.variantId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0"
              >
                {/* Imagen */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-stone-50 rounded-lg flex-shrink-0 overflow-hidden border border-border/30 relative group">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-serif text-2xl">M A</div>
                  )}
                </div>

                {/* Detalles */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-serif text-lg md:text-xl text-charcoal">{item.productName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.variantName}</p>
                    </div>
                    <span className="text-base md:text-lg font-medium text-charcoal whitespace-nowrap">
                      {formatCOP(item.unitPriceCents * item.quantity)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    {/* Selector tipo Píldora */}
                    <div className="flex items-center gap-4 border border-gray-200 rounded-full px-4 py-1.5 bg-white">
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)} 
                        className="text-muted-foreground hover:text-charcoal transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} strokeWidth={1.5} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center text-charcoal">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)} 
                        className="text-muted-foreground hover:text-charcoal transition-colors"
                      >
                        <Plus size={14} strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* Botón Remover */}
                    <button 
                      onClick={() => removeItem(item.variantId)} 
                      className="text-xs text-muted-foreground uppercase tracking-wider hover:text-destructive hover:underline underline-offset-4 transition-all"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Columna Derecha: Tarjeta de Resumen */}
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 p-8 h-fit sticky top-32">
            <h2 className="font-serif text-xl text-charcoal mb-6 tracking-wide">RESUMEN</h2>
            
            <div className="space-y-4 text-sm text-charcoal/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCOP(totalCents())}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío asegurado</span>
                <span className="text-gold font-medium">Gratis</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 mt-6 pt-6">
              <div className="flex justify-between items-end">
                <span className="font-serif text-xl text-charcoal">Total</span>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block mb-0.5 uppercase tracking-widest">COP</span>
                  <span className="font-serif text-2xl text-charcoal">{formatCOP(totalCents())}</span>
                </div>
              </div>
            </div>
            
            <Link
              to="/checkout"
              className="relative flex items-center justify-center mt-8 w-full text-center px-8 py-4 bg-gradient-to-br from-[#1a1a1a] to-black text-white text-sm tracking-widest uppercase hover:from-black hover:to-[#111] transition-all duration-500 shadow-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <span className="relative z-10">Proceder al Pago</span>
            </Link>

            <div className="mt-6 flex items-center justify-center gap-3 opacity-60">
              <svg className="w-5 h-5 text-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span className="text-[10px] tracking-widest uppercase text-charcoal">Transacción segura</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
