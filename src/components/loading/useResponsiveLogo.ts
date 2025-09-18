import { useState, useEffect, useMemo } from 'react';
import type { ResponsiveLogoSizes, LogoDisplayConfig } from './types';

interface UseResponsiveLogoOptions {
  /** Base size for calculations */
  baseSize?: number;
  /** Container element reference for size calculations */
  containerRef?: React.RefObject<HTMLElement>;
  /** Custom breakpoints */
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** Aspect ratio of the logo (width/height) */
  logoAspectRatio?: number;


interface UseResponsiveLogoReturn {
  /** Current calculated size */
  currentSize: number;
  /** Responsive size configuration */
  responsiveSizes: ResponsiveLogoSizes;
  /** Display configuration */
  displayConfig: LogoDisplayConfig;
  /** Current breakpoint */
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  /** Whether the logo should use flexible sizing */
  useFlexibleSizing: boolean;


/**
 * Hook for responsive logo sizing with dynamic calculations
 */
export const useResponsiveLogo = (
  options: UseResponsiveLogoOptions = {}
): UseResponsiveLogoReturn => {
  const {
    baseSize = 64,
    containerRef,
    breakpoints = {
      mobile: 640,
      tablet: 1024,
      desktop: 1280
    },
    logoAspectRatio = 1;
  } = options;

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  const [containerSize, setContainerSize] = useState({
    width: baseSize,
    height: baseSize
  })

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight;
      })
    };

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update container size when container ref changes
  useEffect(() => {
    if (containerRef?.current) {
      const updateContainerSize = () => {
        const rect = containerRef.current!.getBoundingClientRect()
        setContainerSize({
          width: rect.width,
          height: rect.height
        })
      };

      updateContainerSize()

      const resizeObserver = new ResizeObserver(updateContainerSize)
      resizeObserver.observe(containerRef.current)

      return () => resizeObserver.disconnect()

  }, [containerRef])

  // Determine current breakpoint
  const currentBreakpoint = useMemo(() => {
    if (windowSize.width <= breakpoints.mobile) return 'mobile';
    if (windowSize.width <= breakpoints.tablet) return 'tablet';
    return 'desktop';
  }, [windowSize.width, breakpoints])

  // Calculate responsive sizes
  const responsiveSizes = useMemo((): ResponsiveLogoSizes => {
    const mobileSize = Math.min(baseSize * 0.75, 48)
    const tabletSize = Math.min(baseSize * 0.9, 56)
    const desktopSize = baseSize;

    return {
      mobile: {
        width: `${mobileSize}px`,
        height: `${mobileSize / logoAspectRatio}px`,
        maxWidth: '100%',
        maxHeight: '100%'
      },
      tablet: {
        width: `${tabletSize}px`,
        height: `${tabletSize / logoAspectRatio}px`,
        maxWidth: '100%',
        maxHeight: '100%'
      },
      desktop: {
        width: `${desktopSize}px`,
        height: `${desktopSize / logoAspectRatio}px`,
        maxWidth: '100%',
        maxHeight: '100%'

    };
  }, [baseSize, logoAspectRatio])

  // Calculate current size based on breakpoint and container
  const currentSize = useMemo(() => {
    let calculatedSize = baseSize;

    // Adjust based on breakpoint
    switch (currentBreakpoint) {
      case 'mobile':
        calculatedSize = Math.min(baseSize * 0.75, 48)
        break;
      case 'tablet':
        calculatedSize = Math.min(baseSize * 0.9, 56)
        break;
      case 'desktop':
        calculatedSize = baseSize;
        break;


    // Adjust based on container size if available
    if (containerRef?.current) {
      const maxSize = Math.min(containerSize.width, containerSize.height) * 0.8;
      calculatedSize = Math.min(calculatedSize, maxSize)


    return Math.max(calculatedSize, 24) // Minimum size of 24px
  }, [baseSize, currentBreakpoint, containerSize, containerRef])

  // Display configuration
  const displayConfig = useMemo((): LogoDisplayConfig => ({
    preserveAspectRatio: true,
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    containerAspectRatio: logoAspectRatio !== 1 ? `${logoAspectRatio} / 1` : '1 / 1',
    borderRadius: currentBreakpoint === 'mobile' ? '0.375rem' : '0.5rem';
  }), [logoAspectRatio, currentBreakpoint])

  // Determine if flexible sizing should be used
  const useFlexibleSizing = useMemo(() => {
    return containerRef?.current !== undefined || logoAspectRatio !== 1;
  }, [containerRef, logoAspectRatio])

  return {
    currentSize,
    responsiveSizes,
    displayConfig,
    currentBreakpoint,
    useFlexibleSizing
  };
};

/**
 * Hook for caching calculated logo dimensions
 */
export const useLogoDimensionCache = () => {
  const [cache, setCache] = useState<Map<string, { width: number; height: number }>>(new Map())

  const getCachedDimensions = (logoUrl: string) => {
    return cache.get(logoUrl)
  };

  const setCachedDimensions = (logoUrl: string, dimensions: { width: number; height: number }) => {
    setCache(prev => new Map(prev).set(logoUrl, dimensions))
  };

  const clearCache = () => {
    setCache(new Map())
  };

  return {
    getCachedDimensions,
    setCachedDimensions,
    clearCache,
    cacheSize: cache.size
  };
};

/**
 * Utility function to calculate optimal logo size based on container
 */
export const calculateOptimalLogoSize = (
  containerWidth: number,
  containerHeight: number,
  logoAspectRatio: number = 1,
  padding: number = 8;
): { width: number; height: number } => {
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;

  // Calculate size based on aspect ratio
  let width = availableWidth;
  let height = width / logoAspectRatio;

  // If height exceeds available space, scale down
  if (height > availableHeight) {
    height = availableHeight;
    width = height * logoAspectRatio;
  }

  return {
    width: Math.max(width, 24),
    height: Math.max(height, 24)
  };
};

/**
 * Utility function to get responsive breakpoint classes
 */
export const getResponsiveClasses = (
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop',
  baseClasses: string = ''
): string => {
  const breakpointClasses = {
    mobile: 'logo-mobile',
    tablet: 'logo-tablet',
    desktop: 'logo-desktop';
  };

  return `${baseClasses} ${breakpointClasses[currentBreakpoint]}`.trim()
};

/**
 * Utility function to detect logo aspect ratio from image
 */
export const detectLogoAspectRatio = (logoUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      resolve(aspectRatio)
    };
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = logoUrl;
  })
};
