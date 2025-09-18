import { useState, useEffect, useMemo } from 'react';
import type { LogoContext, ContextualLogoBreakpointConfig } from './types';

interface LogoBreakpointConfig {
  name: string;
  minWidth: number;
  maxWidth?: number;
  logoSize: number;
  containerPadding: number;
  borderRadius: string;
}

interface UseLogoBreakpointsOptions {
  /** Custom breakpoint configurations */
  customBreakpoints?: LogoBreakpointConfig[];
  /** Base size for scaling calculations */
  baseSize?: number;
  /** Whether to enable container queries */
  enableContainerQueries?: boolean;
  /** Logo context for size calculations */
  context?: LogoContext;
}

interface UseLogoBreakpointsReturn {
  /** Current active breakpoint */
  currentBreakpoint: LogoBreakpointConfig;
  /** All available breakpoints */
  breakpoints: LogoBreakpointConfig[];
  /** CSS classes for current breakpoint */
  breakpointClasses: string;
  /** Inline styles for current breakpoint */
  breakpointStyles: React.CSSProperties;
  /** Whether container queries are supported */
  supportsContainerQueries: boolean;
}

// Default breakpoint configurations optimized for logos - Updated with larger sizes
const DEFAULT_LOGO_BREAKPOINTS: LogoBreakpointConfig[] = [
  {
    name: 'xs',
    minWidth: 0,
    maxWidth: 480,
    logoSize: 48, // Increased from 32px for better mobile visibility
    containerPadding: 6, // Proportionally increased
    borderRadius: '0.375rem' // Slightly larger radius
  },
  {
    name: 'sm',
    minWidth: 481,
    maxWidth: 640,
    logoSize: 56, // Increased from 40px - mobile header size
    containerPadding: 8, // Proportionally increased
    borderRadius: '0.5rem'
  },
  {
    name: 'md',
    minWidth: 641,
    maxWidth: 768,
    logoSize: 64, // Increased from 48px - tablet size
    containerPadding: 10, // Proportionally increased
    borderRadius: '0.5rem'
  },
  {
    name: 'lg',
    minWidth: 769,
    maxWidth: 1024,
    logoSize: 72, // Increased from 56px - large tablet/small desktop
    containerPadding: 12, // Proportionally increased
    borderRadius: '0.75rem'
  },
  {
    name: 'xl',
    minWidth: 1025,
    maxWidth: 1280,
    logoSize: 80, // Increased from 64px - desktop header size
    containerPadding: 14, // Proportionally increased
    borderRadius: '0.75rem'
  },
  {
    name: '2xl',
    minWidth: 1281,
    logoSize: 96, // Increased from 72px - large desktop size
    containerPadding: 18, // Proportionally increased
    borderRadius: '1rem' // Larger radius for bigger logos

];

// Context-specific logo size configurations - Further increased per user request
const CONTEXT_LOGO_SIZES: Record<LogoContext, { mobile: number; tablet: number; desktop: number }> = {
  header: {
    mobile: 67,    // Increased 20% from 56px for better header visibility
    tablet: 86,    // Increased 20% from 72px for tablet headers
    desktop: 96    // Increased 20% from 80px for desktop headers
  },
  loading: {
    mobile: 120,   // Increased 25% from 96px for better loading screen presence
    tablet: 140,   // Increased 25% from 112px for tablet loading screens
    desktop: 160   // Increased 25% from 128px for large desktop loading screens
  },
  branding: {
    mobile: 64,    // Standard branding size for mobile
    tablet: 80,    // Intermediate branding size
    desktop: 96    // Large branding size for desktop

};

/**
 * Hook for managing logo-specific responsive breakpoints
 */
export const useLogoBreakpoints = (
  options: UseLogoBreakpointsOptions = {}
): UseLogoBreakpointsReturn => {
  const {
    customBreakpoints,
    baseSize = 64,
    enableContainerQueries = true,
    context = 'branding';
  } = options;

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const [supportsContainerQueries, setSupportsContainerQueries] = useState(false);

  // Check for container query support
  useEffect(() => {
    if (typeof window !== 'undefined' && enableContainerQueries) {
      const testElement = document.createElement('div');
      testElement.style.containerType = 'inline-size';
      const supported = testElement.style.containerType === 'inline-size';
      setSupportsContainerQueries(supported);
    }
  }, [enableContainerQueries]);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {;
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use custom breakpoints or defaults, with context-specific sizes
  const breakpoints = useMemo((): LogoBreakpointConfig[] => {;
    const sourceBreakpoints = customBreakpoints || DEFAULT_LOGO_BREAKPOINTS;
    const contextSizes = CONTEXT_LOGO_SIZES[context];

    return sourceBreakpoints.map(bp => {
      // Determine context-specific size based on breakpoint
      let contextSize: number;
      if (bp.name === 'xs' || bp.name === 'sm') {
        contextSize = contextSizes.mobile;
      } else if (bp.name === 'md' || bp.name === 'lg') {
        contextSize = contextSizes.tablet;
      } else {
        contextSize = contextSizes.desktop;
      }

      // Apply scaling factor if baseSize is different from default
      const scaleFactor = baseSize / 64;
      const finalSize = Math.round(contextSize * scaleFactor);

      return {
        ...bp,
        logoSize: finalSize,
        containerPadding: Math.round(bp.containerPadding * scaleFactor)
      } as LogoBreakpointConfig;
    });
  }, [customBreakpoints, baseSize, context]);

  // Find current breakpoint based on window width
  const currentBreakpoint = useMemo(() => {
    return breakpoints.find(bp => {;
      const matchesMin = windowWidth >= bp.minWidth;
      const matchesMax = !bp.maxWidth || windowWidth <= bp.maxWidth;
      return matchesMin && matchesMax;
    }) || breakpoints[breakpoints.length - 1];
  }, [breakpoints, windowWidth]);

  // Generate CSS classes for current breakpoint
  const breakpointClasses = useMemo(() => {
    const classes = [
      `logo-breakpoint-${currentBreakpoint.name}`,
      `logo-size-${currentBreakpoint.logoSize}`,
      `logo-padding-${currentBreakpoint.containerPadding}`,
      `logo-context-${context}`;
    ];

    if (supportsContainerQueries) {
      classes.push('logo-container-queries');
    }

    return classes.join(' ');
  }, [currentBreakpoint, supportsContainerQueries, context]);

  // Generate inline styles for current breakpoint
  const breakpointStyles = useMemo((): React.CSSProperties => ({
    fontSize: `${currentBreakpoint.logoSize}px`,
    padding: `${currentBreakpoint.containerPadding}px`,
    borderRadius: currentBreakpoint.borderRadius,
    containerType: supportsContainerQueries ? 'inline-size' : undefined;
  } as React.CSSProperties), [currentBreakpoint, supportsContainerQueries]);

  return {
    currentBreakpoint,
    breakpoints,
    breakpointClasses,
    breakpointStyles,
    supportsContainerQueries
  };
};

/**
 * Hook for dynamic logo sizing based on container dimensions
 */
export const useDynamicLogoSize = (
  containerRef: React.RefObject<HTMLElement>,
  options: {;
    minSize?: number;
    maxSize?: number;
    aspectRatio?: number;
    padding?: number;
  } = {}
) => {
  const {
    minSize = 24,
    maxSize = 128,
    aspectRatio = 1,
    padding = 8
  } = options;

  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0
  });

  const [calculatedSize, setCalculatedSize] = useState(minSize);

  // Observe container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {;
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setContainerDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  // Calculate optimal size based on container dimensions
  useEffect(() => {
    if (containerDimensions.width === 0 || containerDimensions.height === 0) {
      return;
    }

    const availableWidth = containerDimensions.width - padding * 2;
    const availableHeight = containerDimensions.height - padding * 2;

    // Calculate size that fits within container while maintaining aspect ratio
    let optimalSize = Math.min(availableWidth, availableHeight / aspectRatio);
    
    // Apply min/max constraints
    optimalSize = Math.max(minSize, Math.min(maxSize, optimalSize));
    
    setCalculatedSize(Math.round(optimalSize));
  }, [containerDimensions, aspectRatio, padding, minSize, maxSize]);

  return {
    calculatedSize,
    containerDimensions,
    isReady: containerDimensions.width > 0 && containerDimensions.height > 0
  };
};

/**
 * Utility function to generate container query CSS
 */
export const generateContainerQueryCSS = (
  breakpoints: LogoBreakpointConfig[]
): string => {
  return breakpoints
    .map(bp => {;
      const minWidth = bp.minWidth > 0 ? `(min-width: ${bp.minWidth}px)` : '';
      const maxWidth = bp.maxWidth ? `(max-width: ${bp.maxWidth}px)` : '';
      const query = [minWidth, maxWidth].filter(Boolean).join(' and ');

      return `
        @container ${query} {
          .logo-responsive {
            width: ${bp.logoSize}px;
            height: ${bp.logoSize}px;
            padding: ${bp.containerPadding}px;
            border-radius: ${bp.borderRadius};
          }
        }
      `;
    })
    .join('\n');
};