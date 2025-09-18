import React, { useEffect } from 'react';
import SEOStructuredData from './SEOStructuredData';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'homepage' | 'product' | 'organization';
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Dominio.tech - Plataforma Empresarial de Nova Geração | Gestão Completa para seu Negócio",
  description = "Dominio.tech - Plataforma empresarial completa para gestão de restaurantes, delivery, cardápios digitais e muito mais. Transforme seu negócio com tecnologia de ponta.",
  keywords = "dominio.tech, plataforma empresarial, gestão restaurante, delivery, cardápio digital, sistema gestão, tecnologia empresarial, automação, PDV, controle estoque, WhatsApp Business, marketing digital",
  image = "https://dominio.tech/og-image.jpg",
  url = "https://dominio.tech",
  type = 'homepage',
  noIndex = false
}) => {
  useEffect(() => {
    // Atualizar título da página
    document.title = title;
    
    // Função para atualizar ou criar meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      
      meta.setAttribute('content', content)
    };
    
    // Função para atualizar ou criar link tags
    const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
      let link = document.querySelector(selector) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', rel)
        if (hreflang) {
          link.setAttribute('hreflang', hreflang)
        }
        document.head.appendChild(link)
      }
      
      link.setAttribute('href', href)
    };
    
    // Atualizar meta tags básicas
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    
    // Atualizar Open Graph
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:type', 'website', true)
    updateMetaTag('og:site_name', 'Dominio.tech', true)
    
    // Atualizar Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)
    
    // Atualizar canonical URL
    updateLinkTag('canonical', url)
    
    // Atualizar alternate para idiomas
    updateLinkTag('alternate', 'https://dominio.tech', 'pt-br')
    updateLinkTag('alternate', 'https://dominio.tech', 'x-default')
    
  }, [title, description, keywords, image, url, noIndex])
  
  return (
    <>
      {/* Dados Estruturados */}
      <SEOStructuredData type={type} />
    </>
  )
};

export default SEOHead;
