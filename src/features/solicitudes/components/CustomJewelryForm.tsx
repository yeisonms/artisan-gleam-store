import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { PremiumInput } from "./PremiumInput";
import { PremiumTextarea } from "./PremiumTextarea";
import { ReferenceDropzone } from "./ReferenceDropzone";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const requestSchema = z.object({
  fullName: z.string().trim().min(2, "Nombre requerido").max(100),
  phone: z.string().trim().min(7, "Teléfono requerido").max(20),
  email: z.string().trim().email("Email inválido").max(255),
  categoryHint: z.string().trim().max(100).optional(),
  budget: z.string().optional(),
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

interface CustomJewelryFormProps {
  initialCategoryHint?: string;
}

export default function CustomJewelryForm({ initialCategoryHint = "" }: CustomJewelryFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    categoryHint: initialCategoryHint,
    budget: "",
    details: "",
    referenceLinks: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetCents = form.budget ? Math.round(parseFloat(form.budget) * 100) : null;

    const result = requestSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    
    const parsedLinks = form.referenceLinks
      ? form.referenceLinks.split("\n").filter(Boolean)
      : [];
      
    const allReferenceImages = [...uploadedImages, ...parsedLinks];

    const { error } = await supabase.from("custom_requests").insert({
      full_name: form.fullName,
      phone: form.phone,
      email: form.email,
      category_hint: form.categoryHint || null,
      budget_cents: budgetCents,
      details: form.details,
      reference_images: allReferenceImages,
      status: "new",
    });

    if (error) {
      toast.error("Error al enviar solicitud. Intenta de nuevo.");
      console.error(error);
    } else {
      toast.success("¡Solicitud enviada! Nos pondremos en contacto pronto.");
      navigate("/");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Sección 1: Datos de Contacto */}
      <div className="space-y-6">
        <h3 className="text-lg font-display text-charcoal border-b border-border/50 pb-2 mb-6">
          1. Datos de Contacto
        </h3>
        
        <PremiumInput
          label="Nombre Completo *"
          placeholder="Ej: María José Vélez"
          value={form.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          error={errors.fullName}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumInput
            label="Teléfono *"
            placeholder="+57 300 000 0000"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
          />
          <PremiumInput
            label="Correo Electrónico *"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
          />
        </div>
      </div>

      {/* Sección 2: Detalles de la Joya */}
      <div className="space-y-8">
        <h3 className="text-lg font-display text-charcoal border-b border-border/50 pb-2 mb-6">
          2. Detalles de la Joya
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumInput
            label="Tipo de Joya"
            placeholder="Ej: Anillo de Compromiso, Pulsera..."
            value={form.categoryHint}
            onChange={(e) => handleChange("categoryHint", e.target.value)}
            error={errors.categoryHint}
          />
          <PremiumInput
            label="Presupuesto Estimado (COP)"
            placeholder="Ej: 500000"
            type="number"
            value={form.budget}
            onChange={(e) => handleChange("budget", e.target.value)}
            error={errors.budget}
          />
        </div>

        <PremiumTextarea
          label="Descripción Detallada *"
          placeholder="Cuéntanos sobre el diseño, materiales preferidos (oro, plata), piedras preciosas, grabados, o cualquier historia detrás de la pieza..."
          value={form.details}
          onChange={(e) => handleChange("details", e.target.value)}
          error={errors.details}
          className="h-32"
        />

        <ReferenceDropzone
          onFilesChange={setUploadedImages}
          onLinksChange={(val) => handleChange("referenceLinks", val)}
          linksValue={form.referenceLinks}
          error={errors.referenceLinks}
        />
      </div>

      {/* Botón CTA */}
      <div className="pt-8 mt-12 border-t border-border/50">
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-charcoal text-gold text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-black transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-xl hover:-translate-y-1 rounded-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando Solicitud...
            </>
          ) : (
            "Enviar Solicitud"
          )}
        </button>
      </div>
    </form>
  );
}
