import type { AnimationConfig, BrandingColors, LoadingSize } from './types';

// Default Animation Configuration
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  duration: 2,
  easing: 'ease-in-out',
  enabled: true,
  staggerDelay: 0.2
};

// Default Branding Colors
export const DEFAULT_BRANDING_COLORS: BrandingColors = {
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  accentColor: '#F59E0B',
  textColor: '#1F2937',
  backgroundColor: '#F8FAFC'
};

// Size Mappings for Components
export const SIZE_MAP: Record<LoadingSize, number> = {
  sm: 48,
  md: 64,
  lg: 80,
  xl: 96
};

export const STROKE_WIDTH_MAP: Record<LoadingSize, number> = {
  sm: 3,
  md: 4,
  lg: 5,
  xl: 6
};

// Responsive Breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)';
} as const;

// CSS Classes for Responsive Sizes
export const RESPONSIVE_LOGO_CLASSES = {
  mobile: 'w-16 h-16',
  tablet: 'w-20 h-20',
  desktop: 'w-24 h-24';
} as const;

export const RESPONSIVE_PADDING_CLASSES = {
  mobile: 'p-4',
  tablet: 'p-6',
  desktop: 'p-8';
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  fadeIn: 300,
  fadeOut: 300,
  logoLoad: 150,
  stagger: 200;
} as const;

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  minCores: 4,
  minMemory: 4, // GB
  slowConnectionTypes: ['slow-2g', '2g'] as const;
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  logoLoadFailed: 'Falha ao carregar logo da empresa',
  brandingLoadFailed: 'Falha ao carregar configurações da marca',
  networkError: 'Erro de conexão',
  timeout: 'Tempo limite excedido';
} as const;

// Accessibility Labels
export const ACCESSIBILITY_LABELS = {
  loading: 'Carregando',
  companyLogo: 'Logo da empresa',
  loadingAnimation: 'Animação de carregamento',
  progressIndicator: 'Indicador de progresso';
} as const;
