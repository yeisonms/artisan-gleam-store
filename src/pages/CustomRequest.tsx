import { useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, X } from "lucide-react";

const requestSchema = z.object({
  fullName: z.string().trim().min(2, "Nombre requerido").max(100),
  phone: z.string().trim().min(7, "Teléfono requerido").max(20),
  email: z.string().trim().email("Email inválido").max(255),
  categoryHint: z.string().trim().max(100).optional(),
  budgetCents: z.number().nullable().optional(),
  details: z.string().trim().min(10, "Describe tu idea con más detalle").max(2000),
  referenceLinks: z.string().max(1000).optional()
    .refine((val) => {
      if (!val) return true;
      const urls = val.split('\n').filter(Boolean);
      return urls.every(url => {
        try {
          const parsed = new URL(url.trim());
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      });
    }, { message: 'Todos los enlaces deben ser URLs válidas (http/https)' }),
});

export default function CustomRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    categoryHint: searchParams.get("producto") || "",
    budget: "",
    details: "",
    referenceLinks: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (uploadedFiles.length + files.length > 5) {
      toast.error("Máximo 5 imágenes permitidas.");
      return;
    }
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} no es una imagen.`); continue; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} excede 5 MB.`); continue; }
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("custom-request-images").upload(path, file);
      if (error) { toast.error(`Error subiendo ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("custom-request-images").getPublicUrl(path);
      setUploadedFiles((prev) => [...prev, { name: file.name, url: urlData.publicUrl }]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetCents = form.budget ? Math.round(parseFloat(form.budget) * 100) : null;

    const result = requestSchema.safeParse({
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      categoryHint: form.categoryHint,
      budgetCents,
      details: form.details,
      referenceLinks: form.referenceLinks,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Combine uploaded image URLs with reference links
    const allImages = [
      ...uploadedFiles.map((f) => f.url),
      ...(form.referenceLinks ? form.referenceLinks.split("\n").filter(Boolean) : []),
    ];

    setSubmitting(true);
    const { error } = await supabase.from("custom_requests").insert({
      full_name: form.fullName,
      phone: form.phone,
      email: form.email,
      category_hint: form.categoryHint || null,
      budget_cents: budgetCents,
      details: form.details,
      reference_images: allImages,
      status: "new",
    });

    if (error) {
      toast.error("Error al enviar solicitud. Intenta de nuevo.");
    } else {
      toast.success("¡Solicitud enviada! Nos pondremos en contacto pronto.");
      navigate("/");
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground";

  return (
    <div className="container py-8 md:py-12 min-h-screen max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-foreground mb-2">Joya Personalizada</h1>
      <div className="w-12 h-px bg-gold mb-4" />
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Cuéntanos tu idea y crearemos una pieza única para ti. Completa el formulario y nos pondremos en contacto.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <input className={inputClass} placeholder="Nombre completo *" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
            {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <input className={inputClass} placeholder="Teléfono *" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <input className={inputClass} type="email" placeholder="Email *" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <input className={inputClass} placeholder="Tipo de joya (ej: anillo, pulsera)" value={form.categoryHint} onChange={(e) => handleChange("categoryHint", e.target.value)} />
        </div>

        <div>
          <input className={inputClass} placeholder="Presupuesto estimado en COP (opcional)" type="number" value={form.budget} onChange={(e) => handleChange("budget", e.target.value)} />
        </div>

        <div>
          <textarea className={`${inputClass} resize-none h-32`} placeholder="Describe tu idea con detalle *" value={form.details} onChange={(e) => handleChange("details", e.target.value)} />
          {errors.details && <p className="text-destructive text-xs mt-1">{errors.details}</p>}
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Imágenes de referencia (máx. 5, hasta 5 MB c/u)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || uploadedFiles.length >= 5}
            className={`${inputClass} flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Subiendo..." : "Seleccionar imágenes"}
          </button>
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="relative group">
                  <img src={file.url} alt={file.name} className="w-20 h-20 object-cover rounded border border-border" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <textarea className={`${inputClass} resize-none h-20`} placeholder="Enlaces de referencia (uno por línea, opcional)" value={form.referenceLinks} onChange={(e) => handleChange("referenceLinks", e.target.value)} />
          {errors.referenceLinks && <p className="text-destructive text-xs mt-1">{errors.referenceLinks}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-8 py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </form>
    </div>
  );
}
