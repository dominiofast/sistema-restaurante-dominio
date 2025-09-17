import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: React.ReactNode;
  aspectRatio?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallback,
  aspectRatio,
  className,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Implementar Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Começar a carregar 50px antes de entrar na viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Otimizar URL da imagem para diferentes CDNs
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!originalSrc) return originalSrc;
    
    try {
      const url = new URL(originalSrc);
      
      // Cloudinary optimizations
      if (url.hostname.includes('cloudinary.com')) {
        // Adicionar transformações automáticas
        const pathParts = url.pathname.split('/');
        const uploadIndex = pathParts.indexOf('upload');
        if (uploadIndex !== -1) {
          // Adicionar parâmetros de otimização após 'upload'
          const optimizations = 'f_auto,q_auto:good';
          if (width) {
            const widthParam = `w_${width}`;
            pathParts.splice(uploadIndex + 1, 0, `${optimizations},${widthParam}`);
          } else {
            pathParts.splice(uploadIndex + 1, 0, optimizations);
          }
          url.pathname = pathParts.join('/');
        }
      }
      
      return url.toString();
    } catch {
      return originalSrc;
    }
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  const optimizedSrc = getOptimizedSrc(src);
  const shouldShowPlaceholder = placeholder === 'blur' && blurDataURL && isLoading;

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        ...style,
        aspectRatio: aspectRatio,
        width: width || 'auto',
        height: height || 'auto',
      }}
    >
      {/* Placeholder blur */}
      {shouldShowPlaceholder && (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110"
          style={{ opacity: isLoading ? 1 : 0, transition: 'opacity 0.3s' }}
        />
      )}

      {/* Imagem principal */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100 transition-opacity duration-300',
          className
        )}
        style={{
          ...style,
        }}
        {...props}
      />

      {/* Loading skeleton */}
      {isLoading && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

// Hook para preload de imagens críticas
export const useImagePreload = (urls: string[]) => {
  useEffect(() => {
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [urls]);
};

// Componente para Picture com múltiplas fontes (WebP, AVIF)
export const OptimizedPicture: React.FC<{
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
}> = ({ src, alt, width, height, className, priority = false }) => {
  const getImageFormat = (originalSrc: string, format: string): string => {
    try {
      const url = new URL(originalSrc);
      
      if (url.hostname.includes('cloudinary.com')) {
        const pathParts = url.pathname.split('.');
        if (pathParts.length > 1) {
          pathParts[pathParts.length - 1] = format;
          url.pathname = pathParts.join('.');
        }
      }
      
      return url.toString();
    } catch {
      return originalSrc;
    }
  };

  return (
    <picture>
      {/* AVIF - melhor compressão, mas nem todos os browsers suportam */}
      <source
        type="image/avif"
        srcSet={getImageFormat(src, 'avif')}
      />
      
      {/* WebP - boa compressão e suporte amplo */}
      <source
        type="image/webp"
        srcSet={getImageFormat(src, 'webp')}
      />
      
      {/* Fallback para JPEG/PNG */}
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    </picture>
  );
};

export default OptimizedImage;
