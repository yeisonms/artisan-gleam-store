import { Link2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductShare() {
  // Obtenemos la URL actual de forma dinámica
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);

  // Funciones de compartir
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedUrl}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Enlace copiado al portapapeles");
    }).catch(() => {
      toast.error("No se pudo copiar el enlace");
    });
  };

  return (
    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border/50">
      <span className="text-sm font-medium text-muted-foreground">Compartir:</span>
      
      <div className="flex items-center gap-3">
        {/* Facebook */}
        <a 
          href={shareLinks.facebook} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-charcoal transition-colors cursor-pointer"
          aria-label="Compartir en Facebook"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        </a>

        {/* X (Twitter) */}
        <a 
          href={shareLinks.x} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-charcoal transition-colors cursor-pointer"
          aria-label="Compartir en X"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
          </svg>
        </a>

        {/* Pinterest */}
        <a 
          href={shareLinks.pinterest} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-charcoal transition-colors cursor-pointer"
          aria-label="Compartir en Pinterest"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.105 0 7.301 2.924 7.301 6.818 0 4.08-2.571 7.367-6.144 7.367-1.198 0-2.325-.623-2.71-1.359l-.738 2.817c-.267 1.018-.992 2.29-1.478 3.067 1.157.348 2.378.537 3.639.537 6.621 0 11.988-5.367 11.988-11.987C24.004 5.367 18.638 0 12.017 0z" />
          </svg>
        </a>

        {/* Telegram */}
        <a 
          href={shareLinks.telegram} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-charcoal transition-colors cursor-pointer"
          aria-label="Compartir en Telegram"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </a>

        {/* WhatsApp */}
        <a 
          href={shareLinks.whatsapp} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-charcoal transition-colors cursor-pointer"
          aria-label="Compartir en WhatsApp"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>

        <div className="w-px h-4 bg-border mx-1"></div>

        {/* Copiar Enlace */}
        <button 
          onClick={copyToClipboard}
          className="text-muted-foreground hover:text-charcoal transition-colors cursor-pointer flex items-center"
          aria-label="Copiar enlace"
          title="Copiar enlace"
        >
          <Link2 size={20} />
        </button>
      </div>
    </div>
  );
}
