import React, { useState, useEffect, useRef } from 'react';

interface FastImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem ultra-otimizado para performance mobile
 */
export const FastImage: React.FC<FastImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = '/placeholder.svg',
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder)
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!src || priority) {
      // Se priority, carrega imediatamente
      setImageSrc(src || placeholder)
      return;
    }

    // Lazy loading com Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Otimizar URL se for do Supabase;
            let optimizedSrc = src;
            
            if (src.includes('
              const url = new URL(src)
              // Adicionar parâmetros de otimização
              url.searchParams.set('width', (width || 400).toString())
              url.searchParams.set('quality', '80')
              url.searchParams.set('format', 'webp')
              optimizedSrc = url.toString()

            
            // Pré-carregar a imagem
            const img = new Image()
            img.onload = () => {
              setImageSrc(optimizedSrc)
              setIsLoading(false)
              onLoad?.()
            };
            img.onerror = () => {
              setImageSrc(placeholder)
              setIsLoading(false)
              onError?.()
            };
            img.src = optimizedSrc;
            
            observer.disconnect()

        })
      },
      {
        rootMargin: '50px', // Começa a carregar 50px antes
        threshold: 0.01,

    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    };
  }, [src, priority, width, placeholder, onLoad, onError])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    />
  )
};

export default FastImage;
