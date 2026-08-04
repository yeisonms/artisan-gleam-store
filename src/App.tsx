import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "@/hooks/usePwaInstall"; // Inicializa la intercepción del PWA
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CustomRequest from "./pages/CustomRequest";
import CasosExito from "./pages/CasosExito";
import Policies from "./pages/Policies";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSolicitudes from "./pages/admin/AdminSolicitudes";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import NotFound from "./pages/NotFound";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { WhatsAppButton } from "./components/layout/WhatsAppButton";
import PosPage from "./features/pos/PosPage";
import ClientesPage from "./features/clientes/ClientesPage";
import CarteraPage from "./features/cartera/CarteraPage";
import FinanzasPage from "./features/finanzas/FinanzasPage";
import DespachosPage from "./features/despachos/DespachosPage";
import HistorialVentasPage from "./features/historial-ventas/HistorialVentasPage";

const queryClient = new QueryClient();

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
          <Route path="/productos" element={<PublicLayout><Products /></PublicLayout>} />
          <Route path="/producto/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
          <Route path="/carrito" element={<PublicLayout><Cart /></PublicLayout>} />
          <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
          <Route path="/checkout/success" element={<PublicLayout><CheckoutSuccess /></PublicLayout>} />
          <Route path="/pedido-exitoso" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
          <Route path="/solicitud-personalizada" element={<PublicLayout><CustomRequest /></PublicLayout>} />
          <Route path="/casos-de-exito" element={<PublicLayout><CasosExito /></PublicLayout>} />
          <Route path="/politicas" element={<PublicLayout><Policies /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="pos" element={<PosPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="cartera" element={<CarteraPage />} />
            <Route path="finanzas" element={<FinanzasPage />} />
            <Route path="despachos" element={<DespachosPage />} />
            <Route path="solicitudes" element={<AdminSolicitudes />} />
            <Route path="historial-ventas" element={<HistorialVentasPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
