
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EntregaOption {
  id: string;
  tipo: 'delivery' | 'pickup' | 'dine_in';
  nome: string;
  ativo: boolean;
  valor_minimo?: number;
  taxa_entrega?: number;
  descricao?: string;
}

export const useEntregaConfig = (companyId: string | undefined) => {
  const [deliveryOptions, setDeliveryOptions] = useState<EntregaOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadDeliveryConfig();
    }
  }, [companyId]);

  const loadDeliveryConfig = async () => {
    try {
      setLoading(true);

      // Buscar regiões de atendimento para verificar se delivery está ativo e calcular taxa
      const { data: regioes, error: regioesError } = await supabase
        .from('regioes_atendimento')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', true);

      if (regioesError) {
        console.error('Erro ao buscar regiões:', regioesError);
      }

      // Configurações baseadas nas opções do estabelecimento
      const options: EntregaOption[] = [];

      // Delivery - ativo se houver regiões configuradas
      const hasDeliveryRegions = regioes && regioes.length > 0;
      if (hasDeliveryRegions) {
        const taxaMinima = Math.min(...regioes.map(r => r.valor || 0));
        options.push({
          id: 'delivery',
          tipo: 'delivery',
          nome: 'Delivery',
          ativo: true,
          descricao: 'Entrega no endereço do cliente',
          valor_minimo: 20,
          taxa_entrega: taxaMinima
        });
      }

      // Retirada no estabelecimento - sempre disponível
      options.push({
        id: 'pickup',
        tipo: 'pickup',
        nome: 'Retirada no estabelecimento',
        ativo: true,
        descricao: 'Cliente retira no local'
      });

      // Consumo no local - verificar se está habilitado (por padrão desabilitado)
      // Pode ser expandido futuramente para verificar configurações específicas
      options.push({
        id: 'dine_in',
        tipo: 'dine_in',
        nome: 'Consumo no local',
        ativo: false,
        descricao: 'Cliente consome no estabelecimento'
      });

      console.log('Opções de entrega carregadas:', options);
      setDeliveryOptions(options);

    } catch (error) {
      console.error('Erro ao carregar configuração de entrega:', error);
      // Configuração padrão em caso de erro
      setDeliveryOptions([
        { 
          id: 'pickup', 
          tipo: 'pickup', 
          nome: 'Retirada no estabelecimento', 
          ativo: true,
          descricao: 'Cliente retira no local'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    deliveryOptions,
    loading,
    refetch: loadDeliveryConfig
  };
};
