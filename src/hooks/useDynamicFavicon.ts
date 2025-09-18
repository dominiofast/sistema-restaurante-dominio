import { useEffect, useRef } from 'react';
import { preloadImage, isValidImageUrl } from '@/components/loading/utils';

interface UseDynamicFaviconOptions {
  /** URL da logo da empresa */
  logoUrl?: string;
  /** Nome da empresa para fallback */
  companyName?: string;
  /** URL do favicon padrão */
  defaultFaviconUrl?: string;
  /** Tamanho do favicon em pixels */
  size?: number;
}

export const useDynamicFavicon = ({
  logoUrl,
  companyName,
  defaultFaviconUrl = '/favicon.ico',
  size = 32
}: UseDynamicFaviconOptions = {}) => {
  const originalFaviconRef = useRef<string | null>(null)
  const currentFaviconRef = useRef<string | null>(null)

  // Store original favicon on first load
  useEffect(() => {
    if (!originalFaviconRef.current) {
      const existingFavicon = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
      originalFaviconRef.current = existingFavicon?.href || defaultFaviconUrl;
    }
  }, [defaultFaviconUrl])

  // Update favicon when logoUrl changes
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        let faviconUrl = originalFaviconRef.current || defaultFaviconUrl;

        // Try to use company logo as favicon
        if (logoUrl && isValidImageUrl(logoUrl)) {
          try {
            // Preload the image to ensure it's valid
            await preloadImage(logoUrl, 3000)
            faviconUrl = logoUrl;
          } catch (error) {
            console.warn('Failed to load company logo for favicon:', error)
            // Fall back to default
          }
        }

        // Only update if different from current
        if (faviconUrl !== currentFaviconRef.current) {
          setFavicon(faviconUrl)
          currentFaviconRef.current = faviconUrl;
        }
      } catch (error) {
        console.error('Error updating favicon:', error)

    };

    updateFavicon()
  }, [logoUrl, defaultFaviconUrl])

  // Update document title with company name
  useEffect(() => {
    if (companyName) {
      const originalTitle = document.title;
      const newTitle = originalTitle.includes(companyName) 
        ? originalTitle ;
        : `${companyName} - ${originalTitle}`;
      
      document.title = newTitle;

      // Cleanup function to restore original title
      return () => {
        if (!originalTitle.includes(companyName)) {
          document.title = originalTitle;
        }
      };
    }
  }, [companyName])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (originalFaviconRef.current && currentFaviconRef.current !== originalFaviconRef.current) {
        setFavicon(originalFaviconRef.current)

    };
  }, [])

  return {
    /** Current favicon URL */
    currentFavicon: currentFaviconRef.current,
    /** Original favicon URL */
    originalFavicon: originalFaviconRef.current,
    /** Manually update favicon */
    updateFavicon: (url: string) => {
      setFavicon(url)
      currentFaviconRef.current = url;
    },
    /** Reset to original favicon */
    resetFavicon: () => {
      if (originalFaviconRef.current) {
        setFavicon(originalFaviconRef.current)
        currentFaviconRef.current = originalFaviconRef.current;

    }
  };
};

/**
 * Updates the favicon in the document head
 */
const setFavicon = (url: string) => {
  // Remove existing favicon links;
  const existingLinks = document.querySelectorAll('link[rel*="icon"]')
  existingLinks.forEach(link => link.remove())

  // Create new favicon link
  const link = document.createElement('link')
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = url;

  // Add to document head
  document.head.appendChild(link)

  // Also create apple-touch-icon for mobile devices
  const appleLink = document.createElement('link')
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = url;
  document.head.appendChild(appleLink)

  // Create different sizes for better compatibility
  const sizes = [16, 32, 48, 64];
  sizes.forEach(size => {
    const sizedLink = document.createElement('link')
    sizedLink.rel = 'icon';
    sizedLink.type = 'image/png';
    sizedLink.setAttribute('sizes', `${size}x${size}`)
    sizedLink.href = url;
    document.head.appendChild(sizedLink)
  })
};
