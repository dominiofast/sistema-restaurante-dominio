interface MetaTagsData {
  company_name: string;
  company_description?: string;
  company_slug: string;
}

export const updateMetaTags = ({ company_name, company_description, company_slug }: MetaTagsData) => {
  const updateMeta = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`) || 
               document.querySelector(`meta[property="${name}"]`);
    
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      if (name.startsWith('og:')) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  };

  // Título da página
  const title = `${company_name} - Cardápio Digital`;
  document.title = title;
  
  // Descrição
  const description = company_description || `Confira o cardápio completo de ${company_name}. Peça online com praticidade e rapidez!`;
  
  // URL atual
  const url = window.location.href;
  
  // Atualizar meta tags
  updateMeta('title', title);
  updateMeta('og:title', title);
  updateMeta('og:description', description);
  updateMeta('og:url', url);
  updateMeta('og:type', 'website');
  updateMeta('description', description);
  
  console.log('✅ Meta tags atualizadas para:', { title, description, url });
};