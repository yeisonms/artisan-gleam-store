import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCOP } from "@/lib/cart";

export default function AdminDashboard() {
  const [orderCount, setOrderCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [ordersRes, requestsRes, recentOrdersRes, recentRequestsRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("custom_requests").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("custom_requests").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setOrderCount(ordersRes.count || 0);
      setRequestCount(requestsRes.count || 0);
      setRecentOrders(recentOrdersRes.data || []);
      setRecentRequests(recentRequestsRes.data || []);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display text-2xl text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pedidos</p>
          <p className="font-display text-2xl text-foreground mt-1">{orderCount}</p>
        </div>
        <div className="border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Solicitudes</p>
          <p className="font-display text-2xl text-foreground mt-1">{requestCount}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-lg text-foreground mb-4">Pedidos Recientes</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin pedidos aún.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="border border-border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">#{order.id.slice(0, 8)}</span>
                    <span className="text-foreground">{formatCOP(order.total_cents)}</span>
                  </div>
                  <span className="text-xs text-gold uppercase">{order.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg text-foreground mb-4">Solicitudes Recientes</h2>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin solicitudes aún.</p>
          ) : (
            <div className="space-y-2">
              {recentRequests.map((req) => (
                <div key={req.id} className="border border-border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground">{req.full_name}</span>
                    <span className="text-xs text-gold uppercase">{req.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{req.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
