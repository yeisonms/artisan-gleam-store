import React from "react";

const customers = [
  { src: "/casos-exito/cliente1.webp", name: "Juan Carlos", location: "Bucaramanga, Pulsera de oro" },
  { src: "/casos-exito/cliente2.webp", name: "Ruby", location: "Segovia, Antioquia, Anillo en plata y esmeralda" },
  { src: "/casos-exito/cliente3.webp", name: "Mariana Jaramillo", location: "Cucuta, Manilla en oro laminado y esmeraldas" },
  { src: "/casos-exito/cliente4.webp", name: "Alberto", location: "Bogota, Pulsera de plata y esmeraldas" },
  { src: "/casos-exito/cliente5.webp", name: "Ruby", location: "Segovia, Antioquia, Anillo en plata y esmeralda" },
  { src: "/casos-exito/cliente6.webp", name: "Carlos", location: "Bogota, Manilla en oro laminado y esmeraldas" },
  //{ src: "/casos-exito/cliente7.webp", name: "Mariana", location: "Cucuta, Manilla en oro laminado y esmeraldas" },
];

export default function CustomerMasonryGrid() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">Parte de la familia Magna Arte</h2>
          <p className="text-muted-foreground text-lg">Nuestros clientes lucen sus joyas con orgullo.</p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 max-w-7xl mx-auto">
          {customers.map((customer, index) => (
            <div key={index} className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm cursor-pointer">
              <img
                src={customer.src}
                alt={`${customer.name} - ${customer.location}`}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                loading="lazy"
              />
              {/* Overlay hover con gradiente para lectura clara */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Contenido flotante */}
              <div className="absolute bottom-0 left-0 p-4 md:p-5 w-full flex flex-col translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-white font-semibold text-sm md:text-base drop-shadow-md tracking-wide">
                  {customer.name}
                </span>
                <span className="text-white/80 text-xs md:text-sm drop-shadow-sm font-light mt-0.5">
                  {customer.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
