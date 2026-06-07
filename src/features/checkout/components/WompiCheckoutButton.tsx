import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

interface WompiCheckoutButtonProps {
  disabled?: boolean;
  submitting?: boolean;
}

export default function WompiCheckoutButton({ disabled, submitting }: WompiCheckoutButtonProps) {
  // El script ahora se carga estáticamente en index.html
  // Asumimos que está cargado.
  const scriptLoaded = true;

  return (
    <button
      type="submit"
      disabled={disabled || submitting}
      className="flex items-center justify-center gap-2 mt-6 w-full text-center px-8 py-4 bg-[#1a1a1a] text-white text-sm tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50 border border-gold/30 shadow-xl"
    >
      <Lock size={16} className="text-gold" />
      {submitting ? "Preparando pago..." : "Pagar de forma segura"}
    </button>
  );
}


