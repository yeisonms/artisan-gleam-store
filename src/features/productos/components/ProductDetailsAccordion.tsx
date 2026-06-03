import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-sm uppercase tracking-widest text-charcoal group-hover:text-gold transition-colors">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={16} className="text-muted-foreground group-hover:text-gold" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm text-muted-foreground leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProductDetailsAccordionProps {
  description: string;
  attributes?: Record<string, string>;
}

export default function ProductDetailsAccordion({ description, attributes }: ProductDetailsAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>("desc");

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="mt-12">
      <AccordionItem
        title="Descripción del Producto"
        isOpen={openSection === "desc"}
        onToggle={() => toggle("desc")}
      >
        {description ? description : "Una obra maestra artesanal, cuidadosamente fabricada con materiales de la más alta calidad para perdurar en el tiempo."}
      </AccordionItem>

      <AccordionItem
        title="Detalles y Especificaciones"
        isOpen={openSection === "specs"}
        onToggle={() => toggle("specs")}
      >
        {attributes && Object.keys(attributes).length > 0 ? (
          <ul className="space-y-2">
            {Object.entries(attributes).map(([key, value]) => (
              <li key={key} className="flex justify-between border-b border-border/50 pb-1">
                <span className="capitalize">{key}</span>
                <span className="text-foreground">{value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Los detalles técnicos de esta pieza certifican la autenticidad y pureza de los materiales utilizados (Oro de ley, gemas naturales certificadas).</p>
        )}
      </AccordionItem>

      <AccordionItem
        title="Envíos y Devoluciones"
        isOpen={openSection === "shipping"}
        onToggle={() => toggle("shipping")}
      >
        <p className="mb-2"><strong>Envíos Asegurados:</strong> Realizamos envíos a nivel nacional e internacional. Cada pieza viaja con un seguro total contra pérdida o robo, en empaques discretos para su seguridad.</p>
        <p><strong>Devoluciones:</strong> Garantía de satisfacción de 15 días. Si la pieza no cumple tus expectativas, puedes solicitar un cambio o reembolso, siempre y cuando no haya sido alterada ni usada.</p>
      </AccordionItem>

      <AccordionItem
        title="Cuidados de la Joya"
        isOpen={openSection === "care"}
        onToggle={() => toggle("care")}
      >
        <p>Para preservar el brillo de esta pieza, recomendamos limpiarla suavemente con el paño de microfibra incluido. Evite el contacto con perfumes, cloro y lociones químicas. Guarde la joya en su estuche original cuando no esté en uso.</p>
      </AccordionItem>
    </div>
  );
}
