import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/products/ProductCard";
import heroImage from "@/assets/hero-jewelry.jpg";
import marbleTexture from "@/assets/marble-texture.jpg";

interface CategoryItem {
  name: string;
  slug: string;
  image_url: string | null;
}

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  is_custom_request: boolean;
  description: string | null;
  product_images: { url: string; sort_order: number }[];
}

export default function Index() {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price_cents, is_custom_request, description, product_images(url, sort_order)")
        .eq("is_active", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (data) setFeatured(data as any);
    };
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("name, slug, image_url")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setCategories(data);
    };
    fetchFeatured();
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[80vh] md:h-[90vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Joyería artesanal de lujo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative h-full container flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="max-w-3xl"
          >
            <div className="w-16 h-px bg-gold mx-auto mb-8" />
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-gold leading-tight">
              El Arte de la <span className="italic">Joyería</span>
            </h1>
            <p className="mt-6 text-ivory/80 text-base md:text-lg max-w-lg mx-auto leading-relaxed font-sans font-light">
              Piezas únicas elaboradas a mano con los más finos materiales. Cada joya cuenta tu historia.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/productos"
                className="inline-flex items-center px-10 py-3.5 bg-gold text-accent-foreground font-sans text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors"
              >
                Explorar Colección
              </Link>
              <Link
                to="/solicitud-personalizada"
                className="inline-flex items-center px-10 py-3.5 border border-gold text-gold font-sans text-xs tracking-[0.2em] uppercase hover:bg-gold/10 transition-colors"
              >
                Diseño Personalizado
              </Link>
            </div>
            <div className="w-16 h-px bg-gold mx-auto mt-10" />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-background py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl text-gold">Nuestras Colecciones</h2>
            <div className="w-16 h-px bg-gold mx-auto mt-5" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={`/productos?categoria=${cat.slug}`}
                  className="block group aspect-[3/4] relative overflow-hidden"
                >
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-charcoal" />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                    <div className="w-8 h-px bg-gold mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="font-display text-sm md:text-base tracking-[0.2em] uppercase text-gold drop-shadow-lg">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="bg-background pb-20 md:pb-28">
          <div className="container">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <h2 className="font-display text-3xl md:text-4xl text-gold">Piezas Destacadas</h2>
              <div className="w-16 h-px bg-gold mx-auto mt-5" />
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  priceCents={product.price_cents}
                  imageUrl={product.product_images?.[0]?.url}
                  isCustomRequest={product.is_custom_request}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/productos"
                className="inline-flex items-center px-10 py-3.5 border border-gold text-gold text-xs tracking-[0.2em] uppercase hover:bg-gold/10 transition-colors font-sans"
              >
                Ver Toda la Colección
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Brand statement with marble */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img
          src={marbleTexture}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative container text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-px bg-gold mx-auto mb-10" />
            <p className="font-display text-xl md:text-3xl italic leading-relaxed text-gold/90">
              "Cada pieza de Magna Arte es una obra maestra artesanal, diseñada para trascender el tiempo y celebrar los momentos más preciados de tu vida."
            </p>
            <div className="w-16 h-px bg-gold mx-auto mt-10 mb-10" />
            <Link
              to="/productos"
              className="inline-flex items-center px-10 py-3.5 border border-gold text-gold text-xs tracking-[0.2em] uppercase hover:bg-gold/10 transition-colors font-sans"
            >
              Ver Toda la Colección
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
