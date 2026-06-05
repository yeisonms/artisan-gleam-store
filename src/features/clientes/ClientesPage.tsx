import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Users } from 'lucide-react';
import { useClientes, Cliente } from './hooks/useClientes';
import { ClienteModalForm } from './components/ClienteModalForm';

export default function ClientesPage() {
  const { clientes, loading, createCliente, updateCliente } = useClientes();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes;
    const lower = searchTerm.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(lower) ||
        (c.email && c.email.toLowerCase().includes(lower)) ||
        (c.telefono && c.telefono.includes(lower))
    );
  }, [clientes, searchTerm]);

  const handleOpenCreate = () => {
    setClienteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (clienteToEdit) {
      return await updateCliente(clienteToEdit.id, data);
    } else {
      return await createCliente(data);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl text-foreground flex items-center gap-2">
          <Users size={24} /> Directorio de Clientes
        </h1>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-card border border-border shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredClientes.length} cliente(s) encontrados
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-secondary animate-pulse rounded border border-border/50" />
            ))}
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <Users size={48} className="opacity-20" />
            <p>No hay clientes registrados o que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs">Nombre</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden sm:table-cell">Contacto</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">Dirección</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden lg:table-cell">Registro</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{c.nombre}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {c.email && <div className="text-muted-foreground">{c.email}</div>}
                      {c.telefono && <div className="text-muted-foreground">{c.telefono}</div>}
                      {!c.email && !c.telefono && <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {c.direccion || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClienteModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clienteToEdit={clienteToEdit}
        onSave={handleSave}
      />
    </div>
  );
}
