import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface Variant {
  id: string;
  variant_name: string;
  sku: string;
  attributes: Record<string, string>;
  price_cents: number | null;
  stock: number;
}

interface ProductActionsProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelectVariant: (v: Variant) => void;
  onAddToCart: () => void;
  isCustomRequest: boolean;
  productSlug: string;
}

export default function ProductActions({ 
  variants, 
  selectedVariant, 
  onSelectVariant, 
  onAddToCart, 
  isCustomRequest, 
  productSlug 
}: ProductActionsProps) {
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 space-y-8">
      
      {/* Selector de Variantes */}
      {!isCustomRequest && variants.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-medium text-foreground uppercase tracking-widest">Seleccionar Variante</p>
          <div className="flex flex-wrap gap-3">
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const isOutOfStock = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  onClick={() => onSelectVariant(v)}
                  disabled={isOutOfStock}
                  className={`
                    px-5 py-3 text-sm tracking-wider border transition-all duration-300
                    ${isSelected 
                      ? "border-gold bg-gold/5 text-foreground shadow-sm" 
                      : "border-border text-muted-foreground hover:border-charcoal-light hover:text-charcoal"}
                    ${isOutOfStock ? "opacity-30 cursor-not-allowed line-through" : ""}
                  `}
                >
                  {v.variant_name}
                </button>
              );
            })}
          </div>
          
          {selectedVariant && (
            <div className="flex justify-between items-center text-xs mt-2 text-muted-foreground uppercase tracking-wider">
              <span>{selectedVariant.stock > 0 ? 'Disponible' : 'Agotado'}</span>
              {selectedVariant.sku && <span>SKU: {selectedVariant.sku}</span>}
            </div>
          )}
        </div>
      )}

      {/* Botón de Compra */}
      <div className="pt-2">
        {isCustomRequest ? (
          <Link
            to={`/solicitud-personalizada?producto=${productSlug}`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-charcoal text-white text-sm tracking-widest uppercase hover:bg-black transition-colors"
          >
            Solicitar Cotización
          </Link>
        ) : (
          <button
            onClick={onAddToCart}
            disabled={!selectedVariant || selectedVariant.stock <= 0}
            className="flex items-center justify-center gap-2 w-full py-4 bg-charcoal text-white text-sm tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={18} /> 
            {selectedVariant && selectedVariant.stock <= 0 ? "Agotado" : "Agregar al Carrito"}
          </button>
        )}
      </div>

    </motion.div>
  );
}
