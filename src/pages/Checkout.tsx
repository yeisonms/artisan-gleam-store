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

const FloatingInput = ({ label, id, error, isTextArea, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(props.value);
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative mb-4">
      <div className={`relative border ${error ? 'border-destructive' : 'border-border/60 hover:border-border'} bg-white/50 backdrop-blur-sm transition-colors duration-300 focus-within:border-gold focus-within:bg-white`}>
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-300 pointer-events-none text-muted-foreground z-10
            ${isFloating ? 'text-[10px] top-2 uppercase tracking-widest font-medium text-charcoal/70' : 'text-sm top-4'}
          `}
        >
          {label}
        </label>
        {isTextArea ? (
          <textarea
            id={id}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-transparent px-4 pb-3 pt-7 text-base text-foreground focus:outline-none resize-none h-24 relative z-0`}
            {...props}
          />
        ) : (
          <input
            id={id}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-transparent px-4 pb-2 pt-6 text-base text-foreground focus:outline-none relative z-0`}
            {...props}
          />
        )}
      </div>
      {error && <p className="text-destructive text-xs mt-1 absolute -bottom-5 left-1">{error}</p>}
    </div>
  );
};

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
      const reference = crypto.randomUUID(); 
      const total = totalCents();

      openWompiWidget(
        total,
        reference,
        {
          email: result.data.email,
          fullName: result.data.fullName,
          phone: result.data.phone
        },
        async (transaction) => {
          try {
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

      setTimeout(() => setSubmitting(false), 2000);

    } catch (err) {
      toast.error("Error inesperado. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] pt-40 md:pt-48 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-gold/20 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-3 tracking-wide">Finalizar Compra</h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Estás a un paso de brillar</p>
        </div>

        <div className="bg-white rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-border/40">
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row">
            
            {/* Columna Izquierda: Formulario */}
            <div className="lg:w-3/5 p-8 md:p-12">
              <div className="space-y-10">
                {/* Contacto */}
                <section>
                  <h2 className="font-serif text-xl text-charcoal mb-6 flex items-center gap-3">
                    <span className="w-6 h-px bg-gold"></span>
                    Datos de Contacto
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    <FloatingInput 
                      id="fullName" 
                      label="Nombre completo" 
                      autoComplete="name" 
                      value={form.fullName} 
                      onChange={(e: any) => handleChange("fullName", e.target.value)} 
                      error={errors.fullName} 
                    />
                    <FloatingInput 
                      id="phone" 
                      label="Teléfono" 
                      autoComplete="tel" 
                      value={form.phone} 
                      onChange={(e: any) => handleChange("phone", e.target.value)} 
                      error={errors.phone} 
                    />
                    <div className="sm:col-span-2">
                      <FloatingInput 
                        id="email" 
                        label="Correo electrónico" 
                        type="email" 
                        autoComplete="email" 
                        value={form.email} 
                        onChange={(e: any) => handleChange("email", e.target.value)} 
                        error={errors.email} 
                      />
                    </div>
                  </div>
                </section>

                <div className="w-full h-px bg-border/40 my-8"></div>

                {/* Envío */}
                <section>
                  <h2 className="font-serif text-xl text-charcoal mb-6 flex items-center gap-3">
                    <span className="w-6 h-px bg-gold"></span>
                    Dirección de Envío
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    <div className="sm:col-span-2">
                      <FloatingInput 
                        id="address" 
                        label="Dirección completa" 
                        autoComplete="street-address" 
                        value={form.address} 
                        onChange={(e: any) => handleChange("address", e.target.value)} 
                        error={errors.address} 
                      />
                    </div>
                    <FloatingInput 
                      id="city" 
                      label="Ciudad" 
                      autoComplete="address-level2" 
                      value={form.city} 
                      onChange={(e: any) => handleChange("city", e.target.value)} 
                      error={errors.city} 
                    />
                    <FloatingInput 
                      id="department" 
                      label="Departamento" 
                      autoComplete="address-level1" 
                      value={form.department} 
                      onChange={(e: any) => handleChange("department", e.target.value)} 
                      error={errors.department} 
                    />
                    <div className="sm:col-span-2">
                      <FloatingInput 
                        id="notes" 
                        label="Notas adicionales (Opcional)" 
                        isTextArea 
                        value={form.notes} 
                        onChange={(e: any) => handleChange("notes", e.target.value)} 
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Columna Derecha: Resumen */}
            <div className="lg:w-2/5 bg-[#faf9f8] p-8 md:p-12 lg:border-l border-border/40">
              <div className="sticky top-32">
                <h2 className="font-serif text-xl text-charcoal mb-8 tracking-wide">Resumen del Pedido</h2>
                
                <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex items-center gap-4 group">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-white border border-border/50 shrink-0 relative">
                        <img 
                          src={item.imageUrl || "/placeholder.png"} 
                          alt={item.productName} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <span className="absolute -top-2 -right-2 bg-charcoal text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-charcoal truncate pr-4">{item.productName}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                      </div>
                      <span className="text-sm font-medium text-charcoal shrink-0">
                        {formatCOP(item.unitPriceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-gold/20">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCOP(totalCents())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Envío asegurado</span>
                    <span className="text-gold font-medium">Gratis</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gold/20 flex justify-between items-end">
                    <span className="font-serif text-xl text-charcoal">Total</span>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block mb-1">COP</span>
                      <span className="font-serif text-2xl text-charcoal">{formatCOP(totalCents())}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <WompiCheckoutButton submitting={submitting} />
                  
                  <div className="mt-6 flex items-center justify-center gap-3 opacity-60">
                    <svg className="w-6 h-6 text-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span className="text-xs tracking-wider uppercase text-charcoal">Pago 100% seguro y encriptado</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
