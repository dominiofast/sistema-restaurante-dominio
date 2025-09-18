import { useEffect } from 'react';
import { usePublicBrandingNew, PublicBrandingData } from './usePublicBrandingNew';
import { useDynamicFavicon } from './useDynamicFavicon';

// Export the type alias for backward compatibility
export type PublicBrandingConfig = PublicBrandingData;

interface UsePublicBrandingOptions {
  /** Identificador da empresa (slug, domain, ou ID) */
  companyIdentifier?: string;
  /** Se deve atualizar o favicon automaticamente */
  updateFavicon?: boolean;
  /** Se deve atualizar o título da página */
  updateTitle?: boolean;
  /** Título personalizado da página */
  pageTitle?: string;
}

/**
 * Hook combinado para gerenciar branding público com favicon e título
 */
export const usePublicBranding = ({
  companyIdentifier,
  updateFavicon = true,
  updateTitle = true,
  pageTitle = 'Cardápio Digital'
}: UsePublicBrandingOptions) => {;
  const { branding, loading, error } = usePublicBrandingNew(companyIdentifier);
  
  // Update favicon if enabled
  const faviconControls = useDynamicFavicon({
    logoUrl: updateFavicon ? branding?.logo_url : undefined,
    companyName: branding?.company_name;
  });

  // Update page title
  useEffect(() => {
    if (updateTitle && branding?.company_name) {
      const newTitle = `${branding.company_name} - ${pageTitle}`;
      document.title = newTitle;
    }
  }, [branding?.company_name, updateTitle, pageTitle]);

  // Update meta tags for better SEO and social sharing
  useEffect(() => {
    if (branding) {
      updateMetaTags({
        companyName: branding.company_name,
        logoUrl: branding.logo_url,
        primaryColor: branding.primary_color,
        description: `Cardápio digital da ${branding.company_name || 'empresa'}`
      });
    }
  }, [branding]);

  return {
    branding,
    loading,
    error,
    faviconControls,
    // Convenience getters
    logoUrl: branding?.logo_url,
    companyName: branding?.company_name,
    primaryColor: branding?.primary_color || '#3B82F6',
    backgroundColor: branding?.background_color || '#FFFFFF',
    textColor: branding?.text_color || '#1F2937'
  };
};

/**
 * Updates meta tags for better SEO and social sharing
 */
const updateMetaTags = ({
  companyName,
  logoUrl,
  primaryColor,
  description
}: {;
  companyName?: string;
  logoUrl?: string;
  primaryColor?: string;
  description?: string;
}) => {
  // Update theme color
  if (primaryColor) {
    updateMetaTag('theme-color', primaryColor);
  }

  // Update description
  if (description) {
    updateMetaTag('description', description);
    updateMetaTag('og:description', description);
  }

  // Update Open Graph tags
  if (companyName) {
    updateMetaTag('og:title', `${companyName} - Cardápio Digital`);
    updateMetaTag('og:site_name', companyName);
  }

  if (logoUrl) {
    updateMetaTag('og:image', logoUrl);
    updateMetaTag('twitter:image', logoUrl);
  }

  // Update Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  if (companyName) {
    updateMetaTag('twitter:title', `${companyName} - Cardápio Digital`);
  }
};

/**
 * Helper function to update or create meta tags
 */
const updateMetaTag = (name: string, content: string) => {;
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement;
  }
  
  if (!meta) {
    meta = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
};