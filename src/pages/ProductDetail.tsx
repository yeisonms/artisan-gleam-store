import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart, formatCOP } from "@/lib/cart";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
}

interface Variant {
  id: string;
  variant_name: string;
  sku: string;
  attributes: Record<string, string>;
  price_cents: number | null;
  stock: number;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  is_custom_request: boolean;
  is_active: boolean;
  category_id: string;
  product_images: ProductImage[];
  product_variants: Variant[];
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (data) {
        setProduct(data as any);
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
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-secondary animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-secondary w-3/4 animate-pulse" />
            <div className="h-4 bg-secondary w-1/2 animate-pulse" />
            <div className="h-20 bg-secondary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Producto no encontrado.</p>
        <Link to="/productos" className="text-gold underline mt-4 inline-block">Volver a productos</Link>
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
      toast.error("Sin stock disponible");
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
    toast.success("Agregado al carrito");
  };

  return (
    <div className="min-h-screen">
      <div className="container py-6 md:py-12">
        <Link to="/productos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft size={16} /> Volver
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square bg-secondary overflow-hidden">
              {images.length > 0 ? (
                <img src={images[selectedImage]?.url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-2xl">MA</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-gold" : "border-transparent"}`}
                  >
                    <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="font-display text-2xl md:text-3xl text-foreground">{product.name}</h1>
            <p className="text-xl text-gold font-display mt-2">
              {product.is_custom_request ? "Cotización personalizada" : formatCOP(currentPrice)}
            </p>

            {product.description && (
              <p className="text-muted-foreground mt-6 leading-relaxed">{product.description}</p>
            )}

            {/* Variants */}
            {!product.is_custom_request && product.product_variants.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Variante</p>
                <div className="flex flex-wrap gap-2">
                  {product.product_variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 text-sm border transition-colors ${
                        selectedVariant?.id === v.id
                          ? "border-gold text-foreground bg-gold/10"
                          : "border-border text-muted-foreground hover:border-foreground"
                      } ${v.stock <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                      disabled={v.stock <= 0}
                    >
                      {v.variant_name}
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedVariant.stock > 0 ? `${selectedVariant.stock} disponibles` : "Agotado"}
                  </p>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="mt-8">
              {product.is_custom_request ? (
                <Link
                  to={`/solicitud-personalizada?producto=${product.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors w-full md:w-auto justify-center"
                >
                  Solicitar Cotización
                </Link>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors w-full md:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={16} /> Agregar al Carrito
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
