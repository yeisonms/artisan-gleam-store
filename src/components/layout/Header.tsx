import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoHeader from "@/assets/logo-header.png";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemCount = useCart((s) => s.itemCount());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?busqueda=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-gold/20">
      {/* Top row: hamburger — logo centered — actions */}
      <div className="container flex items-center justify-between h-20 md:h-24">
        {/* Left: mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gold"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Spacer for desktop to balance the right side */}
        <div className="hidden md:block w-24" />

        {/* Center: Logo */}
        <Link to="/" className="flex items-center absolute left-1/2 -translate-x-1/2">
          <img src={logoHeader} alt="Magna Arte" className="h-12 md:h-16 w-auto" />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gold/70 hover:text-gold transition-colors"
            aria-label="Buscar"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
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

      {/* Desktop nav row */}
      <nav className="hidden md:flex items-center justify-center gap-8 pb-3 border-t border-gold/10 pt-2">
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

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gold/20 bg-background"
          >
            <form onSubmit={handleSearch} className="container py-3 flex items-center gap-3">
              <Search size={16} className="text-muted-foreground flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar joyas..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
