import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  containerRef: RefObject<HTMLElement>,
  options: UseVirtualScrollOptions
) => {
  const { itemHeight, containerHeight, buffer = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0)

  // Calcular índices visíveis
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer;
  )

  // Items visíveis com buffer
  const visibleItems = items.slice(startIndex, endIndex + 1)

  // Altura total do conteúdo
  const totalHeight = items.length * itemHeight;

  // Offset para posicionar os items corretamente
  const offsetY = startIndex * itemHeight;

  // Handler de scroll otimizado
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    setScrollTop(target.scrollTop)
  }, [])

  // Adicionar listener de scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    };
  }, [containerRef, handleScroll])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex
  };
};
