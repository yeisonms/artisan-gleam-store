import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/products/ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string | null;
}

export default function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("products")
          .select("*, product_images(*)")
          .eq("is_active", true)
          .neq("id", currentProductId)
          .limit(4);

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data } = await query;
        
        if (data && data.length > 0) {
          setProducts(data);
        } else if (categoryId) {
          // Si no hay relacionados de la misma categoría, traer cualquiera
          const { data: fallbackData } = await supabase
            .from("products")
            .select("*, product_images(*)")
            .eq("is_active", true)
            .neq("id", currentProductId)
            .limit(4);
          
          if (fallbackData) setProducts(fallbackData);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId) {
      fetchRelated();
    }
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <section className="w-full">
        <h2 className="text-center font-serif text-xl text-gray-800 uppercase tracking-widest mb-8">
          PRODUCTOS RELACIONADOS
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="w-full">
      <h2 className="text-center font-serif text-xl text-gray-800 uppercase tracking-widest mb-8">
        PRODUCTOS RELACIONADOS
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const mainImage = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url;
          return (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              priceCents={product.price_cents}
              imageUrl={mainImage || "/placeholder.svg"}
              isCustomRequest={product.is_custom_request}
            />
          );
        })}
      </div>
    </section>
  );
}
