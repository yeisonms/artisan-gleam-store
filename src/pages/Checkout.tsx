import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, formatCOP } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { processWebOrder, WebOrderPayload } from "@/services/webhookService";
import WompiCheckoutButton from "@/features/checkout/components/WompiCheckoutButton";
import { openWompiWidget } from "@/features/checkout/utils/wompi";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Nombre requerido").max(100),
  phone: z.string().trim().min(7, "Teléfono requerido").max(20),
  email: z.string().trim().email("Email inválido").max(255),
  address: z.string().trim().min(5, "Dirección requerida").max(300),
  city: z.string().trim().min(2, "Ciudad requerida").max(100),
  department: z.string().trim().min(2, "Departamento requerido").max(100),
  notes: z.string().max(500).optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, totalCents, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutForm>(() => {
    const saved = localStorage.getItem("magna_checkout_form");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      department: "",
      notes: "",
    };
  });

  useEffect(() => {
    localStorage.setItem("magna_checkout_form", JSON.stringify(form));
  }, [form]);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/carrito");
    }
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const reference = crypto.randomUUID(); // Referencia única para Wompi
      const total = totalCents();

      // Abrir Widget de Wompi de forma programática (Opción A)
      openWompiWidget(
        total,
        reference,
        {
          email: result.data.email,
          fullName: result.data.fullName,
          phone: result.data.phone
        },
        async (transaction) => {
          // Callback de éxito de Wompi
          try {
            // 1. Crear el cliente
            const { data: newCustomer, error: customerError } = await supabase
              .from('clientes')
              .insert({
                nombre: result.data.fullName,
                email: result.data.email,
                telefono: result.data.phone,
              })
              .select('id')
              .single();

            if (customerError) throw new Error("Error registrando datos del cliente");

            // 2. Procesar la orden omnicanal
            const payload: WebOrderPayload = {
              cliente_id: newCustomer.id,
              canal: 'Digital',
              estado_pago: 'Pagado',
              total_cents: total,
              detalles: items.map((item) => ({
                variante_id: item.variantId,
                cantidad: item.quantity,
                precio_unitario_cents: item.unitPriceCents,
                subtotal_cents: item.unitPriceCents * item.quantity,
              })),
            };

            const res = await processWebOrder(payload);
            if (!res.success) throw new Error(res.error);

            toast.success("¡Pago exitoso y pedido registrado!");
            clearCart();
            localStorage.removeItem("magna_checkout_form");
            navigate(`/checkout/success?ref=${reference}`);
          } catch (err) {
            console.error(err);
            toast.error("El pago fue exitoso pero hubo un error guardando el pedido. Contáctanos.");
          } finally {
            setSubmitting(false);
          }
        }
      );

      // Desactivamos el submitting si se cancela o cierra (Wompi no avisa explícitamente cierre sin pago, 
      // así que en un flujo real dependeríamos de webhooks, pero para este caso lo dejamos como "Pendiente" en UI o reactivamos tras unos segundos si falla).
      // Para evitar que quede bloqueado eternamente si el usuario cierra el modal:
      setTimeout(() => setSubmitting(false), 2000);

    } catch (err) {
      toast.error("Error inesperado. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground";

  return (
    <div className="container pt-36 pb-8 md:pt-40 md:pb-12 min-h-screen">
      <h1 className="font-display text-3xl text-foreground mb-2">Checkout</h1>
      <div className="w-12 h-px bg-gold mb-8" />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-display text-lg text-foreground mb-4">Datos de Contacto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input className={inputClass} placeholder="Nombre completo" autoComplete="name" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
                {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <input className={inputClass} placeholder="Teléfono" autoComplete="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <input className={inputClass} placeholder="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg text-foreground mb-4">Dirección de Envío</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <input className={inputClass} placeholder="Dirección" autoComplete="street-address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
                {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <input className={inputClass} placeholder="Ciudad" autoComplete="address-level2" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <input className={inputClass} placeholder="Departamento" autoComplete="address-level1" value={form.department} onChange={(e) => handleChange("department", e.target.value)} />
                {errors.department && <p className="text-destructive text-xs mt-1">{errors.department}</p>}
              </div>
              <div className="sm:col-span-2">
                <textarea className={`${inputClass} resize-none h-20`} placeholder="Notas (opcional)" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border border-border bg-card p-6 h-fit sticky top-24">
          <h2 className="font-display text-lg text-foreground mb-4">Tu Pedido</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.productName} × {item.quantity}
                </span>
                <span className="text-foreground">{formatCOP(item.unitPriceCents * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Envío</span>
              <span>$0 (incluido en el precio)</span>
            </div>
            <div className="flex justify-between font-display text-lg text-foreground">
              <span>Total</span>
              <span>{formatCOP(totalCents())}</span>
            </div>
          </div>
          <WompiCheckoutButton submitting={submitting} />
        </div>
      </form>
    </div>
  );
}
