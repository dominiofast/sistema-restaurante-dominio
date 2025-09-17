import { useState, useEffect, useCallback } from 'react';
import type { LogoLoadingState, LoadingError } from './types';

interface UseLogoLoaderOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Timeout in milliseconds for each load attempt */
  loadTimeout?: number;
  /** Whether to enable retry with exponential backoff */
  enableRetry?: boolean;
}

interface UseLogoLoaderReturn extends LogoLoadingState {
  /** Function to manually retry loading */
  retry: () => void;
  /** Function to reset the loading state */
  reset: () => void;
}

/**
 * Custom hook for robust logo loading with retry logic and error handling
 */
export const useLogoLoader = (
  logoUrl?: string,
  options: UseLogoLoaderOptions = {}
): UseLogoLoaderReturn => {
  const {
    maxRetries = 2,
    loadTimeout = 10000,
    enableRetry = true
  } = options;

  const [state, setState] = useState<LogoLoadingState>({
    isLoading: false,
    hasError: false,
    isLoaded: false,
    retryCount: 0
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      hasError: false,
      isLoaded: false,
      retryCount: 0,
      error: undefined
    });
  }, []);

  const loadImage = useCallback((url: string, attempt: number = 0): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error('Timeout loading image'));
      }, loadTimeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load image'));
      };

      // Add cache busting for retries
      const cacheBustUrl = attempt > 0 
        ? `${url}${url.includes('?') ? '&' : '?'}retry=${attempt}&t=${Date.now()}`
        : url;
      
      img.src = cacheBustUrl;
    });
  }, [loadTimeout]);

  const attemptLoad = useCallback(async (url: string, attempt: number = 0) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      retryCount: attempt
    }));

    try {
      await loadImage(url, attempt);
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: false,
        isLoaded: true,
        error: undefined
      }));
    } catch (error) {
      const loadingError: LoadingError = {
        type: error instanceof Error && error.message.includes('Timeout') ? 'timeout' : 'network',
        message: error instanceof Error ? error.message : 'Unknown error',
        recoverable: attempt < maxRetries,
        retryCount: attempt
      };

      if (enableRetry && attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          attemptLoad(url, attempt + 1);
        }, delay);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          isLoaded: false,
          error: loadingError
        }));
      }
    }
  }, [loadImage, maxRetries, enableRetry]);

  const retry = useCallback(() => {
    if (logoUrl && state.hasError) {
      attemptLoad(logoUrl, 0);
    }
  }, [logoUrl, state.hasError, attemptLoad]);

  // Start loading when logoUrl changes
  useEffect(() => {
    if (logoUrl) {
      reset();
      attemptLoad(logoUrl, 0);
    } else {
      reset();
    }
  }, [logoUrl, attemptLoad, reset]);

  return {
    ...state,
    retry,
    reset
  };
};

/**
 * Utility function to preload logos for better performance
 */
export const preloadLogo = (logoUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to preload logo'));
    img.src = logoUrl;
  });
};

/**
 * Utility function to check if an image URL is valid
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:', 'data:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Utility function to get optimized image URL with format and size parameters
 */
export const getOptimizedImageUrl = (
  url: string, 
  size: number, 
  format: 'webp' | 'avif' | 'auto' = 'auto'
): string => {
  if (!url || !isValidImageUrl(url)) return url;
  
  try {
    const parsedUrl = new URL(url);
    
    // Add size parameters for common CDN services
    if (parsedUrl.hostname.includes('cloudinary.com')) {
      parsedUrl.searchParams.set('w', size.toString());
      parsedUrl.searchParams.set('h', size.toString());
      parsedUrl.searchParams.set('c', 'fit');
      if (format !== 'auto') {
        parsedUrl.searchParams.set('f', format);
      }
    } else if (parsedUrl.hostname.includes('imagekit.io')) {
      parsedUrl.searchParams.set('tr', `w-${size},h-${size},c-maintain_ratio`);
    }
    
    return parsedUrl.toString();
  } catch {
    return url;
  }
};