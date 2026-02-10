import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h3 className="font-display text-xl tracking-wider mb-4">
              MAGNA <span className="text-gold">ARTE</span>
            </h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              Joyería artesanal de alta calidad. Cada pieza cuenta una historia única, elaborada con pasión y dedicación.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm tracking-widest uppercase mb-4">Colecciones</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/productos?categoria=pulseras" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">Pulseras</Link>
              <Link to="/productos?categoria=anillos" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">Anillos</Link>
              <Link to="/productos?categoria=aretes" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">Aretes</Link>
              <Link to="/productos?categoria=dijes" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">Dijes</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-display text-sm tracking-widest uppercase mb-4">Contacto</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/productos?categoria=elaboracion-personalizada-de-joyas" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                Joyas Personalizadas
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Magna Arte. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
