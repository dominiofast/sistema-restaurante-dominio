import { supabase } from '@/integrations/supabase/client';

interface MetaTagsConfig {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  url?: string;
}

interface CompanyMetaTags {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_image?: string;
  phone?: string;
  address?: string;
  primary_color?: string;
}

export class DynamicMetaTagsService {
  
  // Buscar empresa pelo slug, domain ou ID
  static async getCompanyBySlug(slugOrId: string): Promise<CompanyMetaTags | null> {
    try {
      console.log('🔍 DynamicMetaTagsService - getCompanyBySlug chamado para:', slugOrId);
      
      // Verificar se é um UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      
      let query = supabase
        .from('companies')
        .select(`
          id,
          name,
          slug,
          logo,
          domain,
          status
        `)
        .eq('status', 'active');
      
      // Se é UUID, buscar por ID; senão, buscar por slug ou domain
      if (isUUID) {
        console.log('🔍 DynamicMetaTagsService - Searching by UUID:', slugOrId);
        query = query.eq('id', slugOrId);
      } else {
        console.log('🔍 DynamicMetaTagsService - Searching by slug/domain:', slugOrId);
        query = query.or(`slug.eq."${slugOrId}",domain.eq."${slugOrId}"`);
      }
      
      const { data, error } = await query.maybeSingle();
      
      console.log('🔍 DynamicMetaTagsService - Query result:', { data, error });

      if (error || !data) {
        console.error('❌ DynamicMetaTagsService - Erro ao buscar empresa:', error);
        return null;
      }

      console.log('✅ DynamicMetaTagsService - Empresa encontrada:', data);

      // Mapear para a interface esperada
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logo_url: data.logo,
        description: `Faça seu pedido online na ${data.name}`,
        meta_title: `${data.name}`,
        meta_description: `Faça seu pedido online na ${data.name}. Delivery rápido e seguro!`,
        meta_image: data.logo
      } as CompanyMetaTags;
    } catch (error) {
      console.error('❌ DynamicMetaTagsService - Erro ao buscar empresa por slug:', error);
      return null;
    }
  }

  // Gerar meta tags para uma empresa
  static generateCompanyMetaTags(company: CompanyMetaTags, currentUrl?: string): MetaTagsConfig {
    const defaultTitle = `${company.name}`;
    const defaultDescription = `Faça seu pedido online na ${company.name}. Delivery rápido e seguro!`;
    
    return {
      title: company.meta_title || defaultTitle,
      description: company.meta_description || defaultDescription,
      image: company.meta_image || company.logo_url || '/favicon.ico',
      siteName: company.name,
      type: 'website',
      url: currentUrl || `https://pedido.dominio.tech/${company.slug}`
    };
  }

  // Meta tags padrão da plataforma (fallback)
  static getDefaultMetaTags(): MetaTagsConfig {
    return {
      title: 'Pedidos Online',
      description: 'Peça online com praticidade e segurança',
      image: '/favicon.ico',
      siteName: 'Pedidos Online',
      type: 'website',
      url: 'https://pedido.dominio.tech'
    };
  }

  // Aplicar meta tags no documento
  static applyMetaTags(metaTags: MetaTagsConfig) {
    // Title
    if (metaTags.title) {
      document.title = metaTags.title;
    }

    // Meta description
    this.setMetaTag('name', 'description', metaTags.description || '');

    // Open Graph tags
    this.setMetaTag('property', 'og:title', metaTags.title || '');
    this.setMetaTag('property', 'og:description', metaTags.description || '');
    this.setMetaTag('property', 'og:image', metaTags.image || '');
    this.setMetaTag('property', 'og:site_name', metaTags.siteName || '');
    this.setMetaTag('property', 'og:type', metaTags.type || 'website');
    this.setMetaTag('property', 'og:url', metaTags.url || '');

    // Twitter Card tags
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', metaTags.title || '');
    this.setMetaTag('name', 'twitter:description', metaTags.description || '');
    this.setMetaTag('name', 'twitter:image', metaTags.image || '');

    // WhatsApp específico (mesmo que Open Graph)
    this.setMetaTag('property', 'og:image:width', '1200');
    this.setMetaTag('property', 'og:image:height', '630');
  }

  // Helper para definir meta tags
  private static setMetaTag(attribute: string, name: string, content: string) {
    let metaTag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attribute, name);
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  }

  // Limpar meta tags antigas
  static clearMetaTags() {
    const metaTagsToRemove = [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:image"]',
      'meta[property="og:site_name"]',
      'meta[property="og:type"]',
      'meta[property="og:url"]',
      'meta[name="twitter:card"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="twitter:image"]'
    ];

    metaTagsToRemove.forEach(selector => {
      const metaTag = document.querySelector(selector);
      if (metaTag) {
        metaTag.remove();
      }
    });
  }

  // Extrair slug da URL atual
  static getSlugFromPath(pathname: string): string | null {
    // Padrões de URL que podem conter slug da empresa:
    // /empresa-slug
    // /cardapio/empresa-slug  
    // /pedido/empresa-slug
    // /autoatendimento/empresa-slug
    // /empresa-slug/categoria
    
    console.log('🔍 DynamicMetaTagsService - getSlugFromPath chamado para pathname:', pathname);
    
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    console.log('🔍 DynamicMetaTagsService - pathSegments:', pathSegments);
    
    if (pathSegments.length === 0) {
      console.log('🔍 DynamicMetaTagsService - Nenhum segmento encontrado, retornando null');
      return null;
    }

    // Se o primeiro segmento não é uma rota conhecida, assume que é um slug
    const knownRoutes = [
      'admin', 'login', 'register', 'dashboard', 'settings', 'api', 
      'pedidos', 'orders', 'config', 'profile', 'logout', 'reset-password',
      'cardapio', 'menu', 'checkout', 'payment', 'success', 'error', 'auth',
      'empresas', 'companies', 'super-admin', 'caixa', 'pdv', 'clientes', 'marketing',
      'whatsapp', 'chat', 'kds', 'cashback', 'agente-ia', 'teste-agente',
      'ferramentas', 'tools', 'estoque', 'gestor-cardapio', 'opcoes-loja',
      'autoatendimento'
    ];
    const firstSegment = pathSegments[0];
    console.log('🔍 DynamicMetaTagsService - firstSegment:', firstSegment, 'é rota conhecida?', knownRoutes.includes(firstSegment));
    
    if (!knownRoutes.includes(firstSegment)) {
      console.log('🔍 DynamicMetaTagsService - Primeiro segmento não é rota conhecida, retornando como slug:', firstSegment);
      return firstSegment;
    }

    // Se é uma rota conhecida, verifica se há slug no segundo segmento
    if (pathSegments.length > 1 && ['cardapio', 'pedido', 'autoatendimento'].includes(firstSegment)) {
      console.log('🔍 DynamicMetaTagsService - Rota conhecida detectada, extraindo slug do segundo segmento:', pathSegments[1]);
      return pathSegments[1];
    }

    console.log('🔍 DynamicMetaTagsService - Nenhum slug encontrado, retornando null');
    return null;
  }

  // TODO: Implementar atualização de meta tags após adicionar colunas na tabela
  static async updateCompanyMetaTags(
    companyId: string, 
    metaTags: {
      name?: string;
      domain?: string;
      logo?: string;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('companies')
        .update(metaTags)
        .eq('id', companyId);

      if (error) {
        console.error('Erro ao atualizar empresa:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      return false;
    }
  }
} 