import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import CustomRequest from "./pages/CustomRequest";
import Policies from "./pages/Policies";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

const queryClient = new QueryClient();

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
          <Route path="/productos" element={<PublicLayout><Products /></PublicLayout>} />
          <Route path="/producto/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
          <Route path="/carrito" element={<PublicLayout><Cart /></PublicLayout>} />
          <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
          <Route path="/pedido-exitoso" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
          <Route path="/solicitud-personalizada" element={<PublicLayout><CustomRequest /></PublicLayout>} />
          <Route path="/politicas" element={<PublicLayout><Policies /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
