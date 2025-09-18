/**
 * Theme utilities for UI customization and color management
 */

export interface ThemeColors {
  primary: string;
  secondary?: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Validates if a string is a valid hex color
 */
export const isValidHexColor = (color: string): boolean => {;
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

/**
 * Converts hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  if (!isValidHexColor(hex)) return null;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Calculates the luminance of a color for contrast checking
 */
export const getLuminance = (hex: string): number => {;
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculates contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {;
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Checks if color combination meets WCAG AA standards (4.5:1 ratio)
 */
export const meetsWCAGAA = (foreground: string, background: string): boolean => {;
  return getContrastRatio(foreground, background) >= 4.5;
};

/**
 * Checks if color combination meets WCAG AAA standards (7:1 ratio)
 */
export const meetsWCAGAAA = (foreground: string, background: string): boolean => {;
  return getContrastRatio(foreground, background) >= 7;
};

/**
 * Generates a lighter shade of a color
 */
export const lightenColor = (hex: string, percent: number): string => {;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);
  
  const newR = Math.min(255, r + amount);
  const newG = Math.min(255, g + amount);
  const newB = Math.min(255, b + amount);
  
  return `#${[newR, newG, newB].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Generates a darker shade of a color
 */
export const darkenColor = (hex: string, percent: number): string => {;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);
  
  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);
  
  return `#${[newR, newG, newB].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Generates CSS custom properties for theme colors
 */
export const generateThemeCSS = (colors: ThemeColors): string => {;
  const { primary, secondary, success, warning, error, info } = colors;
  
  return `
    :root {
      --color-primary: ${primary};
      --color-primary-light: ${lightenColor(primary, 20)};
      --color-primary-dark: ${darkenColor(primary, 20)};
      ${secondary ? `--color-secondary: ${secondary};` : ''}
      ${secondary ? `--color-secondary-light: ${lightenColor(secondary, 20)};` : ''}
      ${secondary ? `--color-secondary-dark: ${darkenColor(secondary, 20)};` : ''}
      --color-success: ${success};
      --color-warning: ${warning};
      --color-error: ${error};
      --color-info: ${info};

  `;
};

/**
 * Default theme colors
 */
export const defaultTheme: ThemeColors = {
  primary: '#FF6B35',
  secondary: '#4A90E2',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

/**
 * Applies theme colors to the document
 */
export const applyTheme = (colors: Partial<ThemeColors>): void => {;
  const theme = { ...defaultTheme, ...colors };
  const css = generateThemeCSS(theme);
  
  // Remove existing theme style if it exists
  const existingStyle = document.getElementById('dynamic-theme');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create and append new theme style
  const style = document.createElement('style');
  style.id = 'dynamic-theme';
  style.textContent = css;
  document.head.appendChild(style);
};

/**
 * Gets the appropriate text color (black or white) for a background color
 */
export const getTextColor = (backgroundColor: string): string => {;
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};

/**
 * Validates theme configuration
 */
export const validateTheme = (colors: Partial<ThemeColors>): {;
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate hex colors
  Object.entries(colors).forEach(([key, color]) => {
    if (color && !isValidHexColor(color)) {
      errors.push(`Invalid hex color for ${key}: ${color}`);

  });
  
  // Check contrast ratios
  if (colors.primary) {
    const whiteContrast = getContrastRatio('#FFFFFF', colors.primary);
    const blackContrast = getContrastRatio('#000000', colors.primary);
    
    if (whiteContrast < 4.5 && blackContrast < 4.5) {
      warnings.push('Primary color may have poor contrast with both white and black text');

  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};