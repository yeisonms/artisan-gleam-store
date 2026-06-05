import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Image as ImageIcon } from 'lucide-react';
import { PosProductVariant } from '../hooks/usePosCart';
import { formatCOP } from '@/lib/cart';

interface PosProductGridProps {
  onAddToCart: (variant: PosProductVariant) => void;
}

export function PosProductGrid({ onAddToCart }: PosProductGridProps) {
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
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-10 pr-4 py-2 border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-secondary animate-pulse rounded border border-border" />
            ))}
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
            <Search size={32} className="opacity-20" />
            <p className="text-sm">No se encontraron productos en stock</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {filteredVariants.map((variant) => (
              <div
                key={variant.id}
                onClick={() => onAddToCart(variant)}
                className="group cursor-pointer border border-border bg-card overflow-hidden hover:border-gold hover:shadow-sm transition-all"
              >
                <div className="aspect-square bg-secondary relative">
                  {variant.image_url ? (
                    <img 
                      src={variant.image_url} 
                      alt={variant.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-background/90 px-1.5 py-0.5 text-[10px] font-medium border border-border">
                    Stock: {variant.stock}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-0.5 truncate">{variant.name}</p>
                  <p className="text-sm font-medium text-foreground truncate">{variant.variant_name}</p>
                  {variant.sku && <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 mt-0.5">SKU: {variant.sku}</p>}
                  <p className="text-sm text-gold mt-1.5">{formatCOP(variant.price_cents)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
