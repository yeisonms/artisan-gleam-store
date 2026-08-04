import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { Download } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { isInstallable, installPwa } = usePwaInstall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin/login" },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Cuenta creada. Revisa tu email para confirmar, luego inicia sesión.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Credenciales inválidas");
      } else {
        navigate("/admin");
      }
    }
    setLoading(false);
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-white/40 rounded-sm";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
      {/* Fondo elegante con blur */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/20 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute inset-0 bg-marble-texture opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-md p-10 bg-[#131313]/80 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 rounded-sm">
        <h1 className="font-serif text-3xl text-center text-white mb-2 tracking-widest uppercase">
          MEMORIES
        </h1>
        <p className="text-center text-white/50 text-sm mb-10 font-sans tracking-wide uppercase text-[10px]">
          Panel de Administración Exclusivo
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className={inputClass}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={inputClass}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-gold to-[#b38b22] text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-6 shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-sm uppercase tracking-wider"
          >
            {loading ? "Procesando..." : isSignUp ? "Crear Cuenta" : "Acceder al Panel"}
          </button>
        </form>

        {isInstallable && (
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center">
            <p className="text-[11px] text-white/40 mb-4 text-center uppercase tracking-widest">
              Acceso Rápido
            </p>
            <button
              onClick={installPwa}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-sm border border-gold/30 text-gold font-medium text-sm hover:bg-gold/10 transition-colors backdrop-blur-sm"
            >
              <Download size={16} /> Instalar Memories Admin App
            </button>
          </div>
        )}

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-center text-xs text-white/40 hover:text-gold transition-colors"
        >
          {isSignUp ? "¿Ya tienes acceso? Inicia sesión" : "¿Necesitas acceso? Solicitar cuenta"}
        </button>
      </div>
    </div>
  );
}
