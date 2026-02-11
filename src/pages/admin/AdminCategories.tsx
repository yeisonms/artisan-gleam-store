import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const emptyForm = { name: "", slug: "", description: "", is_active: true, sort_order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCreate = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error("Nombre y slug requeridos"); return; }
    setSaving(true);
    const { error } = await supabase.from("categories").insert({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      is_active: form.is_active,
      sort_order: form.sort_order,
    });
    if (error) toast.error("Error al crear categoría");
    else { toast.success("Categoría creada"); setCreating(false); setForm(emptyForm); fetch(); }
    setSaving(false);
  };

  const handleUpdate = async (id: string) => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error("Nombre y slug requeridos"); return; }
    setSaving(true);
    const { error } = await supabase.from("categories").update({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      is_active: form.is_active,
      sort_order: form.sort_order,
    }).eq("id", id);
    if (error) toast.error("Error al actualizar");
    else { toast.success("Categoría actualizada"); setEditing(null); fetch(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error("Error al eliminar");
    else { toast.success("Eliminada"); fetch(); }
  };

  const startEdit = (c: Category) => {
    setEditing(c.id);
    setCreating(false);
    setForm({ name: c.name, slug: c.slug, description: c.description || "", is_active: c.is_active, sort_order: c.sort_order });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
  };

  const cancel = () => { setEditing(null); setCreating(false); setForm(emptyForm); };

  const renderForm = (onSave: () => void) => (
    <div className="border border-border bg-card p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Nombre</label>
          <input
            className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, name, slug: editing ? f.slug : autoSlug(name) }));
            }}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Slug</label>
          <input
            className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider">Descripción</label>
        <textarea
          className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="accent-gold"
          />
          Activa
        </label>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Orden</label>
          <input
            type="number"
            className="w-20 px-2 py-1 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Check size={14} /> Guardar
        </button>
        <button onClick={cancel} className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Categorías</h1>
        {!creating && (
          <button onClick={startCreate} className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90">
            <Plus size={14} /> Nueva
          </button>
        )}
      </div>

      {creating && renderForm(handleCreate)}

      {loading ? (
        <div className="space-y-3 mt-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-secondary animate-pulse" />)}</div>
      ) : categories.length === 0 && !creating ? (
        <p className="text-sm text-muted-foreground">No hay categorías.</p>
      ) : (
        <div className="space-y-3 mt-4">
          {categories.map((c) =>
            editing === c.id ? (
              <div key={c.id}>{renderForm(() => handleUpdate(c.id))}</div>
            ) : (
              <div key={c.id} className="flex items-center justify-between border border-border p-3 hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">/{c.slug} · Orden: {c.sort_order}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${c.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {c.is_active ? "Activa" : "Inactiva"}
                  </span>
                  <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
