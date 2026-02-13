import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart, formatCOP } from "@/lib/cart";
import { ShoppingBag, Minus, Plus } from "lucide-react";
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
  categories?: { name: string; slug: string } | null;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*), categories(name, slug)")
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
  const categoryName = (product as any).categories?.name;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Selecciona una variante");
      return;
    }
    if (selectedVariant.stock <= 0) {
      toast.error("Sin stock disponible");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem({
        variantId: selectedVariant.id,
        productId: product.id,
        productName: product.name,
        variantName: selectedVariant.variant_name,
        imageUrl: images[0]?.url || "",
        unitPriceCents: currentPrice,
        attributes: selectedVariant.attributes as Record<string, string>,
      });
    }
    toast.success(`${quantity > 1 ? quantity + " unidades agregadas" : "Agregado"} al carrito`);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen">
      <div className="container py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>»</span>
          <Link to="/productos" className="hover:text-foreground transition-colors">Tienda</Link>
          {categoryName && (
            <>
              <span>»</span>
              <span className="hover:text-foreground transition-colors">{categoryName}</span>
            </>
          )}
          <span>»</span>
          <span className="text-foreground truncate max-w-[200px] md:max-w-none">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 md:gap-14">
          {/* Gallery: thumbnails left + main image */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            {/* Vertical thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3 w-20 shrink-0">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-all ${
                      i === selectedImage ? "border-gold shadow-md" : "border-border/50 hover:border-foreground/30"
                    }`}
                  >
                    <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 aspect-square bg-secondary overflow-hidden relative group">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-3xl">MA</div>
              )}
              {selectedVariant?.sku && (
                <span className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 backdrop-blur-sm">
                  {selectedVariant.sku}
                </span>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex flex-col">
            <h1 className="font-display text-2xl md:text-4xl text-foreground leading-tight">{product.name}</h1>

            <p className="text-2xl text-gold font-display mt-4">
              {product.is_custom_request ? "Cotización personalizada" : `Desde ${formatCOP(currentPrice)}`}
            </p>

            {product.description && (
              <p className="text-muted-foreground mt-6 leading-relaxed text-[15px]">{product.description}</p>
            )}

            {/* Variants */}
            {!product.is_custom_request && product.product_variants.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-foreground mb-3 tracking-wide">Variante:</p>
                <div className="flex flex-wrap gap-2">
                  {product.product_variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-5 py-2.5 text-sm border transition-all ${
                        selectedVariant?.id === v.id
                          ? "border-gold text-foreground bg-gold/10"
                          : "border-border text-muted-foreground hover:border-foreground"
                      } ${v.stock <= 0 ? "opacity-40 cursor-not-allowed line-through" : ""}`}
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

            {/* Quantity + CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {product.is_custom_request ? (
                <Link
                  to={`/solicitud-personalizada?producto=${product.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors justify-center font-medium"
                >
                  Solicitar Cotización
                </Link>
              ) : (
                <>
                  {/* Quantity selector */}
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-11 h-11 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 h-11 flex items-center justify-center text-sm font-medium border-x border-border">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 10, q + 1))}
                      className="w-11 h-11 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors justify-center disabled:opacity-40 disabled:cursor-not-allowed font-medium flex-1 sm:flex-initial"
                  >
                    <ShoppingBag size={16} /> AÑADIR AL CARRITO
                  </button>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border mt-10 pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Imagen protegida por derechos de autor. Prohibida su reproducción sin autorización.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
