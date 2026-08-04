import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoHeader from "@/assets/logo-memories.png";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Pulseras", href: "/productos?categoria=pulseras" },
  { label: "Anillos", href: "/productos?categoria=anillos" },
  { label: "Aretes", href: "/productos?categoria=aretes" },
  { label: "Dijes", href: "/productos?categoria=dijes" },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Diseño personalizado", href: "/solicitud-personalizada" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemCount = useCart((s) => s.itemCount());
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 w-full z-50 bg-[#FDFCF6] shadow-sm">
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

          <Link to="/" className="flex flex-col items-center gap-1 group z-10 mx-auto" onClick={() => setMobileOpen(false)}>
            <img src={logoHeader} alt="Memories" className="h-16 md:h-20 w-auto object-contain" />
          </Link>

          <div className="absolute right-4 flex items-center gap-2 md:gap-4">
            <form 
              onSubmit={handleSearchSubmit} 
              className={`flex items-center transition-all duration-300 overflow-hidden ${isSearchOpen ? 'w-40 md:w-56 border-b border-gold bg-[#FDFCF6]' : 'w-10 border-b border-transparent'}`}
            >
              <button 
                type="button" 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gold hover:text-gold-dark transition-colors shrink-0" 
                aria-label="Buscar"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..." 
                className={`bg-transparent text-sm text-charcoal focus:outline-none transition-all duration-300 w-full placeholder:text-gold/50 ${isSearchOpen ? 'opacity-100 pr-2' : 'opacity-0'}`}
                tabIndex={isSearchOpen ? 0 : -1}
              />
            </form>
            <Link to="/carrito" className="relative p-2 text-gold hover:text-gold-dark transition-colors shrink-0" aria-label="Carrito">
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

      {/* Mobile nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-3/4 max-w-sm z-50 bg-[#FDFCF6] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gold/20 flex items-center justify-between">
                <img src={logoHeader} alt="Memories" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileOpen(false)} className="text-gold hover:text-gold-dark p-2 -mr-2">
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm tracking-[0.2em] font-medium text-gold hover:text-gold-dark uppercase py-2 border-b border-gold/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

