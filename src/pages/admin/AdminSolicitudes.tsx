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
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-charcoal transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Volver a solicitudes
        </button>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {/* Cabecera del detalle */}
          <div className="p-8 border-b border-gray-100 bg-[#faf9f8]/30">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="font-serif text-3xl text-charcoal">{selected.full_name}</h1>
                <p className="text-sm text-muted-foreground mt-2 font-mono">
                  {new Date(selected.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-full ${s.color}`}>
                {s.label}
              </span>
            </div>

            {/* Status update */}
            <div>
              <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-3">Cambiar Estado</p>
              <div className="flex flex-wrap gap-2">
                {allStatuses.map((status) => {
                  const sl = statusLabels[status];
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selected.id, status)}
                      disabled={updatingStatus || selected.status === status}
                      className={`px-5 py-2.5 text-[11px] uppercase tracking-widest font-medium rounded-full transition-all disabled:opacity-50 ${
                        selected.status === status
                          ? "bg-charcoal text-white shadow-md border border-charcoal"
                          : "bg-white border border-gray-200 text-muted-foreground hover:border-gold hover:text-gold"
                      }`}
                    >
                      {sl.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Contact info */}
            <div className="grid sm:grid-cols-2 gap-6 bg-[#faf9f8] p-6 rounded-xl border border-gray-50">
              <div>
                <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1.5">Email</p>
                <a href={`mailto:${selected.email}`} className="text-[15px] text-charcoal hover:text-gold transition-colors font-medium">
                  {selected.email}
                </a>
              </div>
              <div>
                <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1.5">Teléfono</p>
                <a href={`tel:${selected.phone}`} className="text-[15px] text-charcoal hover:text-gold transition-colors font-medium">
                  {selected.phone}
                </a>
              </div>
              {selected.category_hint && (
                <div>
                  <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1.5">Tipo de Joya</p>
                  <p className="text-[15px] text-charcoal font-medium">{selected.category_hint}</p>
                </div>
              )}
              {selected.budget_cents != null && (
                <div>
                  <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1.5">Presupuesto</p>
                  <p className="text-[15px] text-charcoal font-bold">{formatCOP(selected.budget_cents)}</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-3">Descripción / Requerimiento</p>
              <div className="text-[14px] text-charcoal leading-relaxed whitespace-pre-wrap border border-gray-100 rounded-xl p-6 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.01)]">
                {selected.details}
              </div>
            </div>

            {/* Reference links */}
            {selected.reference_images && selected.reference_images.length > 0 && (
              <div>
                <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-3">Enlaces de Referencia</p>
                <div className="flex flex-col gap-3">
                  {selected.reference_images.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[13px] text-gold hover:text-charcoal transition-colors bg-[#faf9f8] px-4 py-3 rounded-lg border border-gray-50 hover:border-gray-200"
                    >
                      <ExternalLink size={16} className="flex-shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  // List view
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <h1 className="font-serif text-3xl text-charcoal mb-6">Solicitudes Personalizadas</h1>

      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#faf9f8] rounded-lg animate-pulse border border-gray-50" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <p className="font-serif tracking-widest uppercase text-sm">No hay solicitudes aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#faf9f8]/50 text-left">
                  <th className="px-6 py-4 font-serif text-[11px] text-muted-foreground uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 font-serif text-[11px] text-muted-foreground uppercase tracking-widest hidden md:table-cell">Tipo</th>
                  <th className="px-6 py-4 font-serif text-[11px] text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Presupuesto</th>
                  <th className="px-6 py-4 font-serif text-[11px] text-muted-foreground uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 font-serif text-[11px] text-muted-foreground uppercase tracking-widest hidden sm:table-cell text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const s = statusLabels[req.status];
                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelected(req)}
                      className="border-b border-gray-50 hover:bg-[#faf9f8] cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="text-charcoal font-serif font-medium group-hover:text-gold transition-colors">{req.full_name}</p>
                        <p className="text-[13px] text-muted-foreground">{req.email}</p>
                      </td>
                      <td className="px-6 py-4 text-charcoal text-[13px] hidden md:table-cell">
                        {req.category_hint || "—"}
                      </td>
                      <td className="px-6 py-4 text-charcoal text-[13px] font-medium hidden lg:table-cell">
                        {req.budget_cents != null ? formatCOP(req.budget_cents) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-[13px] hidden sm:table-cell text-right font-mono">
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
    </div>
  );
}
