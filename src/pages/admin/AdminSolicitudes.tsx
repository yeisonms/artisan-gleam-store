import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCOP } from "@/lib/cart";
import { ChevronLeft, ExternalLink } from "lucide-react";

type RequestStatus = "new" | "contacted" | "quoted" | "closed";

interface CustomRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  category_hint: string | null;
  budget_cents: number | null;
  details: string;
  reference_images: string[] | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

const statusLabels: Record<RequestStatus, { label: string; color: string }> = {
  new: { label: "Nueva", color: "bg-blue-100 text-blue-800" },
  contacted: { label: "Contactada", color: "bg-yellow-100 text-yellow-800" },
  quoted: { label: "Cotizada", color: "bg-purple-100 text-purple-800" },
  closed: { label: "Cerrada", color: "bg-green-100 text-green-800" },
};

const allStatuses: RequestStatus[] = ["new", "contacted", "quoted", "closed"];

export default function AdminSolicitudes() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("custom_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRequests(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("custom_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar estado");
    } else {
      toast.success("Estado actualizado");
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
    setUpdatingStatus(false);
  };

  // Detail view
  if (selected) {
    const s = statusLabels[selected.status];
    return (
      <div className="p-6 md:p-8 max-w-3xl">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft size={16} /> Volver a solicitudes
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-foreground">{selected.full_name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(selected.created_at).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded ${s.color}`}>
            {s.label}
          </span>
        </div>

        {/* Status update */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Cambiar Estado</p>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((status) => {
              const sl = statusLabels[status];
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(selected.id, status)}
                  disabled={updatingStatus || selected.status === status}
                  className={`px-3 py-1.5 text-xs border transition-colors disabled:opacity-40 ${
                    selected.status === status
                      ? "border-gold bg-gold/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {sl.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Contact info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
              <a href={`mailto:${selected.email}`} className="text-sm text-foreground hover:text-gold">
                {selected.email}
              </a>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Teléfono</p>
              <a href={`tel:${selected.phone}`} className="text-sm text-foreground hover:text-gold">
                {selected.phone}
              </a>
            </div>
            {selected.category_hint && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tipo de Joya</p>
                <p className="text-sm text-foreground">{selected.category_hint}</p>
              </div>
            )}
            {selected.budget_cents != null && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Presupuesto</p>
                <p className="text-sm text-foreground">{formatCOP(selected.budget_cents)}</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Descripción</p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap border border-border p-4 bg-background">
              {selected.details}
            </p>
          </div>

          {/* Reference links */}
          {selected.reference_images && selected.reference_images.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Enlaces de Referencia</p>
              <div className="space-y-2">
                {selected.reference_images.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gold hover:underline truncate"
                  >
                    <ExternalLink size={14} className="flex-shrink-0" />
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display text-2xl text-foreground mb-6">Solicitudes Personalizadas</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay solicitudes aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">Cliente</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium hidden md:table-cell">Tipo</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium hidden lg:table-cell">Presupuesto</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">Estado</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium hidden sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const s = statusLabels[req.status];
                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelected(req)}
                    className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-foreground font-medium">{req.full_name}</p>
                      <p className="text-xs text-muted-foreground">{req.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">
                      {req.category_hint || "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground hidden lg:table-cell">
                      {req.budget_cents != null ? formatCOP(req.budget_cents) : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs hidden sm:table-cell">
                      {new Date(req.created_at).toLocaleDateString("es-CO")}
                    </td>
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
