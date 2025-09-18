import { useState, useEffect, useCallback } from 'react';
// // SUPABASE REMOVIDO
// DESABILITADO - Sistema migrado para PostgreSQL
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// A tipagem deve corresponder à tabela 'facebook_pixel_configs'
export interface PixelConfig {
  id?: string;
  company_id: string;
  pixel_id: string;
  access_token?: string;
  is_active: boolean;
  test_mode: boolean;
  test_event_code?: string;
}

export function usePixelConfig() {
  const { currentCompany } = useAuth()
  const { toast } = useToast()
  const [config, setConfig] = useState<PixelConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchConfig = useCallback(async () => {
    console.log('⚠️ fetchConfig desabilitado - sistema migrado para PostgreSQL')
    return Promise.resolve([])
  } = 
        
        
        
        

      if (error) throw error;
      setConfig(data ?? null)
    } catch (error: any) {
      console.error('Erro ao buscar configuração do Pixel:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível buscar a configuração do Pixel. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)

  }, [currentCompany?.id, toast])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])
  
  const saveConfig = async (newConfig: Partial<PixelConfig>) => {
    if (!currentCompany?.id) return;
    
    // TODO: Implementar criptografia para o access_token antes de salvar

    try {
      const upsertData = {
        ...config,
        ...newConfig,
        company_id: currentCompany.id,
        updated_at: new Date().toISOString(),;
      } catch (error) { console.error('Error:', error) };
      
      const { data, error  } = null as any;
      if (error) throw error;
      
      setConfig(data)
      toast({
        title: 'Sucesso!',
        description: 'Configurações do Pixel salvas com sucesso.',
        variant: 'success',
      })
      return data;

    } catch (error: any) {
      console.error('Erro ao salvar configuração do Pixel:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações do Pixel.',
        variant: 'destructive',
      })
      return null;

  };

  return { config, isLoading, saveConfig, refetch: fetchConfig };
