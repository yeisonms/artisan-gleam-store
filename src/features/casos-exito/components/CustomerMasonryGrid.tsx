import React from "react";

const images = [
  "https://images.unsplash.com/photo-1599643478524-fb524fa0a14b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1573408301145-b98c4af01158?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
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
          {images.map((src, index) => (
            <div key={index} className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm">
              <img
                src={src}
                alt={`Cliente Magna Arte ${index + 1}`}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                loading="lazy"
              />
              {/* Overlay hover sutil */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
