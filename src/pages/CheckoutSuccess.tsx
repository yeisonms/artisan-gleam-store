import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("ref");

  useEffect(() => {
    // Scroll al inicio de la página al cargar
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#FAFAFA] flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <h1 className="font-serif text-4xl text-charcoal mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Tu pago ha sido procesado correctamente y tu pedido está confirmado. 
          Te enviaremos un correo con los detalles del envío pronto.
        </p>

        {reference && (
          <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-10">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Referencia de Transacción</p>
            <p className="font-mono text-charcoal font-medium">{reference}</p>
          </div>
        )}

        <Link
          to="/productos"
          className="inline-flex items-center justify-center px-8 py-4 bg-gold text-[#1a1a1a] font-sans font-medium text-sm tracking-[0.2em] uppercase hover:bg-gold-light transition-all duration-300 shadow-md"
        >
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
}
