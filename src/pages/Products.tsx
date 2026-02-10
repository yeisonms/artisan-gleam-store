import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/products/ProductCard";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  is_custom_request: boolean;
  category_id: string;
  product_images: { url: string; sort_order: number }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("categoria") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from("products")
        .select("id, name, slug, price_cents, is_custom_request, category_id, product_images(url, sort_order)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (categorySlug) {
        const cat = categories.find((c) => c.slug === categorySlug);
        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }

      const { data } = await query;
      if (data) setProducts(data as any);
      setLoading(false);
    };

    if (categories.length > 0 || !categorySlug) {
      fetchProducts();
    }
  }, [categorySlug, categories]);

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="min-h-screen">
      <div className="container py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            {currentCategory ? currentCategory.name : "Todas las Joyas"}
          </h1>
          <div className="w-12 h-px bg-gold mt-3" />
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
              !categorySlug
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSearchParams({ categoria: cat.slug })}
              className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
                categorySlug === cat.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-secondary mb-3" />
                <div className="h-4 bg-secondary w-3/4 mb-2" />
                <div className="h-3 bg-secondary w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No hay productos disponibles en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
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
        )}
      </div>
    </div>
  );
}
