import { useState, useRef, MouseEvent } from 'react';
import { motion } from 'framer-motion';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
  const [isHovering, setIsHovering] = useState(false);
  const figureRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!figureRef.current) return;
    const { left, top, width, height } = figureRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const currentImg = images[selectedImage]?.url || "";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col-reverse md:flex-row gap-4 h-full">
      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(i)}
              className={`w-16 h-20 md:w-20 md:h-24 flex-shrink-0 overflow-hidden border transition-all duration-300 ${
                i === selectedImage ? "border-gold opacity-100" : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <img src={img.url} alt={img.alt || productName} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Imagen Principal con Zoom */}
      <div 
        className="flex-1 aspect-[4/5] md:aspect-auto md:h-full min-h-[500px] bg-[#F5F5F5] overflow-hidden relative group cursor-crosshair"
        ref={figureRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {images.length > 0 ? (
          <>
            <img 
              src={currentImg} 
              alt={productName} 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`} 
            />
            {/* Capa del Zoom */}
            <div 
              className={`absolute inset-0 transition-opacity duration-300 bg-white ${isHovering ? 'opacity-100' : 'opacity-0'}`}
              style={{
                backgroundImage: `url(${currentImg})`,
                backgroundPosition: backgroundPosition,
                backgroundSize: '250%', // Escala alta para el zoom detallado
                backgroundRepeat: 'no-repeat'
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-2xl tracking-widest">
            MEMORIES
          </div>
        )}
      </div>
    </motion.div>
  );
}
