import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCOP } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DetalleVentaModalProps {
  venta: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetalleVentaModal({ venta, isOpen, onClose }: DetalleVentaModalProps) {
  const [detalles, setDetalles] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (venta && isOpen) {
      setLoadingDetails(true);
      const fetchData = async () => {
        const [detallesRes, pagosRes] = await Promise.all([
          supabase.from('detalle_ventas' as any).select(`
            *,
            product_variants (
              variant_name,
              products ( name )
            )
          `).eq('venta_id', venta.id),
          supabase.from('transacciones_financieras' as any).select('*').eq('venta_id', venta.id).order('created_at', { ascending: true })
        ]);
        
        if (detallesRes.data) setDetalles(detallesRes.data);
        if (pagosRes.data) setPagos(pagosRes.data);
        setLoadingDetails(false);
      };
      fetchData();
    } else {
      setDetalles([]);
      setPagos([]);
    }
  }, [venta, isOpen]);

  if (!venta) return null;

  const isPaid = venta.estado_pago === "Pagado";
  const isPending = venta.estado_pago === "Credito" || venta.estado_pago === "Abonado";

  const totalAbonado = pagos.reduce((sum, p) => sum + (p.monto_cents || p.monto || 0), 0);
  const saldoPendiente = venta.total_cents - totalAbonado;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto bg-[#FAFAFA]">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-serif text-2xl text-gray-900">
            Detalle de Venta #{venta.id.slice(0, 8)}
          </SheetTitle>
          <SheetDescription>
            Realizada el {format(new Date(venta.created_at), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
          </SheetDescription>
        </SheetHeader>

        {loadingDetails ? (
          <div className="py-12 text-center text-gray-500">Cargando detalles...</div>
        ) : (
          <div className="space-y-8">
            {/* Cliente Info */}
            <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Información del Cliente</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900">{venta.clientes?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Canal</p>
                  <p className="font-medium text-gray-900">{venta.canal || 'Digital'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado de Pago</p>
                  <p className="font-medium text-gray-900">{venta.estado_pago || 'N/A'}</p>
                </div>
              </div>
            </section>

            {/* Artículos */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Artículos (Joyas)</h3>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {detalles?.map((item: any) => {
                    const productName = item.product_variants?.products?.name || "Producto";
                    const variantName = item.product_variants?.variant_name || "";
                    const displayName = variantName && variantName !== "Default" ? `${productName} (${variantName})` : productName;
                    return (
                      <li key={item.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-500 mt-1">Cant: {item.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCOP(item.subtotal_cents)}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatCOP(item.precio_unitario_cents)} c/u</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="bg-gray-100 p-4 flex justify-between items-center text-lg mt-2">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{formatCOP(venta.total_cents)}</span>
                </div>
              </div>
            </section>

            {/* Historial de Pagos */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Historial de Pagos</h3>
                {isPaid && <Badge className="bg-green-100 text-green-800">Pagado Completamente</Badge>}
                {isPending && <Badge className="bg-yellow-100 text-yellow-800">Pago Pendiente</Badge>}
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {pagos.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {pagos.map((pago) => (
                      <li key={pago.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">Abono ({pago.metodo_pago || 'Desconocido'})</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(pago.created_at), "dd MMM yyyy", { locale: es })}
                          </p>
                        </div>
                        <span className="font-medium text-green-600">+{formatCOP(pago.monto_cents || pago.monto || 0)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No hay pagos registrados adicionales para esta venta.
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-medium text-gray-600">Total Abonado</span>
                  <span className="font-bold text-gray-900">
                    {formatCOP(totalAbonado)}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 pt-0 border-t-0 flex justify-between items-center">
                  <span className="font-medium text-gray-600">Saldo Pendiente</span>
                  <span className={`font-bold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCOP(Math.max(0, saldoPendiente))}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
