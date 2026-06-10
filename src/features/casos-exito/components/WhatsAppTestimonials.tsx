import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const screenshots = [
  { src: "/casos-exito/whatsapp1.webp", name: "Alejandro", location: "Medellín" },
  { src: "/casos-exito/whatsapp2.webp", name: "Andres Perez", location: "Villavicencio" },
  { src: "/casos-exito/whatsapp3.webp", name: "Jairo Mesa", location: "Bucaramanga" },
  { src: "/casos-exito/whatsapp4.webp", name: "Laura Martinez", location: "Madrid" },
  { src: "/casos-exito/whatsapp5.webp", name: "Yenny", location: "Armenia" },
  { src: "/casos-exito/whatsapp6.webp", name: "Sofia", location: "Madrid" },
];

export default function WhatsAppTestimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/30 overflow-hidden">
      <div className="container px-0 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            Lo que nuestros clientes dicen de nosotros
          </h2>
          <p className="text-muted-foreground text-lg">
            Experiencias reales, joyas inolvidables.
          </p>
        </div>

        {/* Carrusel interactivo */}
        <div className="relative max-w-5xl mx-auto group">
          {/* Botón Izquierda */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/90 md:bg-white shadow-xl text-charcoal hover:bg-gold hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Grid / Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 md:gap-8 pb-8 pt-2 snap-x snap-mandatory px-6 md:px-0 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {screenshots.map((screenshot, index) => (
              <div
                key={index}
                className="w-[80vw] md:w-auto flex-none snap-center relative group/card rounded-xl overflow-hidden shadow-md cursor-pointer border border-gray-200"
              >
                <img
                  src={screenshot.src}
                  alt={`Testimonio de ${screenshot.name}`}
                  className="w-full h-auto object-cover transform group-hover/card:scale-105 transition-transform duration-500 ease-in-out"
                  loading="lazy"
                />
                {/* Overlay hover con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

                {/* Contenido flotante */}
                <div className="absolute bottom-0 left-0 p-4 md:p-5 w-full flex flex-col translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
                  <span className="text-white font-semibold text-sm md:text-base drop-shadow-md tracking-wide">
                    {screenshot.name}
                  </span>
                  <span className="text-white/80 text-xs md:text-sm drop-shadow-sm font-light mt-0.5">
                    {screenshot.location}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Botón Derecha */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/90 md:bg-white shadow-xl text-charcoal hover:bg-gold hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
