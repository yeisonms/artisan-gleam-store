import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/products/ProductCard";
import heroImage from "@/assets/hero-jewelry.jpg";

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
  product_images: { url: string; sort_order: number }[];
}

export default function Index() {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price_cents, is_custom_request, product_images(url, sort_order)")
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
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Joyería artesanal de lujo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
        <div className="relative h-full container flex flex-col justify-end pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary-foreground leading-tight max-w-2xl">
              El Arte de la <span className="text-gold italic">Joyería</span>
            </h1>
            <p className="mt-4 text-primary-foreground/80 text-base md:text-lg max-w-md leading-relaxed">
              Piezas únicas elaboradas a mano con los más finos materiales. Cada joya cuenta tu historia.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/productos"
                className="inline-flex items-center px-8 py-3 bg-gold text-accent-foreground font-sans text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors"
              >
                Explorar Colección
              </Link>
              <Link
                to="/solicitud-personalizada"
                className="inline-flex items-center px-8 py-3 border border-primary-foreground/40 text-primary-foreground font-sans text-sm tracking-widest uppercase hover:bg-primary-foreground/10 transition-colors"
              >
                Diseño Personalizado
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-4xl text-foreground">Nuestras Colecciones</h2>
          <div className="w-12 h-px bg-gold mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
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
                className="block group aspect-[3/4] bg-secondary relative overflow-hidden"
              >
                {cat.image_url && (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-sm md:text-base tracking-widest uppercase text-primary-foreground group-hover:text-gold transition-colors text-center px-4 drop-shadow-md">
                    {cat.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-2xl md:text-4xl text-foreground">Piezas Destacadas</h2>
            <div className="w-12 h-px bg-gold mx-auto mt-4" />
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

          <div className="text-center mt-10">
            <Link
              to="/productos"
              className="inline-flex items-center px-8 py-3 border border-border text-foreground text-sm tracking-widest uppercase hover:bg-secondary transition-colors"
            >
              Ver Toda la Colección
            </Link>
          </div>
        </section>
      )}

      {/* Brand statement */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-12 h-px bg-gold mx-auto mb-8" />
            <p className="font-display text-xl md:text-2xl italic leading-relaxed text-primary-foreground/90">
              "Cada pieza de Magna Arte es una obra maestra artesanal, diseñada para trascender el tiempo y celebrar los momentos más preciados de tu vida."
            </p>
            <div className="w-12 h-px bg-gold mx-auto mt-8" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
