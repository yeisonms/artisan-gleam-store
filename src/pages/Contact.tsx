import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  subject: z.string().trim().min(2, "Asunto requerido").max(200),
  message: z.string().trim().min(10, "Escribe un mensaje más detallado").max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as keyof ContactForm] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    // Build WhatsApp message
    const whatsappMsg = encodeURIComponent(
      `Hola Magna Arte!\n\nNombre: ${result.data.name}\nEmail: ${result.data.email}\nAsunto: ${result.data.subject}\n\n${result.data.message}`
    );
    window.open(`https://wa.me/573000000000?text=${whatsappMsg}`, "_blank");
    toast.success("Redirigiendo a WhatsApp...");
    setSubmitting(false);
  };

  const inputClass =
    "w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen">
      <div className="container pt-36 pb-8 md:pt-40 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl text-foreground">Contacto</h1>
          <div className="w-12 h-px bg-gold mt-3" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <p className="text-muted-foreground leading-relaxed mb-8">
              ¿Tienes alguna pregunta sobre nuestras joyas? ¿Necesitas ayuda con un pedido?
              Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gold/10 text-gold flex-shrink-0">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="font-display text-sm text-foreground uppercase tracking-wider mb-1">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm">+57 300 000 0000</p>
                  <p className="text-xs text-muted-foreground/70">Respuesta en menos de 24 horas</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gold/10 text-gold flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-display text-sm text-foreground uppercase tracking-wider mb-1">Email</h3>
                  <p className="text-muted-foreground text-sm">contacto@magnaarte.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gold/10 text-gold flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="font-display text-sm text-foreground uppercase tracking-wider mb-1">Teléfono</h3>
                  <p className="text-muted-foreground text-sm">+57 300 000 0000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gold/10 text-gold flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-display text-sm text-foreground uppercase tracking-wider mb-1">Ubicación</h3>
                  <p className="text-muted-foreground text-sm">Colombia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                className={inputClass}
                placeholder="Nombre completo *"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                className={inputClass}
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                className={inputClass}
                placeholder="Asunto *"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
              {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
              <textarea
                className={`${inputClass} resize-none h-32`}
                placeholder="Tu mensaje *"
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
              />
              {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-8 py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              Enviar por WhatsApp
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
