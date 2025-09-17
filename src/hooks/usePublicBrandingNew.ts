import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

export const usePublicBrandingNew = (companyIdentifier?: string) => {
  const [branding, setBranding] = useState<PublicBrandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyIdentifier) {
      setLoading(false);
      return;
    }

    const fetchPublicBranding = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎨 usePublicBrandingNew - Buscando branding público para:', companyIdentifier);

        // Primeiro, buscar a empresa
        let companyQuery = supabase
          .from('companies')
          .select('id, name, domain, slug, status')
          .eq('status', 'active');

        console.log('🔍 usePublicBrandingNew - Base query setup for active companies');

        // Priorizar slug, depois domain, depois store_code, depois id
        if (isNaN(Number(companyIdentifier))) {
          // É texto - verificar se é slug, domain ou id
          if (companyIdentifier.length === 36 && companyIdentifier.includes('-')) {
            console.log('🔍 usePublicBrandingNew - Searching by ID (UUID):', companyIdentifier);
            companyQuery = companyQuery.eq('id', companyIdentifier);
          } else {
            console.log('🔍 usePublicBrandingNew - Searching by slug/domain:', companyIdentifier);
            companyQuery = companyQuery.or(`slug.eq."${companyIdentifier}",domain.eq."${companyIdentifier}"`);
          }
        } else {
          // É número - usar store_code
          console.log('🔍 usePublicBrandingNew - Searching by store_code:', companyIdentifier);
          companyQuery = companyQuery.eq('store_code', Number(companyIdentifier));
        }

        const { data: company, error: companyError } = await companyQuery.maybeSingle();

        console.log('🔍 usePublicBrandingNew - Query result:', { company, companyError });

        if (companyError) {
          console.error('❌ usePublicBrandingNew - Erro ao buscar empresa:', companyError);
          throw new Error(`Erro ao buscar empresa: ${companyError.message}`);
        }

        if (!company) {
          console.error('❌ usePublicBrandingNew - Empresa não encontrada para identificador:', companyIdentifier);
          throw new Error('Empresa não encontrada ou inativa');
        }

        console.log('✅ usePublicBrandingNew - Empresa encontrada:', company);

        // Buscar configuração de branding
        const { data: brandingData, error: brandingError } = await supabase
          .from('cardapio_branding')
          .select('*')
          .eq('company_id', company.id)
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (brandingError) {
          console.warn('⚠️ Erro ao buscar branding:', brandingError);
        }

        console.log('🎨 Dados de branding encontrados:', brandingData);

        let logoUrl: string | undefined;
        let bannerUrl: string | undefined;

        if (brandingData) {
          // Buscar logo se existe logo_file_id
          if (brandingData.logo_file_id) {
            const { data: logoFile } = await supabase
              .from('media_files')
              .select('file_url')
              .eq('id', brandingData.logo_file_id)
              .maybeSingle();
            logoUrl = logoFile?.file_url;
          }

          // Buscar banner se existe banner_file_id  
          if (brandingData.banner_file_id) {
            const { data: bannerFile } = await supabase
              .from('media_files')
              .select('file_url')
              .eq('id', brandingData.banner_file_id)
              .maybeSingle();
            bannerUrl = bannerFile?.file_url;
          }
          
          console.log('🖼️ URLs extraídas:', { logoUrl, bannerUrl });
        }

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
        });

        console.log('✅ Branding final montado:', finalBranding);
        setBranding(finalBranding);

      } catch (err: any) {
        console.error('❌ Erro ao buscar branding público:', err);
        setError(err.message);
        
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBranding();
  }, [companyIdentifier]);

  return { 
    branding, 
    loading, 
    error,
    // Manter compatibilidade com código existente
    config: branding
  };
};