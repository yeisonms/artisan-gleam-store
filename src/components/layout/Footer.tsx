import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black">
      <div className="container py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <h3 className="font-display text-xl tracking-[0.2em] mb-4 text-gold">
              MAGNA <span className="font-light">ARTE</span>
            </h3>
            <p className="text-sm text-ivory/60 leading-relaxed max-w-xs font-sans">
              Joyería artesanal de alta calidad. Cada pieza cuenta una historia única, elaborada con pasión y dedicación.
            </p>
          </div>

          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase mb-4 text-gold">Colecciones</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/productos?categoria=pulseras" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Pulseras</Link>
              <Link to="/productos?categoria=anillos" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Anillos</Link>
              <Link to="/productos?categoria=aretes" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Aretes</Link>
              <Link to="/productos?categoria=dijes" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Dijes</Link>
              <Link to="/productos?categoria=elaboracion-personalizada-de-joyas" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Joyas Personalizadas</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase mb-4 text-gold">Información</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/politicas" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Políticas de Envío</Link>
              <Link to="/politicas" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Devoluciones</Link>
              <Link to="/politicas" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Garantía</Link>
              <Link to="/politicas" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Privacidad</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-display text-xs tracking-[0.2em] uppercase mb-4 text-gold">Contacto</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/contacto" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Contáctanos</Link>
              <Link to="/solicitud-personalizada" className="text-sm text-ivory/50 hover:text-gold transition-colors font-sans">Joya Personalizada</Link>
            </nav>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-gold/20 text-center">
          <p className="text-xs text-ivory/40 font-sans tracking-wide max-w-md mx-auto">
            © {new Date().getFullYear()} Magna Arte. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
