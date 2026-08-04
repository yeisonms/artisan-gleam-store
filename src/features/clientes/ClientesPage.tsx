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
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-3xl text-charcoal flex items-center gap-3">
          <Users size={28} /> Directorio de Clientes
        </h1>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm bg-gradient-to-br from-[#1a1a1a] to-black text-white hover:from-black hover:to-[#111] shadow-xl rounded-full transition-all"
        >
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#faf9f8]/30">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-white rounded-full border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-charcoal focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-[11px] font-serif tracking-widest text-muted-foreground uppercase">
            {filteredClientes.length} cliente(s)
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#faf9f8] animate-pulse rounded-lg border border-gray-50" />
            ))}
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Users size={48} className="opacity-20 text-charcoal" />
            <p className="font-serif tracking-widest uppercase text-sm">No hay clientes registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#faf9f8]/50 text-left">
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase">Nombre</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden sm:table-cell">Contacto</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden md:table-cell">Dirección</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase hidden lg:table-cell">Registro</th>
                  <th className="px-6 py-4 font-serif text-[11px] tracking-widest text-muted-foreground uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-[#faf9f8] transition-colors group">
                    <td className="px-6 py-4 font-serif font-medium text-charcoal">{c.nombre}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {c.email && <div className="text-charcoal text-[13px]">{c.email}</div>}
                      {c.telefono && <div className="text-muted-foreground text-[12px]">{c.telefono}</div>}
                      {!c.email && !c.telefono && <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell text-[13px]">
                      {c.direccion || '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell text-[13px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="w-8 h-8 inline-flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 rounded-full transition-colors md:opacity-0 md:group-hover:opacity-100"
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
