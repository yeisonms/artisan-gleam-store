import { useState, useEffect } from 'react';

// Extender la interfaz global para incluir beforeinstallprompt
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Escuchar el evento de forma global para capturarlo antes de que React se monte por completo
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Prevenir que Chrome muestre el prompt automáticamente
  deferredPrompt = e as BeforeInstallPromptEvent;
});

export function usePwaInstall() {
  const [isInstallable, setIsInstallable] = useState(!!deferredPrompt);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    setIsInstallable(!!deferredPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) return;
    
    // Mostrar el prompt
    deferredPrompt.prompt();
    
    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      deferredPrompt = null;
      setIsInstallable(false);
    }
  };

  return { isInstallable, installPwa };
}
