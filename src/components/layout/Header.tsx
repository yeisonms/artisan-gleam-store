import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoHeader from "@/assets/logo-header.png";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Pulseras", href: "/productos?categoria=pulseras" },
  { label: "Anillos", href: "/productos?categoria=anillos" },
  { label: "Aretes", href: "/productos?categoria=aretes" },
  { label: "Dijes", href: "/productos?categoria=dijes" },
  { label: "Personalizado", href: "/productos?categoria=elaboracion-personalizada-de-joyas" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCart((s) => s.itemCount());
  const location = useLocation();

  return (
    <header className="absolute top-0 w-full z-50 bg-[#FDFCF6] shadow-sm">
      <div className="container flex flex-col items-center">
        {/* Top row: Logo and Icons */}
        <div className="w-full relative flex justify-center items-center py-6">
          <button
            className="md:hidden absolute left-4 p-2 text-gold hover:text-gold-dark transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>

          <Link to="/" className="transition-opacity duration-300 hover:opacity-80">
            <img src={logoHeader} alt="Magna Arte" className="h-12 md:h-16 w-auto object-contain" />
          </Link>

          <div className="absolute right-4 flex items-center gap-4">
            <button className="p-2 text-gold hover:text-gold-dark transition-colors" aria-label="Buscar">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link to="/carrito" className="relative p-2 text-gold hover:text-gold-dark transition-colors" aria-label="Carrito">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-charcoal text-gold text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-gold/30">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Bottom row: Navigation */}
        <nav className="hidden md:flex items-center gap-8 pb-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-xs md:text-sm tracking-[0.2em] font-medium text-gold hover:text-gold-dark uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-gold/20 bg-[#FDFCF6] absolute top-full w-full shadow-lg"
          >
            <div className="container py-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm tracking-[0.2em] text-gold hover:text-gold-dark uppercase py-2 border-b border-gold/10"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

