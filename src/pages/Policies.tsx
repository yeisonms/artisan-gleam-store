import { motion } from "framer-motion";
import { useState } from "react";

const sections = [
  {
    id: "envios",
    title: "Política de Envíos",
    content: [
      "Todos nuestros envíos son gratuitos a nivel nacional en Colombia.",
      "Los pedidos se procesan en un plazo de 1 a 3 días hábiles después de confirmado el pago.",
      "El tiempo de entrega estimado es de 3 a 7 días hábiles dependiendo de la ubicación.",
      "Recibirás un número de seguimiento por correo electrónico una vez tu pedido sea despachado.",
      "Para joyas personalizadas, el tiempo de elaboración puede variar entre 5 y 15 días hábiles adicionales.",
    ],
  },
  {
    id: "devoluciones",
    title: "Política de Devoluciones",
    content: [
      "Aceptamos devoluciones dentro de los 15 días calendario posteriores a la recepción del producto.",
      "El producto debe estar en su estado original, sin uso y con su empaque completo.",
      "Las joyas personalizadas no son elegibles para devolución, salvo defectos de fabricación.",
      "Para iniciar una devolución, contáctanos por correo electrónico o WhatsApp con tu número de pedido.",
      "El reembolso se procesará dentro de los 10 días hábiles siguientes a la recepción del producto devuelto.",
    ],
  },
  {
    id: "garantia",
    title: "Garantía",
    content: [
      "Todas nuestras piezas cuentan con garantía de 6 meses contra defectos de fabricación.",
      "La garantía cubre defectos en materiales y mano de obra bajo condiciones normales de uso.",
      "No cubre daños por uso indebido, golpes, exposición a químicos o modificaciones realizadas por terceros.",
      "Para hacer uso de la garantía, presenta tu comprobante de compra y contacta nuestro equipo.",
    ],
  },
  {
    id: "privacidad",
    title: "Política de Privacidad",
    content: [
      "Recopilamos información personal (nombre, email, teléfono, dirección) únicamente para procesar y entregar tus pedidos.",
      "No compartimos tu información con terceros, excepto con servicios de envío para la entrega de tu pedido.",
      "Utilizamos medidas de seguridad para proteger tu información personal.",
      "Puedes solicitar la eliminación de tus datos personales contactándonos directamente.",
      "Al realizar una compra, aceptas los términos descritos en esta política.",
    ],
  },
  {
    id: "pagos",
    title: "Métodos de Pago",
    content: [
      "Aceptamos pagos a través de la plataforma segura Wompi.",
      "Puedes pagar con tarjeta de crédito, débito, PSE y otros métodos disponibles en Wompi.",
      "Todos los precios están expresados en Pesos Colombianos (COP) e incluyen el envío.",
      "El cobro se realiza al momento de confirmar tu pedido.",
    ],
  },
];

export default function Policies() {
  const [activeSection, setActiveSection] = useState("envios");

  return (
    <div className="min-h-screen">
      <div className="container py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl text-foreground">Políticas</h1>
          <div className="w-12 h-px bg-gold mt-3" />
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar nav */}
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`whitespace-nowrap text-left px-4 py-2 text-sm transition-colors border-l-2 md:border-l-2 border-b-2 md:border-b-0 ${
                  activeSection === s.id
                    ? "border-gold text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.title}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="md:col-span-3">
            {sections
              .filter((s) => s.id === activeSection)
              .map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-xl text-foreground mb-6">{s.title}</h2>
                  <ul className="space-y-4">
                    {s.content.map((text, i) => (
                      <li key={i} className="flex gap-3 text-muted-foreground leading-relaxed">
                        <span className="text-gold mt-1.5 flex-shrink-0">•</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
