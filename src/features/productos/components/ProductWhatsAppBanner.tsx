import { MessageCircle, ArrowRight } from "lucide-react";

interface ProductWhatsAppBannerProps {
  productName: string;
}

export default function ProductWhatsAppBanner({ productName }: ProductWhatsAppBannerProps) {
  const phoneNumber = "573223842813";
  const message = `Hola, estoy interesado en el producto ${productName}`;
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-green-50 border border-green-200 rounded-lg p-5 sm:p-6 transition-all hover:shadow-md hover:border-green-300 group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center shrink-0">
            <MessageCircle size={24} />
          </div>
          <div>
            <h3 className="text-green-800 font-semibold text-base sm:text-lg">
              ¿Tienes preguntas? Escríbenos
            </h3>
            <p className="text-green-600 text-sm mt-0.5">
              Respondemos en menos de 1 hora - Lun-Sáb 8am-6pm
            </p>
          </div>
        </div>
        <div className="text-green-800 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0">
          <ArrowRight size={20} />
        </div>
      </div>
    </a>
  );
}
