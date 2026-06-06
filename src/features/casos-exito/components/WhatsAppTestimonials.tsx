import React from "react";

const screenshots = [
  { src: "/casos-exito/whatsapp1.webp", name: "Alejandro", location: "Medellín" },
  { src: "/casos-exito/whatsapp2.webp", name: "Nombre del Cliente", location: "Ciudad, País" },
  { src: "/casos-exito/whatsapp3.webp", name: "Nombre del Cliente", location: "Ciudad, País" },
  { src: "/casos-exito/whatsapp4.webp", name: "Nombre del Cliente", location: "Ciudad, País" },
  { src: "/casos-exito/whatsapp5.webp", name: "Nombre del Cliente", location: "Ciudad, País" },
  { src: "/casos-exito/whatsapp6.webp", name: "Nombre del Cliente", location: "Ciudad, País" },
];

export default function WhatsAppTestimonials() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">Lo que nuestros clientes dicen de nosotros</h2>
          <p className="text-muted-foreground text-lg">Experiencias reales, joyas inolvidables.</p>
        </div>

        {/* Masonry Grid para Screenshots */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4 max-w-5xl mx-auto">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm cursor-pointer border border-gray-200">
              <img
                src={screenshot.src}
                alt={`Testimonio de ${screenshot.name}`}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                loading="lazy"
              />
              {/* Overlay hover con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Contenido flotante */}
              <div className="absolute bottom-0 left-0 p-4 md:p-5 w-full flex flex-col translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
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
      </div>
    </section>
  );
}
