import { Link } from "react-router-dom";
import logoTransparent from "@/assets/logo-transparent.png";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-12 relative overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-6 transition-opacity hover:opacity-80">
              <img src={logoTransparent} alt="Magna Arte" className="h-20 md:h-28 w-auto object-contain" />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed font-light">
              Joyería artesanal de alta calidad. Cada pieza cuenta una historia única, elaborada con pasión y dedicación.
            </p>
          </div>

          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase mb-6 text-gold">Colecciones</h4>
            <nav className="flex flex-col gap-4">
              <Link to="/productos?categoria=pulseras" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Pulseras</Link>
              <Link to="/productos?categoria=anillos" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Anillos</Link>
              <Link to="/productos?categoria=aretes" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Aretes</Link>
              <Link to="/productos?categoria=dijes" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Dijes</Link>
              <Link to="/productos?categoria=elaboracion-personalizada-de-joyas" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Joyas Personalizadas</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase mb-6 text-gold">Información</h4>
            <nav className="flex flex-col gap-4">
              <Link to="/politicas" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Políticas de Envío</Link>
              <Link to="/politicas" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Devoluciones</Link>
              <Link to="/politicas" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Garantía</Link>
              <Link to="/politicas" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Privacidad</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase mb-6 text-gold">Contacto</h4>
            <nav className="flex flex-col gap-4">
              <Link to="/contacto" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Contáctanos</Link>
              <Link to="/solicitud-personalizada" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">Diseño personalizado</Link>
            </nav>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 tracking-widest">
            © {new Date().getFullYear()} MAGNA ARTE. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/40 tracking-widest uppercase cursor-pointer hover:text-white transition-colors">Instagram</span>
            <span className="text-xs text-white/40 tracking-widest uppercase cursor-pointer hover:text-white transition-colors">Facebook</span>
            <span className="text-xs text-white/40 tracking-widest uppercase cursor-pointer hover:text-white transition-colors">Tiktok</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
