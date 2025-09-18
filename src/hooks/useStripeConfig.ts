import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useToast } from '@/hooks/use-toast';

export interface StripeConfig {
  id: string;
  company_id: string;
  publishable_key: string | null;
  secret_key: string | null;
  pix_enabled: boolean;
  card_enabled: boolean;
  is_active: boolean;
  test_mode: boolean;
  webhook_endpoint_secret: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface StripeConfigData {
  publishable_key: string;
  secret_key: string;
  pix_enabled: boolean;
  card_enabled: boolean;
  is_active: boolean;
  test_mode: boolean;
  webhook_endpoint_secret: string;
}

export const useStripeConfig = (companyId?: string) => {
  const [config, setConfig] = useState<StripeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar configuração
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'stripe_config')
          /* .select\( REMOVIDO */ ; //'*')
          /* .eq\( REMOVIDO */ ; //'company_id', companyId)
          /* .maybeSingle\( REMOVIDO */ ; //);

        if (error) {
          console.error('Erro ao carregar configuração do Stripe:', error);
          setError(error.message);
        } else {
          setConfig(data);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro inesperado ao carregar configuração');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [companyId]);

  // Salvar configuração
  const saveConfig = async (configData: StripeConfigData): Promise<boolean> => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'ID da empresa não encontrado',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'stripe_config')
        /* .upsert\( REMOVIDO */ ; //{
          company_id: companyId,
          ...configData,
        }, {
          onConflict: 'company_id'
        })
        /* .select\( REMOVIDO */ ; //)
        /* .single\( REMOVIDO */ ; //);

      if (error) {
        console.error('Erro ao salvar configuração do Stripe:', error);
        toast({
          title: 'Erro ao salvar',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setConfig(data);
      toast({
        title: 'Configuração salva',
        description: 'Configuração do Stripe salva com sucesso!',
      });
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro inesperado ao salvar a configuração',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Testar credenciais
  const testCredentials = async (publishableKey: string, secretKey: string): Promise<boolean> => {
    try {
      // Validação básica do formato
      const isTestMode = publishableKey.startsWith('pk_test_') && secretKey.startsWith('sk_test_');
      const isLiveMode = publishableKey.startsWith('pk_live_') && secretKey.startsWith('sk_live_');
      
      if (!isTestMode && !isLiveMode) {
        toast({
          title: 'Formato inválido',
          description: 'Verifique o formato das chaves do Stripe',
          variant: 'destructive',
        });
        return false;
      }

      // Teste simples de conectividade (listar payment methods)
      const response = await fetch('https://api.stripe.com/v1/payment_methods', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.ok) {
        toast({
          title: 'Credenciais válidas',
          description: `Chaves do Stripe validadas (${isTestMode ? 'Teste' : 'Produção'})`,
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: 'Credenciais inválidas',
          description: errorData.error?.message || 'Erro ao validar credenciais',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      console.error('Erro ao testar credenciais:', err);
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível testar as credenciais',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    config,
    loading,
    error,
    saveConfig,
    testCredentials,
    setConfig,
  };
};
