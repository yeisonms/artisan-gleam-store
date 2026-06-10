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
      className="relative flex items-center justify-center gap-2 mt-6 w-full text-center px-8 py-4 bg-gradient-to-br from-[#1a1a1a] to-black text-white text-sm tracking-widest uppercase hover:from-black hover:to-[#111] transition-all duration-500 ease-out disabled:opacity-50 border border-gold/40 shadow-xl hover:shadow-[0_8px_30px_rgb(212,175,55,0.15)] group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
      <Lock size={16} className="text-gold transition-transform duration-300 group-hover:scale-110 relative z-10" />
      <span className="relative z-10">{submitting ? "Preparando pago..." : "Pagar de forma segura"}</span>
    </button>
  );
}


