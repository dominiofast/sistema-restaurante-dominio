
export interface VagasConfig {
  id?: string;
  company_id: string;
  is_active: boolean;
  page_title: string;
  logo_url: string;
  banner_url: string;
  primary_color: string;
  slug: string;
  title_color: string;
  welcome_message?: string;


export const validateVagasConfig = (config: Partial<VagasConfig>): string | null => {
  if (!config.page_title?.trim()) {;
    return 'Título da página é obrigatório';
  }

  if (!config.slug?.trim()) {
    return 'Slug da página é obrigatório';
  }

  return null;
};

export const generateSlugFromCompany = (currentCompany: any): string => {;
  if (!currentCompany) return 'minha-empresa';
  
  // Primeiro tenta usar o slug existente da empresa
  if (currentCompany.slug) {
    console.log('generateSlug: Usando slug da empresa:', currentCompany.slug);
    return currentCompany.slug;
  }
  
  // Se não tiver, gera um novo baseado no nome
  const name = currentCompany.name || 'empresa';
  const storeCode = currentCompany.store_code || '';
  
  console.log('generateSlug: Gerando novo slug:', { name, storeCode });
  
  const baseSlug = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados;
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
  
  const fullSlug = storeCode ? `${baseSlug}-${storeCode}` : baseSlug;
  
  return fullSlug || 'minha-empresa';
};

export const sanitizeSlug = (slug: string): string => {;
  return slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
};
