import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCOP } from "@/lib/cart";
import { CheckCircle, Package, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface OrderItem {
  id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price_cents: number;
  variant_snapshot: { name?: string } | null;
}

interface Order {
  id: string;
  status: string;
  total_cents: number;
  shipping_cents: number;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: "Pendiente de pago", color: "text-yellow-600", icon: <Clock size={20} /> },
  paid: { label: "Pagado", color: "text-green-600", icon: <CheckCircle size={20} /> },
  preparing: { label: "En preparación", color: "text-blue-600", icon: <Package size={20} /> },
  shipped: { label: "Enviado", color: "text-purple-600", icon: <Package size={20} /> },
  canceled: { label: "Cancelado", color: "text-destructive", icon: <Clock size={20} /> },
  refunded: { label: "Reembolsado", color: "text-muted-foreground", icon: <Clock size={20} /> },
};

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("pedido");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, status, total_cents, shipping_cents, customer_name, customer_email, created_at, order_items(id, product_name_snapshot, quantity, unit_price_cents, variant_snapshot)")
        .eq("id", orderId)
        .maybeSingle();
      if (data) setOrder(data as any);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center container text-center">
        <p className="text-muted-foreground mb-4">No se encontró el pedido.</p>
        <Link to="/productos" className="text-gold underline">Volver a la tienda</Link>
      </div>
    );
  }

  const statusInfo = statusLabels[order.status] || statusLabels.pending_payment;

  return (
    <div className="min-h-screen container py-8 md:py-16 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-gold" />
        </div>
        <h1 className="font-display text-3xl text-foreground mb-2">¡Pedido Registrado!</h1>
        <p className="text-muted-foreground">
          Gracias{order.customer_name ? `, ${order.customer_name}` : ""}. Tu pedido ha sido registrado exitosamente.
        </p>
      </motion.div>

      <div className="border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pedido</p>
            <p className="font-mono text-sm text-foreground">#{order.id.slice(0, 8)}</p>
          </div>
          <div className={`flex items-center gap-2 ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="text-sm font-medium">{statusInfo.label}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.product_name_snapshot}
                {item.variant_snapshot?.name ? ` — ${item.variant_snapshot.name}` : ""}
                {" × "}{item.quantity}
              </span>
              <span className="text-foreground">{formatCOP(item.unit_price_cents * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Envío</span>
            <span className="text-gold">Gratis</span>
          </div>
          <div className="flex justify-between font-display text-lg text-foreground">
            <span>Total</span>
            <span>{formatCOP(order.total_cents)}</span>
          </div>
        </div>
      </div>

      {order.customer_email && (
        <p className="text-sm text-muted-foreground text-center mb-8">
          Te enviaremos actualizaciones a <span className="text-foreground">{order.customer_email}</span>
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/productos"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors"
        >
          Seguir Comprando
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-border text-foreground text-sm tracking-widest uppercase hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={16} /> Inicio
        </Link>
      </div>
    </div>
  );
}
