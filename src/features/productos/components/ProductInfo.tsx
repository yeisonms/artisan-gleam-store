import { Link } from 'react-router-dom';
import { formatCOP } from '@/lib/cart';
import { motion } from 'framer-motion';

interface ProductInfoProps {
  name: string;
  price_cents: number;
  is_custom_request: boolean;
  categoryName?: string;
}

export default function ProductInfo({ name, price_cents, is_custom_request, categoryName }: ProductInfoProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Migas de pan */}
      <nav className="text-xs uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-gold transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/productos" className="hover:text-gold transition-colors">Joyas</Link>
        {categoryName && (
          <>
            <span>/</span>
            <span className="text-foreground">{categoryName}</span>
          </>
        )}
      </nav>

      {/* Título Principal */}
      <h1 className="font-display text-3xl md:text-4xl text-charcoal leading-tight">
        {name}
      </h1>

      {/* Precio */}
      <div className="pt-2">
        <p className="text-2xl font-sans text-charcoal-light tracking-wide">
          {is_custom_request ? "Cotización personalizada" : formatCOP(price_cents)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Impuestos incluidos. Envío seguro a todo el país.</p>
      </div>
    </motion.div>
  );
}
