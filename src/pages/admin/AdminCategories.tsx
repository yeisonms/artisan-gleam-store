import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check, Upload, Image as ImageIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const emptyForm = { name: "", slug: "", description: "", image_url: "", is_active: true, sort_order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    const ext = file.name.split(".").pop();
    const uuid = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const path = `categories/${uuid}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) { 
      toast.error("Error al subir imagen"); 
      setUploadingImage(false); 
      return; 
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    toast.success("Imagen subida. No olvides guardar.");
    setUploadingImage(false);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error("Nombre y slug requeridos"); return; }
    setSaving(true);
    const { error } = await supabase.from("categories").insert({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
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
      image_url: form.image_url.trim() || null,
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
    setForm({ name: c.name, slug: c.slug, description: c.description || "", image_url: c.image_url || "", is_active: c.is_active, sort_order: c.sort_order });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
  };

  const cancel = () => { setEditing(null); setCreating(false); setForm(emptyForm); };

  const renderForm = (onSave: () => void) => (
    <div className="bg-white p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 mt-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-serif tracking-widest text-muted-foreground uppercase">Nombre</label>
          <input
            className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, name, slug: editing ? f.slug : autoSlug(name) }));
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-serif tracking-widest text-muted-foreground uppercase">Slug</label>
          <input
            className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-serif tracking-widest text-muted-foreground uppercase">Descripción</label>
        <textarea
          className="w-full px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow resize-none"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-serif tracking-widest text-muted-foreground uppercase">Imagen de Categoría</label>
        <div className="flex items-center gap-4 mt-2">
          {form.image_url ? (
            <div className="w-16 h-16 shrink-0 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 shrink-0 border border-gray-100 bg-[#faf9f8] rounded-xl flex items-center justify-center text-muted-foreground opacity-50 shadow-sm">
              <ImageIcon size={20} />
            </div>
          )}
          <div className="flex-1 space-y-3">
            <div className="flex gap-4 items-center">
              <input
                placeholder="Pegar URL de la imagen..."
                className="flex-1 px-4 py-3 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
              <label className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm bg-white border border-gray-200 text-charcoal hover:bg-gray-50 rounded-full transition-all cursor-pointer shadow-sm shrink-0 ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload size={16} /> {uploadingImage ? "Subiendo..." : "Subir desde PC"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 pt-2">
        <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="accent-gold w-4 h-4 rounded"
          />
          Activa
        </label>
        <div className="flex items-center gap-3">
          <label className="text-[11px] font-serif tracking-widest text-muted-foreground uppercase">Orden</label>
          <input
            type="number"
            className="w-24 px-4 py-2 text-sm bg-[#faf9f8] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold transition-shadow text-center"
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>
      
      <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
        <button onClick={cancel} className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-charcoal hover:bg-gray-50 rounded-full transition-colors">
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 text-sm bg-gradient-to-br from-[#1a1a1a] to-black text-white hover:from-black hover:to-[#111] shadow-xl rounded-full transition-all disabled:opacity-50"
        >
          <Check size={16} /> {editing ? "Guardar Cambios" : "Crear Categoría"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-charcoal">Categorías</h1>
        {!creating && (
          <button onClick={startCreate} className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm bg-gradient-to-br from-[#1a1a1a] to-black text-white hover:from-black hover:to-[#111] shadow-xl rounded-full transition-all">
            <Plus size={16} /> Nueva Categoría
          </button>
        )}
      </div>

      {creating && renderForm(handleCreate)}

      {loading ? (
        <div className="space-y-4 mt-8">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white rounded-xl shadow-sm animate-pulse" />)}</div>
      ) : categories.length === 0 && !creating ? (
        <p className="text-sm text-muted-foreground">No hay categorías.</p>
      ) : (
        <div className="space-y-4 mt-8">
          {categories.map((c) =>
            editing === c.id ? (
              <div key={c.id}>{renderForm(() => handleUpdate(c.id))}</div>
            ) : (
              <div key={c.id} className="flex items-center justify-between bg-white border border-gray-50 p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all group">
                <div className="flex items-center gap-5">
                  {c.image_url ? (
                     <img src={c.image_url} alt={c.name} className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-sm" />
                  ) : (
                     <div className="w-14 h-14 bg-[#faf9f8] rounded-xl border border-gray-100 flex items-center justify-center text-muted-foreground shadow-sm">
                        <ImageIcon size={20} />
                     </div>
                  )}
                  <div>
                    <p className="text-lg font-serif font-medium text-charcoal">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">/{c.slug} <span className="mx-1 opacity-50">|</span> Orden: <span className="font-medium text-charcoal">{c.sort_order}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-[10px] font-medium tracking-wider uppercase px-3 py-1 rounded-full ${c.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {c.is_active ? "Activa" : "Inactiva"}
                  </span>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(c)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 rounded-full transition-colors"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
