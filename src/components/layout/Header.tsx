import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/logo-magna-arte.png";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Pulseras", href: "/productos?categoria=pulseras" },
  { label: "Anillos", href: "/productos?categoria=anillos" },
  { label: "Aretes", href: "/productos?categoria=aretes" },
  { label: "Dijes", href: "/productos?categoria=dijes" },
  { label: "Personalizado", href: "/solicitud-personalizada" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCart((s) => s.itemCount());
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-gold/20">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gold"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="h-12 md:h-14 flex items-center">
          <img src={logoImage} alt="Magna Arte" className="h-full object-contain" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-xs tracking-[0.15em] text-gold/70 hover:text-gold transition-colors uppercase font-sans"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/carrito" className="relative p-2 text-gold/70 hover:text-gold transition-colors">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-accent-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-gold/20 bg-background"
          >
            <div className="container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-xs tracking-[0.15em] text-gold/70 hover:text-gold uppercase py-1 font-sans"
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
