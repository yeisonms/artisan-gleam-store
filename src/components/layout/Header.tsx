import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCart((s) => s.itemCount());
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glassmorphism shadow-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="container flex items-center justify-between">
        {/* Mobile menu toggle */}
        <button
          className={`md:hidden p-2 transition-colors ${scrolled ? 'text-foreground' : 'text-foreground mix-blend-difference text-white'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
        </button>

        {/* Logo */}
        <Link to="/" className={`font-display text-2xl md:text-3xl tracking-widest transition-colors ${scrolled ? 'text-foreground' : 'text-white mix-blend-difference'}`}>
          MAGNA <span className="text-gold italic font-light">ARTE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-xs md:text-sm tracking-[0.15em] transition-all duration-300 uppercase hover:text-gold relative group ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white mix-blend-difference'}`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link to="/carrito" className={`relative p-2 transition-colors hover:text-gold ${scrolled ? 'text-foreground' : 'text-white mix-blend-difference'}`}>
            <ShoppingBag size={22} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
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
            className="md:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl absolute top-full w-full shadow-lg"
          >
            <div className="container py-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm tracking-[0.2em] text-foreground hover:text-gold uppercase py-2 border-b border-border/30"
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
