import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DynamicMetaTagsService } from '@/services/dynamicMetaTagsService';

interface CompanyMetaTags {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_image?: string;
}

export const useDynamicMetaTags = () => {
  const location = useLocation()
  const [company, setCompany] = useState<CompanyMetaTags | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const applyMetaTags = async () => {
      setLoading(true)
      
      // Extrair slug da URL atual
      const slug = DynamicMetaTagsService.getSlugFromPath(location.pathname)
      
      if (slug) {
        // Buscar empresa pelo slug
        const companyData = await DynamicMetaTagsService.getCompanyBySlug(slug)
        
        if (companyData) {
          setCompany(companyData)
          
          // Gerar meta tags da empresa
          const metaTags = DynamicMetaTagsService.generateCompanyMetaTags(
            companyData, 
            window.location.href
          )
          
          // Aplicar as meta tags
          DynamicMetaTagsService.applyMetaTags(metaTags)
        } else {
          // Se não encontrou empresa, usar meta tags padrão
          setCompany(null)
          const defaultMetaTags = DynamicMetaTagsService.getDefaultMetaTags()
          DynamicMetaTagsService.applyMetaTags(defaultMetaTags)
        }
      } else {
        // URL sem slug específico, usar meta tags padrão
        setCompany(null)
        const defaultMetaTags = DynamicMetaTagsService.getDefaultMetaTags()
        DynamicMetaTagsService.applyMetaTags(defaultMetaTags)
      }
      
      setLoading(false)
    };

    applyMetaTags()
  }, [location.pathname])

  // Limpeza quando o componente for desmontado
  useEffect(() => {
    return () => {
      DynamicMetaTagsService.clearMetaTags()
    };
  }, [])

  return {
    company,
    loading,
    // Função para aplicar meta tags manualmente
    applyCustomMetaTags: (metaTags: {
      title?: string;
      description?: string;
      image?: string;
      siteName?: string;
    }) => {
      DynamicMetaTagsService.applyMetaTags({
        ...metaTags,
        type: 'website',
        url: window.location.href
      })
    }
  };
};
