import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCOP } from "@/lib/cart";

interface TablaVentasProps {
  ventas: any[];
  isLoading: boolean;
  onRowClick: (venta: any) => void;
}

export function TablaVentas({ ventas, isLoading, onRowClick }: TablaVentasProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pagado":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Pagado</Badge>;
      case "Credito":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Crédito</Badge>;
      case "Abonado":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Abonado</Badge>;
      case "Cancelado":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        Cargando historial de ventas...
      </div>
    );
  }

  if (!ventas?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        No se encontraron ventas con los filtros actuales.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>ID Venta</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Estado Pago</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.map((venta) => (
            <TableRow 
              key={venta.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onRowClick(venta)}
            >
              <TableCell className="font-medium text-gray-900">
                #{venta.id.slice(0, 8)}
              </TableCell>
              <TableCell className="text-gray-600">
                {format(new Date(venta.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
              </TableCell>
              <TableCell className="text-gray-900">
                {venta.clientes?.nombre || "Cliente Final"}
              </TableCell>
              <TableCell className="text-gray-600">
                {venta.canal || "Digital"}
              </TableCell>
              <TableCell>
                {getStatusBadge(venta.estado_pago)}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {formatCOP(venta.total_cents)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
