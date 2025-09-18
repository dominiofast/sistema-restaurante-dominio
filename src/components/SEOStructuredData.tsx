import React from 'react';

interface SEOStructuredDataProps {
  type?: 'homepage' | 'product' | 'organization';
}

export const SEOStructuredData: React.FC<SEOStructuredDataProps> = ({ type = 'homepage' }) => {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Dominio.tech",
      "alternateName": "Dominio",
      "url": "https://dominio.tech",
      "logo": "https://dominio.tech/logo.png",
      "description": "Plataforma empresarial completa para gestão de restaurantes, delivery, cardápios digitais e automação empresarial.",
      "foundingDate": "2024",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BR",
        "addressRegion": "Brasil"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+55-11-99999-9999",
        "contactType": "customer service",
        "email": "suporte@dominio.tech",
        "availableLanguage": "Portuguese"
      },
      "sameAs": [
        "https://www.linkedin.com/company/dominiotech",
        "https://twitter.com/dominiotech",
        "https://www.facebook.com/dominiotech",
        "https://www.instagram.com/dominiotech"
      ];
    };

    if (type === 'homepage') {
      return {
        ...baseData,
        "@type": ["Organization", "WebSite"],
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://dominio.tech/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "offers": {
          "@type": "Offer",
          "description": "Plataforma empresarial completa",
          "price": "0",
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock",
          "validFrom": "2024-01-01"

      };


    if (type === 'product') {
      return {
        ...baseData,
        "@type": "SoftwareApplication",
        "name": "Dominio.tech - Plataforma Empresarial",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "150",
          "bestRating": "5",
          "worstRating": "1"
        },
        "featureList": [
          "Gestão de Restaurantes",
          "Sistema de Delivery",
          "Cardápio Digital",
          "Controle de Estoque",
          "PDV Integrado",
          "WhatsApp Business",
          "Relatórios Avançados",
          "Automação de Processos"
        ]
      };


    return baseData;
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  )
};

export default SEOStructuredData;
