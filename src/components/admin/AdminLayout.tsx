import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Sparkles, LogOut, Users, BookOpen, PieChart, Truck, History } from "lucide-react";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/productos", icon: Package },
  { label: "Categorías", href: "/admin/categorias", icon: FolderOpen },
  { label: "Punto de Venta", href: "/admin/pos", icon: ShoppingCart },
  { label: "Historial Ventas", href: "/admin/historial-ventas", icon: History },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Cartera", href: "/admin/cartera", icon: BookOpen },
  { label: "Finanzas", href: "/admin/finanzas", icon: PieChart },
  { label: "Despachos", href: "/admin/despachos", icon: Truck },
  { label: "Solicitudes", href: "/admin/solicitudes", icon: Sparkles },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      // Server-side admin verification
      const { data, error } = await supabase.functions.invoke("verify-admin");
      if (error || !data?.isAdmin) {
        navigate("/admin/login");
        return;
      }
      setChecking(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });

    checkAdmin();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#faf9f8] font-sans">
      <aside className="w-[260px] bg-white flex-shrink-0 hidden md:flex flex-col shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-10">
        <div className="p-8 border-b border-gray-100 flex flex-col items-center">
          <Link to="/" className="font-serif text-2xl tracking-widest text-charcoal uppercase mb-1">
            MEMORIES
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">Menú Principal</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href || (link.href !== "/admin" && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-[#faf9f8] text-charcoal font-medium shadow-sm border border-gray-100"
                    : "text-muted-foreground hover:text-charcoal hover:bg-gray-50/50"
                }`}
              >
                <link.icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-gold" : ""} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-gray-100">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full"
          >
            <LogOut size={18} strokeWidth={1.5} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-marble-texture opacity-30 mix-blend-multiply pointer-events-none" />
        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
