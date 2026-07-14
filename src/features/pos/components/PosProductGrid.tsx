import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Image as ImageIcon, Wrench } from 'lucide-react';
import { PosProductVariant } from '../hooks/usePosCart';
import { formatCOP } from '@/lib/cart';

interface PosProductGridProps {
  onAddToCart: (variant: PosProductVariant) => void;
  onOpenServiceModal: () => void;
}

export function PosProductGrid({ onAddToCart, onOpenServiceModal }: PosProductGridProps) {
  const [variants, setVariants] = useState<PosProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Obtenemos productos con sus variantes y su primera imagen (ordenada)
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          is_active,
          product_variants (
            id,
            variant_name,
            sku,
            price_cents,
            stock
          ),
          product_images (
            url,
            sort_order
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Flatten la estructura para tener un array de PosProductVariant
      const flattenedVariants: PosProductVariant[] = [];

      data?.forEach((product: any) => {
        // Encontrar la imagen principal
        let imageUrl = null;
        if (product.product_images && product.product_images.length > 0) {
          const sortedImages = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);
          imageUrl = sortedImages[0].url;
        }

        product.product_variants?.forEach((variant: any) => {
          if (variant.stock > 0) {
            flattenedVariants.push({
              id: variant.id,
              product_id: product.id,
              name: product.name,
              variant_name: variant.variant_name,
              sku: variant.sku,
              price_cents: variant.price_cents !== null ? variant.price_cents : product.price_cents,
              stock: variant.stock,
              image_url: imageUrl,
            });
          }
        });
      });

      setVariants(flattenedVariants);
    } catch (err) {
      console.error('Error fetching variants for POS:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVariants = useMemo(() => {
    if (!searchTerm.trim()) return variants;
    const lowerSearch = searchTerm.toLowerCase();
    
    return variants.filter((v) => 
      v.name.toLowerCase().includes(lowerSearch) || 
      v.variant_name.toLowerCase().includes(lowerSearch) ||
      (v.sku && v.sku.toLowerCase().includes(lowerSearch))
    );
  }, [variants, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-[#faf9f8] border-r border-gray-100">
      {/* Search Header */}
      <div className="p-6 border-b border-gray-100 bg-[#faf9f8] shrink-0">
        <div className="flex justify-between items-center mb-4 gap-4">
          <h2 className="font-serif text-xl text-charcoal">Catálogo POS</h2>
          <button
            onClick={onOpenServiceModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-charcoal hover:bg-gray-50 border border-gray-200 rounded-full transition-all shadow-sm"
          >
            <Wrench size={16} />
            <span className="hidden sm:inline">Agregar Servicio Manual</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-12 pr-4 py-3 text-sm bg-white rounded-full border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-charcoal focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white shadow-sm animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3">
            <Search size={32} className="opacity-20 text-charcoal" />
            <p className="text-sm font-serif tracking-widest uppercase">No se encontraron productos en stock</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
            {filteredVariants.map((variant) => (
              <div
                key={variant.id}
                onClick={() => onAddToCart(variant)}
                className="group cursor-pointer bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 overflow-hidden hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all"
              >
                <div className="aspect-square bg-[#faf9f8] relative overflow-hidden p-3 pb-0">
                  <div className="w-full h-full rounded-t-lg overflow-hidden relative border border-gray-100 border-b-0">
                    {variant.image_url ? (
                      <img 
                        src={variant.image_url} 
                        alt={variant.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-white">
                        <ImageIcon size={32} />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase rounded-full shadow-sm text-charcoal border border-gray-100">
                    Stock: {variant.stock}
                  </div>
                </div>
                <div className="p-4 pt-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 truncate">{variant.name}</p>
                  <p className="text-sm font-serif font-medium text-charcoal truncate">{variant.variant_name}</p>
                  {variant.sku && <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 mt-0.5">SKU: {variant.sku}</p>}
                  <p className="text-sm font-medium text-gold mt-1">{formatCOP(variant.price_cents)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
