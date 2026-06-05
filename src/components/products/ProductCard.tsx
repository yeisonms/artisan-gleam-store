import { Link } from "react-router-dom";
import { formatCOP } from "@/lib/cart";
import { motion } from "framer-motion";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl?: string;
  categorySlug?: string;
  isCustomRequest?: boolean;
}

export default function ProductCard({ id, name, slug, priceCents, imageUrl, categorySlug, isCustomRequest }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full"
    >
      <Link to={`/producto/${slug}`} className="group block h-full bg-card rounded-2xl overflow-hidden border border-border/40 hover-lift">
        <div className="aspect-[4/5] overflow-hidden bg-secondary relative">
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10 duration-500" />
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="font-display text-2xl tracking-widest opacity-50">MA</span>
            </div>
          )}
        </div>
        <div className="p-5 md:p-6 text-center">
          <h3 className="font-display text-sm md:text-base tracking-wide text-foreground group-hover:text-gold transition-colors duration-300">
            {name}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 font-light tracking-wide uppercase">
            {isCustomRequest ? "Solicitar cotización" : formatCOP(priceCents)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
