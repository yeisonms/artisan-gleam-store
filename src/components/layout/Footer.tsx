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
          <div className="flex flex-row items-center gap-6 relative z-50 isolate">
            <a href="https://www.instagram.com/tu_usuario" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram" className="block relative z-50 pointer-events-auto cursor-pointer text-gray-400 hover:text-gold transition-all duration-300 hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://www.facebook.com/tu_pagina" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Facebook" className="block relative z-50 pointer-events-auto cursor-pointer text-gray-400 hover:text-gold transition-all duration-300 hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@tu_usuario" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en TikTok" className="block relative z-50 pointer-events-auto cursor-pointer text-gray-400 hover:text-gold transition-all duration-300 hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.45-2.38 6.08-1.55 1.71-3.77 2.72-6.07 2.89-2.3.16-4.66-.4-6.42-1.84-1.76-1.45-2.8-3.63-2.92-5.91-.12-2.28.66-4.57 2.19-6.22 1.54-1.65 3.76-2.62 6.06-2.69v4.06c-1.37.07-2.73.7-3.62 1.79-.89 1.1-1.28 2.58-1.07 4.02.21 1.45 1.05 2.75 2.27 3.49 1.23.75 2.76.92 4.13.5 1.37-.42 2.51-1.38 3.16-2.66.65-1.29.83-2.81.5-4.21-.06-3.83-.02-7.66-.02-11.49z" />
              </svg>
            </a>
            <a href="https://wa.me/573184723859" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp" className="block relative z-50 pointer-events-auto cursor-pointer text-gray-400 hover:text-gold transition-all duration-300 hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
