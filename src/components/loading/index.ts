// Components
export { LoadingAnimation } from './LoadingAnimation';
export { CompanyLogo } from './CompanyLogo';
export { BrandedLoadingScreen } from './BrandedLoadingScreen';

// Hooks
export { useLoadingOptimizations } from './useLoadingOptimizations';

// Types
export type { 
  LoadingAnimationProps, 
  CompanyLogoProps, 
  BrandedLoadingScreenProps, 
  LoadingState,
  LoadingOptimizations,
  ResponsiveSizes,
  BrandingColors,
  AnimationConfig,
  LoadingError,
  LoadingVariant,
  LoadingSize
} from './types';

// Constants
export {
  DEFAULT_ANIMATION_CONFIG,
  DEFAULT_BRANDING_COLORS,
  SIZE_MAP,
  STROKE_WIDTH_MAP,
  RESPONSIVE_BREAKPOINTS,
  ANIMATION_DURATIONS,
  ACCESSIBILITY_LABELS
} from './constants';

// Utils
export {
  extractBrandingColors,
  getResponsiveSizes,
  calculateCircumference,
  createStrokeDashArray,
  supportsGPUAcceleration,
  getDevicePerformanceMetrics,
  prefersReducedMotion,
  createOptimizedAnimationStyles,
  preloadImage,
  isValidImageUrl
} from './utils';
