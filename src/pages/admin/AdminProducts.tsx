import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCOP } from "@/lib/cart";
import { Plus, Pencil, Trash2, ChevronLeft, X, Check, Image as ImageIcon, Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  cost_cents: number;
  currency: string;
  category_id: string | null;
  is_active: boolean;
  featured: boolean;
  is_custom_request: boolean;
  created_at: string;
}

interface Category { id: string; name: string; }

interface Variant {
  id: string;
  variant_name: string;
  price_cents: number | null;
  cost_cents: number | null;
  stock: number;
  sku: string | null;
  attributes: Record<string, string>;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

const emptyProduct = {
  name: "", slug: "", description: "", price_cents: 0, cost_cents: 0,
  category_id: "", is_active: true, featured: false, is_custom_request: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  // Variants & images for detail
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newVariant, setNewVariant] = useState({ variant_name: "", price_cents: "", cost_cents: "", stock: "0", sku: "", attributes: "{}" });
  const [newImageUrl, setNewImageUrl] = useState("");

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const fetchAll = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("sort_order"),
    ]);
    if (prodRes.data) setProducts(prodRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  const fetchProductDetails = async (productId: string) => {
    const [vRes, iRes] = await Promise.all([
      supabase.from("product_variants").select("*").eq("product_id", productId).order("created_at"),
      supabase.from("product_images").select("*").eq("product_id", productId).order("sort_order"),
    ]);
    if (vRes.data) setVariants(vRes.data as any);
    if (iRes.data) setImages(iRes.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setVariants([]);
    setImages([]);
    setView("form");
  };

  const openEdit = async (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, description: p.description || "",
      price_cents: p.price_cents, cost_cents: p.cost_cents || 0, category_id: p.category_id || "",
      is_active: p.is_active, featured: p.featured, is_custom_request: p.is_custom_request,
    });
    await fetchProductDetails(p.id);
    setView("form");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error("Nombre y slug requeridos"); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      price_cents: form.price_cents,
      cost_cents: form.cost_cents,
      category_id: form.category_id || null,
      is_active: form.is_active,
      featured: form.featured,
      is_custom_request: form.is_custom_request,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast.error("Error al actualizar"); else toast.success("Producto actualizado");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error("Error al crear"); else toast.success("Producto creado");
    }
    setSaving(false);
    setView("list");
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto y sus variantes/imágenes?")) return;
    await supabase.from("product_variants").delete().eq("product_id", id);
    await supabase.from("product_images").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Error al eliminar"); else { toast.success("Eliminado"); fetchAll(); }
  };

  // Variant helpers
  const addVariant = async () => {
    if (!editingId || !newVariant.variant_name.trim()) { toast.error("Guarda el producto primero y agrega nombre de variante"); return; }
    let attrs: Record<string, string> = {};
    try { attrs = JSON.parse(newVariant.attributes); } catch { toast.error("Atributos JSON inválido"); return; }
    const { error } = await supabase.from("product_variants").insert({
      product_id: editingId,
      variant_name: newVariant.variant_name.trim(),
      price_cents: newVariant.price_cents ? parseInt(newVariant.price_cents) : null,
      cost_cents: newVariant.cost_cents ? parseInt(newVariant.cost_cents) : null,
      stock: parseInt(newVariant.stock) || 0,
      sku: newVariant.sku.trim() || null,
      attributes: attrs,
    });
    if (error) toast.error("Error al agregar variante");
    else { toast.success("Variante agregada"); setNewVariant({ variant_name: "", price_cents: "", cost_cents: "", stock: "0", sku: "", attributes: "{}" }); fetchProductDetails(editingId); }
  };

  const deleteVariant = async (vId: string) => {
    if (!editingId) return;
    await supabase.from("product_variants").delete().eq("id", vId);
    toast.success("Variante eliminada");
    fetchProductDetails(editingId);
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  // Image helpers
  const addImage = async () => {
    if (!editingId || !newImageUrl.trim()) return;
    const { error } = await supabase.from("product_images").insert({
      product_id: editingId,
      url: newImageUrl.trim(),
      sort_order: images.length,
    });
    if (error) toast.error("Error al agregar imagen");
    else { toast.success("Imagen agregada"); setNewImageUrl(""); fetchProductDetails(editingId); }
  };

  const uploadImage = async (file: File) => {
    if (!editingId) { toast.error("Guarda el producto primero"); return; }
    setUploadingImage(true);
    const ext = file.name.split(".").pop();
    const uuid = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const path = `${editingId}/${uuid}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) { toast.error("Error al subir imagen"); setUploadingImage(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const { error } = await supabase.from("product_images").insert({
      product_id: editingId,
      url: urlData.publicUrl,
      sort_order: images.length,
    });
    if (error) toast.error("Error al guardar imagen");
    else { toast.success("Imagen subida"); fetchProductDetails(editingId); }
    setUploadingImage(false);
  };

  const deleteImage = async (imgId: string) => {
    if (!editingId) return;
    await supabase.from("product_images").delete().eq("id", imgId);
    toast.success("Imagen eliminada");
    fetchProductDetails(editingId);
  };

  // Form view
  if (view === "form") {
    return (
      <div className="p-6 md:p-8 max-w-4xl">
        <button onClick={() => setView("list")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft size={16} /> Volver
        </button>
        <h1 className="font-display text-2xl text-foreground mb-6">{editingId ? "Editar Producto" : "Nuevo Producto"}</h1>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Nombre</label>
              <input className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.name}
                onChange={(e) => { const n = e.target.value; setForm((f) => ({ ...f, name: n, slug: editingId ? f.slug : autoSlug(n) })); }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Slug</label>
              <input className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Descripción</label>
            <textarea className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring" rows={3}
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Precio base (COP)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.price_cents ? form.price_cents / 100 : ""} onChange={(e) => setForm((f) => ({ ...f, price_cents: e.target.value ? parseInt(e.target.value) * 100 : 0 }))} />
              <p className="text-xs text-muted-foreground mt-1 text-gold">PVP guardado: {formatCOP(form.price_cents)}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Costo base (COP)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.cost_cents ? form.cost_cents / 100 : ""} onChange={(e) => setForm((f) => ({ ...f, cost_cents: e.target.value ? parseInt(e.target.value) * 100 : 0 }))} />
              <p className="text-xs text-muted-foreground mt-1 text-blue-500">Costo guardado: {formatCOP(form.cost_cents)}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Categoría</label>
              <select className="w-full mt-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-gold" /> Activo</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-gold" /> Destacado</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_custom_request} onChange={(e) => setForm((f) => ({ ...f, is_custom_request: e.target.checked }))} className="accent-gold" /> Pedido personalizado</label>
          </div>

          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-5 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Check size={14} /> {editingId ? "Actualizar" : "Crear"} Producto
          </button>
        </div>

        {/* Variants section - only when editing */}
        {editingId && (
          <div className="mt-10">
            <h2 className="font-display text-lg text-foreground mb-4">Variantes</h2>
            {variants.length > 0 && (
              <div className="space-y-2 mb-4">
                {variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between border border-border p-3 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{v.variant_name}</span>
                      <span className="text-muted-foreground ml-2">
                        {v.price_cents != null ? formatCOP(v.price_cents) : "Precio base"} · Stock: {v.stock}
                        {v.sku && ` · SKU: ${v.sku}`}
                      </span>
                    </div>
                    <button onClick={() => deleteVariant(v.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="border border-border p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Agregar variante</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input placeholder="Nombre (ej: Oro 18k - Talla 7)" className="px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newVariant.variant_name} onChange={(e) => setNewVariant((v) => ({ ...v, variant_name: e.target.value }))} />
                <input placeholder="Precio (COP, vacío=base)" type="number" className="px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newVariant.price_cents ? parseInt(newVariant.price_cents) / 100 : ""} onChange={(e) => setNewVariant((v) => ({ ...v, price_cents: e.target.value ? (parseInt(e.target.value) * 100).toString() : "" }))} />
                <input placeholder="Costo (COP, vacío=base)" type="number" className="px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newVariant.cost_cents ? parseInt(newVariant.cost_cents) / 100 : ""} onChange={(e) => setNewVariant((v) => ({ ...v, cost_cents: e.target.value ? (parseInt(e.target.value) * 100).toString() : "" }))} />
                <input placeholder="Stock" type="number" className="px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newVariant.stock} onChange={(e) => setNewVariant((v) => ({ ...v, stock: e.target.value }))} />
                <input placeholder="SKU" className="px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newVariant.sku} onChange={(e) => setNewVariant((v) => ({ ...v, sku: e.target.value }))} />
              </div>
              <div>
                <input placeholder='Atributos JSON (ej: {"metal":"oro","talla":"7"})' className="w-full px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newVariant.attributes} onChange={(e) => setNewVariant((v) => ({ ...v, attributes: e.target.value }))} />
              </div>
              <button onClick={addVariant} className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90">
                <Plus size={14} /> Agregar
              </button>
            </div>
          </div>
        )}

        {/* Images section - only when editing */}
        {editingId && (
          <div className="mt-10">
            <h2 className="font-display text-lg text-foreground mb-4">Imágenes</h2>
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {images.map((img) => (
                  <div key={img.id} className="relative border border-border group">
                    <img src={img.url} alt={img.alt || ""} className="w-full aspect-square object-cover" />
                    <button onClick={() => deleteImage(img.id)}
                      className="absolute top-1 right-1 bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <div className="flex gap-2">
                <label className={`inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 cursor-pointer ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                  <Upload size={14} /> {uploadingImage ? "Subiendo..." : "Subir imagen"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
                </label>
              </div>
              <div className="flex gap-2">
                <input placeholder="O pegar URL de imagen" className="flex-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
                <button onClick={addImage} className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90">
                  <ImageIcon size={14} /> Agregar URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Productos</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-secondary animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay productos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">Producto</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium hidden md:table-cell">Precio</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium hidden lg:table-cell">Categoría</th>
                <th className="py-3 pr-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">Estado</th>
                <th className="py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                return (
                  <tr key={p.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">/{p.slug}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{formatCOP(p.price_cents)}</td>
                    <td className="py-3 pr-4 text-muted-foreground hidden lg:table-cell">{cat?.name || "—"}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${p.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {p.is_active ? "Activo" : "Inactivo"}
                        </span>
                        {p.featured && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">★</span>}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
