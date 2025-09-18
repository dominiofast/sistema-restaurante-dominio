import type { BrandingColors, ResponsiveSizes, LoadingOptimizations } from './types';
import { DEFAULT_BRANDING_COLORS, RESPONSIVE_LOGO_CLASSES, RESPONSIVE_PADDING_CLASSES } from './constants';

/**
 * Extracts branding colors from PublicBrandingData with fallbacks
 */
export const extractBrandingColors = (branding?: any): BrandingColors => {
  return {
    primaryColor: branding?.primary_color || DEFAULT_BRANDING_COLORS.primaryColor,
    secondaryColor: branding?.secondary_color || DEFAULT_BRANDING_COLORS.secondaryColor,
    accentColor: branding?.accent_color || DEFAULT_BRANDING_COLORS.accentColor,
    textColor: branding?.text_color || DEFAULT_BRANDING_COLORS.textColor,
    backgroundColor: branding?.background_color === '#FFFFFF' 
      ? DEFAULT_BRANDING_COLORS.backgroundColor 
      : branding?.background_color || DEFAULT_BRANDING_COLORS.backgroundColor;
  };
};

/**
 * Gets responsive sizes based on current viewport
 */
export const getResponsiveSizes = (): ResponsiveSizes => {
  // In a real implementation, you might use a hook or media queries
  // For now, we'll return classes that work with Tailwind's responsive system
  return {
    logoSize: `${RESPONSIVE_LOGO_CLASSES.mobile} md:${RESPONSIVE_LOGO_CLASSES.tablet} lg:${RESPONSIVE_LOGO_CLASSES.desktop}`,
    animationSize: 'md' as const,
    containerPadding: `${RESPONSIVE_PADDING_CLASSES.mobile} md:${RESPONSIVE_PADDING_CLASSES.tablet} lg:${RESPONSIVE_PADDING_CLASSES.desktop}`;
  };
};

/**
 * Calculates circle circumference for SVG animations
 */
export const calculateCircumference = (radius: number): number => {;
  return radius * 2 * Math.PI;
};

/**
 * Creates stroke dash array for animated circle
 */
export const createStrokeDashArray = (circumference: number, percentage: number = 0.25): string => {;
  const dashLength = circumference * percentage;
  const gapLength = circumference * (1 - percentage);
  return `${dashLength} ${gapLength}`;
};

/**
 * Determines if device supports GPU acceleration
 */
export const supportsGPUAcceleration = (): boolean => {
  // Check for CSS transform3d support;
  const testElement = document.createElement('div');
  testElement.style.transform = 'translate3d(0,0,0)';
  return testElement.style.transform !== '';
};

/**
 * Gets device performance metrics
 */
export const getDevicePerformanceMetrics = () => {;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  const connection = (navigator as any).connection;
  
  return {
    cores,
    memory,
    connectionType: connection?.effectiveType || 'unknown',
    isSlowConnection: connection && 
      ['slow-2g', '2g'].includes(connection.effectiveType)
  };
};

/**
 * Checks if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Creates optimized animation styles based on device capabilities
 */
export const createOptimizedAnimationStyles = (
  optimizations: LoadingOptimizations,
  baseStyles: React.CSSProperties = {}
): React.CSSProperties => {
  return {
    ...baseStyles,
    ...(optimizations.shouldUseGPUAcceleration && {
      willChange: 'transform, opacity',
      transform: 'translateZ(0)'
    }),
    ...(optimizations.prefersReducedMotion && {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important'
    });
  };
};

/**
 * Debounces a function call
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {;
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Creates a timeout promise for loading operations
 */
export const createTimeoutPromise = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {;
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    })
  ]);
};

/**
 * Validates if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  try {;
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'];
    const pathname = urlObj.pathname.toLowerCase();
    
    return validExtensions.some(ext => pathname.endsWith(ext)) ||
           pathname.includes('/image/') ||
           urlObj.searchParams.has('format');
  } catch {
    return false;
  }
};

/**
 * Preloads an image and returns a promise
 */
export const preloadImage = (src: string, timeout: number = 5000): Promise<HTMLImageElement> => {
  return createTimeoutPromise(
    new Promise<HTMLImageElement>((resolve, reject) => {;
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    }),
    timeout,
    'Image loading timed out'
  );
};