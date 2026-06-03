import React, { useState } from "react";
import { useHistorialVentas, VentasFilters } from "./hooks/useHistorialVentas";
import { HistorialFiltros } from "./components/HistorialFiltros";
import { TablaVentas } from "./components/TablaVentas";
import { DetalleVentaModal } from "./components/DetalleVentaModal";

export default function HistorialVentasPage() {
  const [filters, setFilters] = useState<VentasFilters>({
    search: "",
    dateFrom: undefined,
    dateTo: undefined,
    channel: "todos",
    paymentStatus: "todos"
  });

  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);

  const { data: ventas, isLoading, refetch } = useHistorialVentas(filters);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Historial de Ventas</h1>
          <p className="text-gray-500">Consulta y administra todas las transacciones realizadas.</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          Refrescar Datos
        </button>
      </div>

      <HistorialFiltros filters={filters} setFilters={setFilters} />

      <TablaVentas 
        ventas={ventas || []} 
        isLoading={isLoading} 
        onRowClick={setSelectedVenta} 
      />

      <DetalleVentaModal 
        venta={selectedVenta} 
        isOpen={!!selectedVenta} 
        onClose={() => setSelectedVenta(null)} 
      />
    </div>
  );
}
