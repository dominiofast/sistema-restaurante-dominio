import { useEffect, useState, useCallback } from 'react';
// // SUPABASE REMOVIDO
// DESABILITADO - Sistema migrado para PostgreSQL
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
  const [config, setConfig] = useState<PixelConfigPublic | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const params = useParams<{ company_slug?: string }>()
  const location = useLocation()

  const slug = (companySlug?.trim()) || params.company_slug || location.pathname.split('/')[1] || null;

  const fetchConfig = useCallback(async () => {
    console.log('⚠️ fetchConfig desabilitado - sistema migrado para PostgreSQL')
    return Promise.resolve([])
  }

    try {
      console.log('⚠️ usePublicPixelConfig: Desabilitado - sistema usa PostgreSQL')
      setConfig(null)
    } catch (err) {
      console.error('[usePublicPixelConfig] Erro ao buscar config:', err)
      setConfig(null)
    } finally {
      setIsLoading(false)

  }, [slug])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return { config, isLoading, refetch: fetchConfig };
}
