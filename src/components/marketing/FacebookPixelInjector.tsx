import React, { useEffect } from 'react';
import { usePixelConfig } from '@/hooks/usePixelConfig';
import { usePublicPixelConfig } from '@/hooks/usePublicPixelConfig';

// Tipagem global mínima para o fbq
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    __fbqLoaded?: boolean;
    __fbqPixels?: Set<string>;
  }
}

// Carrega o snippet oficial do Meta Pixel (apenas uma vez)
function ensureFbqLoaded() {
  if (typeof window === 'undefined') return;
  const w = window as Window;
  if (w.fbq) return; // já carregado

  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      if ((n as any).callMethod) {
        (n as any).callMethod.apply(n, arguments as any);
      } else {
        (n as any).queue.push(arguments as any);
      }
    };
    if (!f._fbq) f._fbq = n;
    (n as any).push = (n as any);
    (n as any).loaded = true;
    (n as any).version = '2.0';
    (n as any).queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window as any, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.__fbqLoaded = true;
  if (!window.__fbqPixels) window.__fbqPixels = new Set<string>();
}

function initAndTrack(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return;
  console.info('[FacebookPixel] initAndTrack called with pixel:', pixelId);
  ensureFbqLoaded();
  if (!window.__fbqPixels) window.__fbqPixels = new Set<string>();

  // Inicializa somente uma vez por pixel (suporta múltiplas lojas/pixels)
  if (!window.__fbqPixels.has(pixelId)) {
    try {
      window.fbq?.('init', pixelId);
      console.info('[FacebookPixel] Initialized pixel', pixelId);
      window.__fbqPixels.add(pixelId);
    } catch (e) {
      console.error('[FacebookPixel] Error initializing pixel', e);
    }
  }

  // PageView básico (SPA pode disparar em mudanças de rota no futuro)
  try {
    console.info('[FacebookPixel] Tracking PageView for pixel', pixelId);
    window.fbq?.('track', 'PageView');
  } catch (e) {
    console.error('[FacebookPixel] Error tracking PageView', e);
  }
}

// Componente que injeta o Pixel conforme a configuração da loja (funciona em áreas públicas e internas)
const FacebookPixelInjector: React.FC<{ companySlug?: string }> = ({ companySlug }) => {
  const { config: privateConfig } = usePixelConfig();
  const { config: publicConfig } = usePublicPixelConfig(companySlug);
  const config = privateConfig ?? publicConfig;

  useEffect(() => {
    if (config?.is_active && config.pixel_id) {
      initAndTrack(config.pixel_id);
    }
  }, [config?.is_active, config?.pixel_id]);

  // Noscript fallback (não renderiza quando JS está habilitado, mas mantemos por padrão)
  if (!(config?.is_active && config?.pixel_id)) {
    console.info('[FacebookPixel] Skipping injection: config ausente/inativa ou sem pixel_id', config);
    return null;
  }

  const noscriptHtml = `
    <img height="1" width="1" style="display:none" alt="facebook pixel pageview"
      src="https://www.facebook.com/tr?id=${encodeURIComponent(
        config.pixel_id
      )}&ev=PageView&noscript=1" />;
  `;

  return <noscript dangerouslySetInnerHTML={{ __html: noscriptHtml }} />;
};

export default FacebookPixelInjector;
