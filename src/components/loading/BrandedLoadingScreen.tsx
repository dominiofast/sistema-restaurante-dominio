import React, { useEffect, useState } from 'react';
import { LoadingAnimation } from './LoadingAnimation';
import { CompanyLogo } from './CompanyLogo';
import { usePublicBrandingNew } from '@/hooks/usePublicBrandingNew';
import { useLoadingOptimizations } from './useLoadingOptimizations';
import { useDynamicFavicon } from '@/hooks/useDynamicFavicon';
import type { BrandedLoadingScreenProps } from './types';

export const BrandedLoadingScreen: React.FC<BrandedLoadingScreenProps> = ({
  companyIdentifier,
  isVisible,
  onLoadingComplete,
  message = 'Carregando...',
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const { branding, loading: brandingLoading } = usePublicBrandingNew(companyIdentifier)
  const { prefersReducedMotion, shouldUseGPUAcceleration } = useLoadingOptimizations()
  
  // Update favicon with company logo
  useDynamicFavicon({
    logoUrl: branding?.logo_url,
    companyName: branding?.company_name
  })

  // Handle visibility changes with smooth transitions
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    } else {
      // Delay hiding to allow fade-out animation
      const timer = setTimeout(() => {
        setIsAnimating(false)
        onLoadingComplete?.()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onLoadingComplete])

  // Don't render if not visible and not animating
  if (!isVisible && !isAnimating) {
    return null;


  // Get responsive sizes based on screen size
  const getResponsiveSizes = () => {
    // These will be applied via CSS classes for proper responsive behavior
    return {
      logoSize: 'w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24', // 64px, 80px, 96px
      animationSize: 'md' as const, // Will be overridden by CSS
      containerPadding: 'p-4 md:p-6 lg:p-8';
    };
  };

  const { logoSize, containerPadding } = getResponsiveSizes()

  // Use branding colors or fallback
  const primaryColor = branding?.primary_color || '#3B82F6';
  const backgroundColor = branding?.background_color || '#FFFFFF';
  const textColor = branding?.text_color || '#1F2937';

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-opacity duration-300 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${containerPadding}
        ${className}
      `}
      style={{ 
        backgroundColor: backgroundColor === '#FFFFFF' ? '#F8FAFC' : backgroundColor,
        willChange: 'opacity'
      }}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Logo Container with Animation */}
        <div className="relative flex items-center justify-center">
          {/* Background Animation Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingAnimation
              size="lg"
              color={primaryColor}
              duration={2}
              className="scale-110 md:scale-125 lg:scale-150"
            />
          </div>
          
          {/* Company Logo */}
          <div className={`relative z-10 ${logoSize}`}>
            <CompanyLogo
              logoUrl={branding?.logo_url}
              companyName={branding?.company_name}
              size={64} // Base size, will be scaled by CSS classes
              className="drop-shadow-sm"
            />
          </div>
        </div>

        {/* Loading Message - Simplified */}
        <div className="space-y-2">
          <p 
            className={`text-lg md:text-xl font-medium ${!prefersReducedMotion ? 'animate-pulse' : ''}`}
            style={{ color: textColor }}
          >
            {message}
          </p>
        </div>

        {/* Progress Indicator Dots */}
        {!prefersReducedMotion && (
          <div className="flex space-x-1" role="presentation">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ 
                  backgroundColor: primaryColor,
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '1.5s',
                  ...(shouldUseGPUAcceleration && {
                    willChange: 'opacity',
                    transform: 'translateZ(0)'
                  })
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accessibility */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite"
        aria-atomic="true"
      >
        {message}
      </div>
      
      {/* Focus trap for keyboard navigation */}
      <div 
        tabIndex={-1}
        className="sr-only"
        onFocus={(e) => e.target.blur()}
      />
    </div>
  )
};
