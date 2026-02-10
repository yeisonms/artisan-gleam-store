import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Credenciales inválidas");
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="w-full max-w-sm p-8 bg-card border border-border">
        <h1 className="font-display text-2xl text-center text-foreground mb-2">
          MAGNA <span className="text-gold">ARTE</span>
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8">Panel de Administración</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input className={inputClass} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={inputClass} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold text-accent-foreground text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
