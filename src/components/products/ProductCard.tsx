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
      transition={{ duration: 0.5 }}
    >
      <Link to={`/producto/${slug}`} className="group block">
        <div className="aspect-square overflow-hidden bg-secondary mb-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="font-display text-lg">MA</span>
            </div>
          )}
        </div>
        <h3 className="font-display text-sm md:text-base tracking-wide text-foreground group-hover:text-gold transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isCustomRequest ? "Solicitar cotización" : formatCOP(priceCents)}
        </p>
      </Link>
    </motion.div>
  );
}
