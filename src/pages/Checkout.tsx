import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, formatCOP } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

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
  const [form, setForm] = useState<CheckoutForm>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    department: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    navigate("/carrito");
    return null;
  }

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
      const total = totalCents();
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          status: "pending_payment" as const,
          customer_name: result.data.fullName,
          customer_email: result.data.email,
          customer_phone: result.data.phone,
          shipping_address: {
            address: result.data.address,
            city: result.data.city,
            department: result.data.department,
            notes: result.data.notes || "",
          },
          subtotal_cents: total,
          shipping_cents: 0,
          tax_cents: 0,
          total_cents: total,
          currency: "COP",
        })
        .select("id")
        .single();

      if (orderError || !order) {
        toast.error("Error al crear el pedido. Intenta de nuevo.");
        setSubmitting(false);
        return;
      }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        variant_id: item.variantId,
        product_name_snapshot: item.productName,
        variant_snapshot: { name: item.variantName, attributes: item.attributes },
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        toast.error("Error al registrar los productos del pedido.");
        setSubmitting(false);
        return;
      }

      toast.success("¡Pedido registrado!");
      clearCart();
      navigate(`/pedido-exitoso?pedido=${order.id}`);
    } catch {
      toast.error("Error inesperado. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground";

  return (
    <div className="container py-8 md:py-12 min-h-screen">
      <h1 className="font-display text-3xl text-foreground mb-2">Checkout</h1>
      <div className="w-12 h-px bg-gold mb-8" />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-display text-lg text-foreground mb-4">Datos de Contacto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input className={inputClass} placeholder="Nombre completo" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
                {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <input className={inputClass} placeholder="Teléfono" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <input className={inputClass} placeholder="Email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg text-foreground mb-4">Dirección de Envío</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <input className={inputClass} placeholder="Dirección" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
                {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <input className={inputClass} placeholder="Ciudad" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <input className={inputClass} placeholder="Departamento" value={form.department} onChange={(e) => handleChange("department", e.target.value)} />
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
          <button
            type="submit"
            disabled={submitting}
            className="block mt-6 w-full text-center px-8 py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Procesando..." : "Realizar Pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
