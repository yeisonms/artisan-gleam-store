import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

interface WompiCheckoutButtonProps {
  disabled?: boolean;
  submitting?: boolean;
}

export default function WompiCheckoutButton({ disabled, submitting }: WompiCheckoutButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src="https://checkout.wompi.co/widget.js"]')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    script.setAttribute("data-public-key", import.meta.env.VITE_WOMPI_PUBLIC_KEY || "");
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  return (
    <button
      type="submit"
      disabled={disabled || submitting || !scriptLoaded}
      className="flex items-center justify-center gap-2 mt-6 w-full text-center px-8 py-4 bg-[#1a1a1a] text-white text-sm tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50 border border-gold/30 shadow-xl"
    >
      <Lock size={16} className="text-gold" />
      {submitting ? "Preparando pago..." : scriptLoaded ? "Pagar de forma segura" : "Cargando pasarela..."}
    </button>
  );
}


