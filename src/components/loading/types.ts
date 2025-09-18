import { ReactNode } from 'react';

// Import LogoBreakpointConfig from useLogoBreakpoints
interface LogoBreakpointConfig {
  name: string;
  minWidth: number;
  maxWidth?: number;
  logoSize: number;
  containerPadding: number;
  borderRadius: string;
}

// Loading Animation Component Props
export interface LoadingAnimationProps {
  /** Size of the loading animation */
  size?: 'sm' | 'md' | 'lg';
  /** Primary color for the animation */
  color?: string;
  /** Stroke width of the circle */
  strokeWidth?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

// Company Logo Component Props
export interface CompanyLogoProps {
  /** URL of the company logo */
  logoUrl?: string;
  /** Name of the company for alt text */
  companyName?: string;
  /** Size of the logo in pixels */
  size?: number;
  /** Custom fallback icon when logo fails to load */
  fallbackIcon?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Maximum number of retry attempts for failed logo loads */
  maxRetries?: number;
  /** Timeout in milliseconds for logo loading */
  loadTimeout?: number;
  /** Whether to preserve aspect ratio */
  preserveAspectRatio?: boolean;
  /** Object fit strategy for the logo image */
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down';
}

// Main Branded Loading Screen Props
export interface BrandedLoadingScreenProps {
  /** Company identifier (slug, domain, or ID) */
  companyIdentifier?: string;
  /** Whether the loading screen is visible */
  isVisible: boolean;
  /** Callback when loading completes */
  onLoadingComplete?: () => void;
  /** Custom loading message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

// Loading State Management
export interface LoadingState {
  /** Whether the loading screen is visible */
  isVisible: boolean;
  /** Whether animations are currently running */
  isAnimating: boolean;
  /** Whether there was an error loading resources */
  hasError: boolean;
  /** Optional progress percentage (0-100) */
  progress?: number;
}

// Performance and Accessibility Optimizations
export interface LoadingOptimizations {
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Whether to use GPU acceleration */
  shouldUseGPUAcceleration: boolean;
  /** Whether device is high performance */
  isHighPerformanceDevice: boolean;
}

// Responsive Size Configuration
export interface ResponsiveSizes {
  /** Logo size classes for responsive design */
  logoSize: string;
  /** Animation size variant */
  animationSize: 'sm' | 'md' | 'lg';
  /** Container padding classes */
  containerPadding: string;
}

// Branding Colors (extends existing PublicBrandingData)
export interface BrandingColors {
  /** Primary brand color */
  primaryColor: string;
  /** Secondary brand color */
  secondaryColor?: string;
  /** Accent color for highlights */
  accentColor?: string;
  /** Text color */
  textColor: string;
  /** Background color */
  backgroundColor: string;
}

// Animation Configuration
export interface AnimationConfig {
  /** Duration of the main animation */
  duration: number;
  /** Easing function for animations */
  easing: string;
  /** Whether animations should be enabled */
  enabled: boolean;
  /** Delay between animation elements */
  staggerDelay: number;
}

// Loading Screen Variants
export type LoadingVariant = 'default' | 'minimal' | 'branded' | 'compact';

// Loading Screen Sizes
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

// Error Types for Loading
export interface LoadingError {
  /** Error type */
  type: 'network' | 'image' | 'branding' | 'timeout';
  /** Error message */
  message: string;
  /** Whether error is recoverable */
  recoverable: boolean;
  /** Retry count */
  retryCount?: number;
}

// Logo Display Configuration
export interface LogoDisplayConfig {
  /** Whether to preserve aspect ratio */
  preserveAspectRatio: boolean;
  /** Maximum width constraint */
  maxWidth: string;
  /** Maximum height constraint */
  maxHeight: string;
  /** Object fit strategy */
  objectFit: 'contain' | 'cover' | 'fill' | 'scale-down';
  /** Container aspect ratio */
  containerAspectRatio?: string;
  /** Border radius for the logo container */
  borderRadius?: string;
}

// Responsive Logo Sizes Configuration
export interface ResponsiveLogoSizes {
  /** Mobile breakpoint configuration */
  mobile: {
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
  };
  /** Tablet breakpoint configuration */
  tablet: {
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
  };
  /** Desktop breakpoint configuration */
  desktop: {
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
  };
}

// Logo Loading State
export interface LogoLoadingState {
  /** Whether the logo is currently loading */
  isLoading: boolean;
  /** Whether there was an error loading the logo */
  hasError: boolean;
  /** Whether the logo loaded successfully */
  isLoaded: boolean;
  /** Current retry attempt number */
  retryCount: number;
  /** Error details if loading failed */
  error?: LoadingError;
}

// Logo Context Types
export type LogoContext = 'header' | 'loading' | 'branding';

// Logo Size Configuration by Context and Breakpoint
export interface LogoSizeConfig {
  /** Context where the logo is used */
  context: LogoContext;
  /** Mobile configuration */
  mobile: {
    size: number;
    container: { width: number; height: number };
    padding: number;
  };
  /** Tablet configuration */
  tablet: {
    size: number;
    container: { width: number; height: number };
    padding: number;
  };
  /** Desktop configuration */
  desktop: {
    size: number;
    container: { width: number; height: number };
    padding: number;
  };
}

// Context-specific Logo Breakpoint Configuration
export interface ContextualLogoBreakpointConfig {
  name: 'mobile' | 'tablet' | 'desktop';
  minWidth: number;
  maxWidth?: number;
  logoSizes: {
    header: number;
    loading: number;
    branding: number;
  };
  containerPadding: number;
  borderRadius: string;
}

// Enhanced Company Logo Props with Context Support
export interface EnhancedCompanyLogoProps extends Omit<CompanyLogoProps, 'size'> {
  /** Context where the logo is being used */
  context?: LogoContext;
  /** Manual size override (optional) */
  size?: number;
  /** Whether to enable responsive sizing */
  enableResponsive?: boolean;
  /** Custom breakpoint configurations */
  customBreakpoints?: LogoBreakpointConfig[];
}
