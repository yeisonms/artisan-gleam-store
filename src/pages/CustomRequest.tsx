import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const requestSchema = z.object({
  fullName: z.string().trim().min(2, "Nombre requerido").max(100),
  phone: z.string().trim().min(7, "Teléfono requerido").max(20),
  email: z.string().trim().email("Email inválido").max(255),
  categoryHint: z.string().trim().max(100).optional(),
  budgetCents: z.number().nullable().optional(),
  details: z.string().trim().min(10, "Describe tu idea con más detalle").max(2000),
  referenceLinks: z.string().max(1000).optional(),
});

export default function CustomRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
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

    setSubmitting(true);
    const { error } = await supabase.from("custom_requests").insert({
      full_name: form.fullName,
      phone: form.phone,
      email: form.email,
      category_hint: form.categoryHint || null,
      budget_cents: budgetCents,
      details: form.details,
      reference_images: form.referenceLinks
        ? form.referenceLinks.split("\n").filter(Boolean)
        : [],
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

        <div>
          <textarea className={`${inputClass} resize-none h-20`} placeholder="Enlaces de referencia (uno por línea, opcional)" value={form.referenceLinks} onChange={(e) => handleChange("referenceLinks", e.target.value)} />
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
