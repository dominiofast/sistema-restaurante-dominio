/**
 * Utilitário para otimizar URLs de imagens do Supabase
 */

export const getOptimizedImageUrl = (url: string | null | undefined, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
}): string => {
  if (!url) return '/placeholder.svg';
  
  // Se for uma URL do Supabase, adicionar parâmetros de transformação
  if (url.includes('/* supabase REMOVIDO */ null; //co')) {
    const urlObj = new URL(url);
    
    // Adicionar transformações de imagem do Supabase
    if (options?.width) {
      urlObj.searchParams.set('width', options.width.toString());
    }
    if (options?.height) {
      urlObj.searchParams.set('height', options.height.toString());
    }
    if (options?.quality) {
      urlObj.searchParams.set('quality', options.quality.toString());
    }
    
    return urlObj.toString();
  }
  
  return url;
};

/**
 * Lazy load de imagens com placeholder
 */
export const lazyLoadImage = (imgElement: HTMLImageElement) => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });
    
    imageObserver.observe(imgElement);
  }
};

/**
 * Preload de imagens críticas
 */
export const preloadCriticalImages = (urls: string[]) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};
