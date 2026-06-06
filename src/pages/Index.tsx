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
      <section className="relative h-[80vh] md:h-[95vh] overflow-hidden bg-charcoal pt-24 md:pt-32">
        <img
          src={heroImage}
          alt="Joyería artesanal de lujo"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        <div className="relative h-full container flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="max-w-4xl px-4 flex flex-col items-center"
          >
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="w-24 h-[1px] bg-gold mx-auto mb-8 origin-center" 
            />
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-gold font-display mb-6 tracking-wide drop-shadow-lg">
              El Arte de la <span className="italic font-light">Joyería</span>
            </h1>

            <p className="mt-4 text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-sans font-light tracking-wide">
              Piezas únicas elaboradas a mano con los más finos materiales.<br/>
              Cada joya cuenta tu historia.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Link
                to="/productos"
                className="inline-flex items-center justify-center px-10 py-4 bg-gold text-[#1a1a1a] font-sans font-medium text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-gold-light transition-all duration-500 rounded-sm hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/20"
              >
                Explorar Colección
              </Link>
              <Link
                to="/solicitud-personalizada"
                className="inline-flex items-center justify-center px-10 py-4 bg-black/60 backdrop-blur-md border border-gold/50 text-white font-sans text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-black/80 hover:border-gold transition-all duration-500 rounded-sm hover:-translate-y-1 shadow-lg"
              >
                Diseño Personalizado
              </Link>
            </div>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="w-24 h-[1px] bg-gold mx-auto mt-12 origin-center" 
            />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-background py-24 md:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-medium">Nuestras Colecciones</h2>
            <div className="w-16 h-[2px] bg-gold mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
              >
                <Link
                  to={`/productos?categoria=${cat.slug}`}
                  className="block group aspect-[4/5] relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-secondary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6 text-center">
                    <div className="w-8 h-[1px] bg-gold mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0" />
                    <span className="font-display text-lg md:text-xl tracking-[0.15em] uppercase text-white drop-shadow-md">
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
        <section className="bg-background pb-24 md:pb-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 md:mb-24"
            >
              <h2 className="font-display text-4xl md:text-5xl text-foreground font-medium">Piezas Destacadas</h2>
              <div className="w-16 h-[2px] bg-gold mx-auto mt-6" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featured.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    priceCents={product.price_cents}
                    imageUrl={product.product_images?.[0]?.url}
                    isCustomRequest={product.is_custom_request}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-20"
            >
              <Link
                to="/productos"
                className="inline-flex items-center px-12 py-4 border border-foreground/20 text-foreground text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-all duration-500 rounded-sm"
              >
                Descubrir Toda la Colección
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Brand statement */}
      <section className="relative py-32 md:py-48 overflow-hidden bg-black text-white">
        <img
          src={marbleTexture}
          alt="Marble Texture"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
        <div className="relative container text-center max-w-4xl mx-auto px-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-[1px] bg-gold mx-auto mb-10" />
            <p className="font-display text-2xl md:text-4xl lg:text-5xl italic leading-relaxed text-gold font-light">
              "Cada pieza de Magna Arte es una obra maestra artesanal, diseñada para trascender el tiempo y celebrar los momentos más preciados de tu vida."
            </p>
            <div className="w-16 h-[1px] bg-gold mx-auto mt-10 mb-14" />
            <Link
              to="/productos"
              className="inline-flex items-center px-10 py-4 border border-gold text-gold text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-gold/10 transition-all duration-500 rounded-sm"
            >
              Ver Toda la Colección
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
