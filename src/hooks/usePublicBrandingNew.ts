import { useState, useEffect } from 'react';
// Removido Supabase - agora usa APIs Neon

export interface PublicBrandingData {
  id?: string;
  company_id: string;
  company_name?: string;
  logo_url?: string;
  banner_url?: string;
  show_logo?: boolean;
  show_banner?: boolean;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  text_color?: string;
  background_color?: string;
  header_style?: string;
  is_active?: boolean;


export const usePublicBrandingNew = (companyIdentifier?: string) => {
  const [branding, setBranding] = useState<PublicBrandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyIdentifier) {
      setLoading(false)
      return;
    }

    const fetchPublicBranding = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🎨 usePublicBrandingNew - Buscando branding público via API Neon para:', companyIdentifier)

        // Buscar empresa via API /api/companies
        const companyResponse = await fetch('/api/companies')
        const companyResult = await companyResponse.json()
        
        if (!companyResponse.ok || !companyResult.success) {
          throw new Error(companyResult.error || 'Erro ao carregar empresas')
        }

         catch (error) { console.error('Error:', error) }// Procurar empresa por identificador
        const company = companyResult.data?.find((comp: any) => {
          if (!isNaN(Number(companyIdentifier))) {
            // É número - usar store_code;
            return comp.store_code === Number(companyIdentifier)
          } else if (companyIdentifier.length === 36 && companyIdentifier.includes('-')) {
            // É UUID - usar ID
            return comp.id === companyIdentifier;
          } else {
            // É slug ou domain
            return comp.slug === companyIdentifier || comp.domain === companyIdentifier;
          }
        })

        if (!company) {
          console.error('❌ usePublicBrandingNew - Empresa não encontrada para identificador:', companyIdentifier)
          throw new Error('Empresa não encontrada ou inativa')
        }

        console.log('✅ usePublicBrandingNew - Empresa encontrada via API:', company)

        // Por enquanto, usar configuração básica do branding (sem busca adicional)
        // TODO: Criar API para buscar dados de branding quando necessário
        console.log('🎨 usePublicBrandingNew - Usando configuração básica de branding (mock)')
        
        const brandingData = null; // Mock - sem dados de branding avançado por enquanto
        const logoUrl = company.logo; // Usar logo da empresa
        const bannerUrl = undefined; // Sem banner por enquanto
        
        console.log('🖼️ URLs extraídas:', { logoUrl, bannerUrl })

        // Montar objeto final de branding
        const finalBranding: PublicBrandingData = {
          id: brandingData?.id,
          company_id: company.id,
          company_name: company.name,
          logo_url: logoUrl,
          banner_url: bannerUrl,
          show_logo: brandingData?.show_logo ?? true,
          show_banner: brandingData?.show_banner ?? true,
          primary_color: brandingData?.primary_color ?? '#3B82F6',
          secondary_color: brandingData?.secondary_color ?? '#1E40AF',
          accent_color: brandingData?.accent_color ?? '#F59E0B',
          text_color: brandingData?.text_color ?? '#1F2937',
          background_color: brandingData?.background_color ?? '#FFFFFF',
          header_style: brandingData?.header_style ?? 'modern',
          is_active: brandingData?.is_active ?? true,
        };

        console.log('✅ Branding final para o header:', {
          logo_url: finalBranding.logo_url,
          banner_url: finalBranding.banner_url,
          show_logo: finalBranding.show_logo,
          show_banner: finalBranding.show_banner
        })

        console.log('✅ Branding final montado:', finalBranding)
        setBranding(finalBranding)

      } catch (err: any) {
        console.error('❌ Erro ao buscar branding público:', err)
        setError(err.message)
        
        // Mesmo com erro, fornecer configuração básica se soubermos a empresa
        setBranding({
          company_id: '',
          company_name: companyIdentifier,
          show_logo: true,
          show_banner: true,
          primary_color: '#3B82F6',
          secondary_color: '#1E40AF',
          accent_color: '#F59E0B',
          text_color: '#1F2937',
          background_color: '#FFFFFF',
          header_style: 'modern',
          is_active: true,
        })
      } finally {
        setLoading(false)

    };

    fetchPublicBranding()
  }, [companyIdentifier])

  return { 
    branding, 
    loading, 
    error,
    // Manter compatibilidade com código existente
// config: branding
  };
};
