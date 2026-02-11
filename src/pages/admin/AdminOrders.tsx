import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCOP } from "@/lib/cart";
import { ChevronLeft } from "lucide-react";

type OrderStatus = "pending_payment" | "paid" | "preparing" | "shipped" | "canceled" | "refunded";

interface Order {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  total_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  currency: string;
  shipping_address: any;
  payment_provider: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name_snapshot: string;
  variant_snapshot: any;
  quantity: number;
  unit_price_cents: number;
}

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  pending_payment: { label: "Pendiente Pago", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Pagado", color: "bg-green-100 text-green-800" },
  preparing: { label: "Preparando", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
  canceled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  refunded: { label: "Reembolsado", color: "bg-gray-100 text-gray-800" },
};

const allStatuses: OrderStatus[] = ["pending_payment", "paid", "preparing", "shipped", "canceled", "refunded"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data as any);
    setLoading(false);
  };

  const fetchItems = async (orderId: string) => {
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (data) setItems(data as any);
  };

  useEffect(() => { fetchOrders(); }, []);

  const openDetail = async (order: Order) => {
    setSelected(order);
    await fetchItems(order.id);
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (error) toast.error("Error al actualizar estado");
    else {
      toast.success("Estado actualizado");
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    setUpdatingStatus(false);
  };

  // Detail view
  if (selected) {
    const s = statusLabels[selected.status];
    const addr = selected.shipping_address as any;
    return (
      <div className="p-6 md:p-8 max-w-3xl">
        <button onClick={() => { setSelected(null); setItems([]); }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft size={16} /> Volver a pedidos
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-foreground">Pedido #{selected.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(selected.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded ${s.color}`}>{s.label}</span>
        </div>

        {/* Status update */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Cambiar Estado</p>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((status) => {
              const sl = statusLabels[status];
              return (
                <button key={status} onClick={() => handleStatusChange(selected.id, status)}
                  disabled={updatingStatus || selected.status === status}
                  className={`px-3 py-1.5 text-xs border transition-colors disabled:opacity-40 ${
                    selected.status === status ? "border-gold bg-gold/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}>
                  {sl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer info */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
            <p className="text-sm text-foreground">{selected.customer_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-foreground">{selected.customer_email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Teléfono</p>
            <p className="text-sm text-foreground">{selected.customer_phone || "—"}</p>
          </div>
          {selected.transaction_id && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Transacción</p>
              <p className="text-sm text-foreground font-mono">{selected.transaction_id}</p>
            </div>
          )}
        </div>

        {/* Address */}
        {addr && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Dirección de envío</p>
            <div className="border border-border p-3 text-sm text-foreground">
              {typeof addr === "object" ? (
                <>{addr.address && <p>{addr.address}</p>}{addr.city && <p>{addr.city}, {addr.state}</p>}{addr.zip && <p>{addr.zip}</p>}</>
              ) : <p>{JSON.stringify(addr)}</p>}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Artículos</p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between border border-border p-3 text-sm">
                <div>
                  <span className="text-foreground font-medium">{item.product_name_snapshot}</span>
                  <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                </div>
                <span className="text-foreground">{formatCOP(item.unit_price_cents * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCOP(selected.subtotal_cents)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Envío</span><span>{formatCOP(selected.shipping_cents)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Impuestos</span><span>{formatCOP(selected.tax_cents)}</span></div>
          <div className="flex justify-between font-medium text-foreground text-base pt-2"><span>Total</span><span>{formatCOP(selected.total_cents)}</span></div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display text-2xl text-foreground mb-6">Pedidos</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-secondary animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay pedidos aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">Pedido</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium hidden md:table-cell">Cliente</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">Total</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">Estado</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium hidden sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = statusLabels[o.status];
                return (
                  <tr key={o.id} onClick={() => openDetail(o)} className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                    <td className="py-3 pr-4 text-foreground font-mono text-xs">#{o.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <p className="text-foreground">{o.customer_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_email || ""}</p>
                    </td>
                    <td className="py-3 pr-4 text-foreground">{formatCOP(o.total_cents)}</td>
                    <td className="py-3 pr-4"><span className={`px-2 py-0.5 text-xs font-medium rounded ${s.color}`}>{s.label}</span></td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs hidden sm:table-cell">{new Date(o.created_at).toLocaleDateString("es-CO")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
