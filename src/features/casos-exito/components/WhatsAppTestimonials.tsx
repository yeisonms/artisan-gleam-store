import React from "react";

const testimonials = [
  {
    id: 1,
    name: "Alejandro M.",
    time: "Hoy 10:42 a. m.",
    messages: [
      "¡Hola! Acaba de llegar el anillo, es espectacular, a mi novia le encantó mil gracias 😍💍",
      "Excelente servicio, la caja de lujo le dio un toque muy especial."
    ]
  },
  {
    id: 2,
    name: "Carolina G.",
    time: "Ayer 4:15 p. m.",
    messages: [
      "Buenas tardes, quiero confirmarles que recibí la pulsera.",
      "La calidad del oro se nota muchísimo. Es justo lo que buscaba ✨"
    ]
  },
  {
    id: 3,
    name: "David R.",
    time: "Lunes 11:30 a. m.",
    messages: [
      "Magna Arte, mil gracias por asesorarme con el dije personalizado.",
      "A mi esposa se le salieron las lágrimas al verlo. 🥹 Tienen un cliente para toda la vida."
    ]
  }
];

export default function WhatsAppTestimonials() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">Lo que nuestros clientes dicen de nosotros</h2>
          <p className="text-muted-foreground text-lg">Experiencias reales, joyas inolvidables.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex justify-center">
              {/* Contenedor tipo teléfono */}
              <div className="w-full max-w-[320px] bg-[#EFEAE2] rounded-[2rem] shadow-xl border-4 border-white overflow-hidden relative pb-10 pt-4">
                {/* Status Bar Mock */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-center">
                  <div className="w-16 h-1 bg-gray-300 rounded-full mt-2"></div>
                </div>

                {/* Chat Header */}
                <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3 shadow-md relative z-10 mt-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                    <span className="text-sm bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{testimonial.name}</h3>
                    <p className="text-[10px] text-white/80">en línea</p>
                  </div>
                </div>

                {/* Chat Body */}
                <div className="p-4 flex flex-col gap-3 relative z-0" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: 'cover' }}>
                  
                  {/* Etiqueta de fecha */}
                  <div className="flex justify-center mb-2">
                    <span className="bg-[#E1F3FB] text-gray-600 text-[11px] px-3 py-1 rounded-lg shadow-sm">
                      HOY
                    </span>
                  </div>

                  {testimonial.messages.map((msg, index) => (
                    <div key={index} className="flex justify-start">
                      <div className="bg-white px-3 py-2 rounded-lg rounded-tl-none shadow-sm max-w-[85%] relative">
                        <p className="text-sm text-gray-800 leading-relaxed">{msg}</p>
                        <span className="text-[10px] text-gray-400 block text-right mt-1">{testimonial.time}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Respuesta de la tienda (simulada) */}
                  <div className="flex justify-end mt-2">
                    <div className="bg-[#DCF8C6] px-3 py-2 rounded-lg rounded-tr-none shadow-sm max-w-[85%] relative">
                      <p className="text-sm text-gray-800 leading-relaxed">¡Nos alegra muchísimo leer esto! Gracias por confiar en Magna Arte ✨</p>
                      <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-500">{testimonial.time}</span>
                        <svg viewBox="0 0 16 15" width="14" height="14" fill="#53bdeb">
                          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Barra inferior simulada */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center">
                   <div className="w-1/3 h-1 bg-gray-400/50 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
