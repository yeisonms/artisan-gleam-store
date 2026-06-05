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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border w-full max-w-md shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-lg text-foreground">
            {clienteToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Dirección
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              rows={2}
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
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
