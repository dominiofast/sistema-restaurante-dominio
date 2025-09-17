import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para throttle de funções
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeout = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Hook para detectar idle time e pausar operações pesadas
 */
export function useIdleDetection(
  onIdle: () => void,
  onActive: () => void,
  timeout: number = 5000
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    onActive();
    
    timeoutRef.current = setTimeout(() => {
      onIdle();
    }, timeout);
  }, [onIdle, onActive, timeout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);
}

/**
 * Hook para executar tarefas pesadas sem bloquear o main thread
 */
export function useRequestIdleCallback<T extends (...args: any[]) => any>(
  callback: T,
  options?: IdleRequestOptions
): (...args: Parameters<T>) => void {
  const handle = useRef<number>();

  const wrappedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (handle.current) {
        cancelIdleCallback(handle.current);
      }

      if ('requestIdleCallback' in window) {
        handle.current = requestIdleCallback(
          () => callback(...args),
          options
        );
      } else {
        // Fallback para browsers que não suportam requestIdleCallback
        setTimeout(() => callback(...args), 1);
      }
    },
    [callback, options]
  );

  useEffect(() => {
    return () => {
      if (handle.current) {
        cancelIdleCallback(handle.current);
      }
    };
  }, []);

  return wrappedCallback;
}

/**
 * Hook para Virtual Scrolling em listas grandes
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useThrottle((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, 50);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  };
}

/**
 * Hook para detectar performance do dispositivo
 */
export function useDevicePerformance() {
  const [performance, setPerformance] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    const checkPerformance = () => {
      // Verificar número de cores do CPU
      const cores = navigator.hardwareConcurrency || 4;
      
      // Verificar memória disponível (se suportado)
      const memory = (navigator as any).deviceMemory || 4;
      
      // Verificar conexão
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || '4g';
      
      // Calcular score de performance
      let score = 0;
      
      if (cores >= 8) score += 3;
      else if (cores >= 4) score += 2;
      else score += 1;
      
      if (memory >= 8) score += 3;
      else if (memory >= 4) score += 2;
      else score += 1;
      
      if (effectiveType === '4g') score += 3;
      else if (effectiveType === '3g') score += 2;
      else score += 1;
      
      // Determinar nível de performance
      if (score >= 7) setPerformance('high');
      else if (score >= 4) setPerformance('medium');
      else setPerformance('low');
    };

    checkPerformance();
    
    // Re-verificar quando a conexão mudar
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', checkPerformance);
      return () => connection.removeEventListener('change', checkPerformance);
    }
  }, []);

  return performance;
}

/**
 * Hook para lazy load de componentes com Intersection Observer
 */
export function useLazyComponent(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
}

/**
 * Hook para chunking de operações pesadas
 */
export function useChunkedOperation<T, R>(
  items: T[],
  operation: (item: T) => R,
  chunkSize: number = 10,
  delay: number = 0
): {
  results: R[];
  isProcessing: boolean;
  progress: number;
  start: () => void;
  cancel: () => void;
} {
  const [results, setResults] = useState<R[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef(false);

  const start = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    cancelRef.current = false;

    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }

    const allResults: R[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (cancelRef.current) break;

      const chunkResults = chunks[i].map(operation);
      allResults.push(...chunkResults);
      
      setResults([...allResults]);
      setProgress((i + 1) / chunks.length);

      if (delay > 0 && i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIsProcessing(false);
  }, [items, operation, chunkSize, delay]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setIsProcessing(false);
  }, []);

  return { results, isProcessing, progress, start, cancel };
}

export default {
  useDebounce,
  useThrottle,
  useIdleDetection,
  useRequestIdleCallback,
  useVirtualScroll,
  useDevicePerformance,
  useLazyComponent,
  useChunkedOperation,
};
