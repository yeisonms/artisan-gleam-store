import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Sparkles, LogOut, Users, BookOpen, PieChart, Truck } from "lucide-react";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/productos", icon: Package },
  { label: "Categorías", href: "/admin/categorias", icon: FolderOpen },
  { label: "Punto de Venta", href: "/admin/pos", icon: ShoppingCart },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Cartera", href: "/admin/cartera", icon: BookOpen },
  { label: "Finanzas", href: "/admin/finanzas", icon: PieChart },
  { label: "Despachos", href: "/admin/despachos", icon: Truck },
  { label: "Solicitudes", href: "/admin/solicitudes", icon: Sparkles },
];

export default function AdminLayout() {
  const navigate = useNavigate();
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
    <div className="min-h-screen flex">
      <aside className="w-60 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="font-display text-lg tracking-wider">
            MAGNA <span className="text-sidebar-primary">ARTE</span>
          </Link>
          <p className="text-xs text-sidebar-foreground/50 mt-1">Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded transition-colors"
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground w-full">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-background overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
