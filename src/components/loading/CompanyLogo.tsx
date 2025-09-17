import React from 'react';
import { Building2 } from 'lucide-react';
import type { EnhancedCompanyLogoProps } from './types';
import { useLogoBreakpoints } from './useLogoBreakpoints';
import styles from './CompanyLogo.module.css';

export const CompanyLogo: React.FC<EnhancedCompanyLogoProps> = ({
  logoUrl,
  companyName,
  size,
  fallbackIcon,
  className = '',
  context = 'branding',
  enableResponsive = true,
  customBreakpoints
}) => {
  // Use responsive breakpoints based on context
  const { 
    currentBreakpoint, 
    breakpointClasses, 
    breakpointStyles 
  } = useLogoBreakpoints({
    context,
    baseSize: size,
    customBreakpoints,
    enableContainerQueries: enableResponsive
  });

  // Calculate final size - use manual size if provided, otherwise use breakpoint size
  const finalSize = size || currentBreakpoint.logoSize;

  // Determine classes CSS baseadas no contexto e breakpoints
  const getContextClasses = () => {
    const classes = [styles['logo-container']];
    
    // Add responsive classes if enabled
    if (enableResponsive) {
      classes.push(styles['logo-responsive']);
      // Add breakpoint-specific classes from hook
      breakpointClasses.split(' ').forEach(cls => {
        if (styles[cls]) {
          classes.push(styles[cls]);
        }
      });
    } else {
      // Legacy context-specific classes for backward compatibility
      if (context === 'header') {
        classes.push(styles['header-logo']);
      } else if (context === 'loading') {
        classes.push(styles['loading-logo-enhanced']);
      } else {
        classes.push(styles['company-branding-logo']);
      }
    }
    
    classes.push(styles['no-crop']);
    classes.push(styles['logo-optimized']);
    
    return classes.join(' ');
  };

  return (
    <div 
      className={`${getContextClasses()} ${className}`}
      style={{
        width: finalSize,
        height: finalSize,
        maxWidth: finalSize,
        maxHeight: finalSize,
        aspectRatio: '1 / 1',
        ...breakpointStyles
      }}
    >
      {logoUrl && (
        <img
          src={logoUrl}
          alt={companyName ? `Logo da ${companyName}` : 'Logo da empresa'}
          className={styles['logo-image']}
          loading="lazy"
          width={finalSize}
          height={finalSize}
          draggable={false}
          decoding="async"
        />
      )}

      {!logoUrl && fallbackIcon && (
        <div className="w-full h-full flex items-center justify-center">
          {fallbackIcon}
        </div>
      )}

      {!logoUrl && !fallbackIcon && companyName && (
        <div className="w-full h-full flex items-center justify-center">
          <Building2 className="w-1/2 h-1/2 text-gray-400" />
        </div>
      )}
    </div>
  );
};