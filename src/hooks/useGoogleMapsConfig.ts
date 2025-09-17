import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GoogleMapsConfig {
  id?: string;
  api_key: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useGoogleMapsConfig = () => {
  const [config, setConfig] = useState<GoogleMapsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get API key from Supabase edge function
      const { data, error } = await supabase.functions.invoke('get-maps-config');
      
      if (error) {
        console.error('Erro ao buscar configuração do Google Maps:', error);
        setError('Erro ao carregar configuração do Google Maps');
        setConfig(null);
        return;
      }

      if (!data?.apiKey) {
        console.warn('Google Maps API key not configured');
        setError('Chave da API do Google Maps não configurada');
        setConfig(null);
        return;
      }
      
      setConfig({
        api_key: data.apiKey
      });
    } catch (err: any) {
      console.error('Erro ao buscar configuração do Google Maps:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Partial<GoogleMapsConfig>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Save logic here
      setConfig(prev => ({ ...prev, ...configData }));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchConfig();
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    apiKey: config?.api_key,
    loading,
    error,
    saveConfig,
    refetch
  };
};
