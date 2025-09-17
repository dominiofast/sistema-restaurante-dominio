import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useLocation } from 'react-router-dom';

export interface PixelConfigPublic {
  id?: string;
  company_id: string;
  pixel_id: string;
  access_token?: string;
  is_active: boolean;
  test_mode: boolean;
  test_event_code?: string;
}

export function usePublicPixelConfig(companySlug?: string) {
  const [config, setConfig] = useState<PixelConfigPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams<{ company_slug?: string }>();
  const location = useLocation();

  const slug = (companySlug?.trim()) || params.company_slug || location.pathname.split('/')[1] || null;

  const fetchConfig = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    try {
      console.info('[usePublicPixelConfig] Resolvido slug:', slug);
      // Buscar empresa por slug | id | store_code
      let companyQuery = supabase
        .from('companies')
        .select('id, slug, store_code, status')
        .eq('status', 'active');

      if (isNaN(Number(slug))) {
        if ((slug as string).length === 36) {
          companyQuery = companyQuery.eq('id', slug as string);
        } else {
          companyQuery = companyQuery.eq('slug', slug as string);
        }
      } else {
        companyQuery = companyQuery.eq('store_code', Number(slug));
      }

      const { data: company, error: companyError } = await companyQuery.maybeSingle();
      if (companyError) throw companyError;
      if (!company?.id) {
        console.info('[usePublicPixelConfig] Empresa não encontrada para slug:', slug);
        setConfig(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('facebook_pixel_configs')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();

      if (error) throw error;
      console.info('[usePublicPixelConfig] Config do pixel:', data);
      setConfig(data ?? null);
    } catch (err) {
      console.error('[usePublicPixelConfig] Erro ao buscar config:', err);
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, isLoading, refetch: fetchConfig };
}
