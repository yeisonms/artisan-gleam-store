import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VentasFilters } from "../hooks/useHistorialVentas";

interface HistorialFiltrosProps {
  filters: VentasFilters;
  setFilters: React.Dispatch<React.SetStateAction<VentasFilters>>;
}

export function HistorialFiltros({ filters, setFilters }: HistorialFiltrosProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
      {/* Buscador */}
      <div className="flex-1">
        <label className="text-xs font-medium text-gray-500 mb-1 block">Buscador</label>
        <Input 
          placeholder="Buscar por cliente o ID..." 
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full"
        />
      </div>

      {/* Rango de Fechas */}
      <div className="flex gap-2">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Desde</label>
          <Input 
            type="date"
            value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              dateFrom: e.target.value ? new Date(e.target.value) : undefined 
            }))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Hasta</label>
          <Input 
            type="date"
            value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              dateTo: e.target.value ? new Date(e.target.value) : undefined 
            }))}
          />
        </div>
      </div>

      {/* Canal */}
      <div className="w-full md:w-40">
        <label className="text-xs font-medium text-gray-500 mb-1 block">Canal</label>
        <Select 
          value={filters.channel} 
          onValueChange={(val) => setFilters(prev => ({ ...prev, channel: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="fisico">Físico</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estado de Pago */}
      <div className="w-full md:w-48">
        <label className="text-xs font-medium text-gray-500 mb-1 block">Estado</label>
        <Select 
          value={filters.paymentStatus} 
          onValueChange={(val) => setFilters(prev => ({ ...prev, paymentStatus: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="pending_payment">Pendiente / Crédito</SelectItem>
            <SelectItem value="abonado">Abonado</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
