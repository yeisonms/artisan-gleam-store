import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import ProductGallery, { ProductImage } from "@/features/productos/components/ProductGallery";
import ProductInfo from "@/features/productos/components/ProductInfo";
import ProductActions, { Variant } from "@/features/productos/components/ProductActions";
import ProductDetailsAccordion from "@/features/productos/components/ProductDetailsAccordion";
import ProductWhatsAppBanner from "@/features/productos/components/ProductWhatsAppBanner";
import RelatedProducts from "@/features/productos/components/RelatedProducts";
import ProductShare from "@/features/productos/components/ProductShare";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  is_custom_request: boolean;
  is_active: boolean;
  category_id: string;
  category?: { name: string };
  product_images: ProductImage[];
  product_variants: Variant[];
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    const fetch = async () => {
      // Necesitamos cargar la categoría para las migas de pan
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      
      if (data) {
        // Fetch category name separadamente si la hay
        let categoryName = "Colección";
        if (data.category_id) {
           const { data: catData } = await supabase.from('categories').select('name').eq('id', data.category_id).maybeSingle();
           if (catData) categoryName = catData.name;
        }

        setProduct({ ...data, category: { name: categoryName } } as any);
        
        if ((data as any).product_variants?.length > 0) {
          setSelectedVariant((data as any).product_variants[0]);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[55%_45%] gap-12">
          <div className="aspect-[4/5] bg-secondary animate-pulse" />
          <div className="space-y-6">
            <div className="h-10 bg-secondary w-3/4 animate-pulse" />
            <div className="h-6 bg-secondary w-1/4 animate-pulse" />
            <div className="h-32 bg-secondary animate-pulse mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen pt-32 pb-16 text-center">
        <p className="text-muted-foreground font-display text-xl">Pieza no encontrada.</p>
        <a href="/productos" className="text-charcoal border-b border-charcoal mt-6 inline-block uppercase tracking-widest text-sm hover:text-gold hover:border-gold transition-colors pb-1">
          Volver a la Galería
        </a>
      </div>
    );
  }

  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const currentPrice = selectedVariant?.price_cents ?? product.price_cents;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Selecciona una variante");
      return;
    }
    if (selectedVariant.stock <= 0) {
      toast.error("Pieza sin stock disponible");
      return;
    }
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantName: selectedVariant.variant_name,
      imageUrl: images[0]?.url || "",
      unitPriceCents: currentPrice,
      attributes: selectedVariant.attributes as Record<string, string>,
    });
    toast.success("Pieza añadida a tu bolsa");
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-10 md:pb-16">
        
        {/* CSS Grid 55/45 Layout */}
        <div className="grid md:grid-cols-[55%_45%] gap-10 md:gap-16 lg:gap-24 items-start">
          
          {/* Columna Izquierda: Galería */}
          <div className="md:sticky md:top-24">
            <ProductGallery images={images} productName={product.name} />
          </div>

          {/* Columna Derecha: Información y Compra */}
          <div className="flex flex-col justify-start py-2 md:py-6 mt-6 md:mt-0">
            <ProductInfo 
              name={product.name} 
              price_cents={currentPrice} 
              is_custom_request={product.is_custom_request}
              categoryName={product.category?.name}
            />

            <ProductActions 
              variants={product.product_variants || []}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              onAddToCart={handleAddToCart}
              isCustomRequest={product.is_custom_request}
              productSlug={product.slug}
            />

            <ProductDetailsAccordion 
              description={product.description} 
              attributes={selectedVariant?.attributes} 
            />

            <ProductShare />
          </div>

        </div>

        {/* Secciones adicionales (Inferiores) */}
        <div className="mt-20 md:mt-28 space-y-20 md:space-y-28 border-t border-border/50 pt-16">
          <ProductWhatsAppBanner productName={product.name} />
          <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
        </div>
      </div>
    </div>
  );
}
