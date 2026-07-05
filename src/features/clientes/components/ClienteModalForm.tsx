import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Cliente, ClienteFormData } from '../hooks/useClientes';

interface ClienteModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  clienteToEdit: Cliente | null;
  onSave: (data: ClienteFormData) => Promise<boolean>;
}

export function ClienteModalForm({ isOpen, onClose, clienteToEdit, onSave }: ClienteModalFormProps) {
  const [form, setForm] = useState<ClienteFormData>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (clienteToEdit) {
        setForm({
          nombre: clienteToEdit.nombre,
          email: clienteToEdit.email || '',
          telefono: clienteToEdit.telefono || '',
          direccion: clienteToEdit.direccion || '',
        });
      } else {
        setForm({ nombre: '', email: '', telefono: '', direccion: '' });
      }
    }
  }, [isOpen, clienteToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSave(form);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-100 w-full max-w-md shadow-2xl rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#faf9f8]/50">
          <h2 className="font-serif text-xl text-charcoal">
            {clienteToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-gray-100 hover:text-charcoal transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
                Teléfono
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[11px] font-serif text-muted-foreground uppercase tracking-widest mb-2 block">
                Dirección
              </label>
              <textarea
                className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow resize-none"
                rows={2}
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-[#faf9f8]/50">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-charcoal hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm bg-gradient-to-br from-[#1a1a1a] to-black text-white rounded-full shadow-xl hover:from-black hover:to-[#111] transition-all disabled:opacity-50"
            >
              <Check size={16} />
              {saving ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
