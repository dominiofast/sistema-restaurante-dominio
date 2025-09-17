import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeliveryFreeStatus {
  hasDelivery: boolean;
  hasFreeDelivery: boolean;
  allRegionsFree: boolean;
  someRegionsFree: boolean;
  freeRegionsCount: number;
  totalRegionsCount: number;
}

export const useDeliveryFreeConfig = (companyId: string | undefined) => {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryFreeStatus>({
    hasDelivery: false,
    hasFreeDelivery: false,
    allRegionsFree: false,
    someRegionsFree: false,
    freeRegionsCount: 0,
    totalRegionsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadDeliveryFreeStatus();
    }
  }, [companyId]);

  const loadDeliveryFreeStatus = async () => {
    try {
      setLoading(true);

      // Buscar regiões de atendimento ativas
      const { data: regioes, error: regioesError } = await supabase
        .from('regioes_atendimento')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', true);

      if (regioesError) {
        console.error('Erro ao buscar regiões:', regioesError);
        return;
      }

      const totalRegions = regioes?.length || 0;
      const freeRegions = regioes?.filter(r => (r.valor || 0) === 0) || [];
      const freeRegionsCount = freeRegions.length;

      const hasDelivery = totalRegions > 0;
      const hasFreeDelivery = freeRegionsCount > 0;
      const allRegionsFree = hasDelivery && freeRegionsCount === totalRegions;
      const someRegionsFree = hasFreeDelivery && !allRegionsFree;

      setDeliveryStatus({
        hasDelivery,
        hasFreeDelivery,
        allRegionsFree,
        someRegionsFree,
        freeRegionsCount,
        totalRegionsCount: totalRegions,
      });

      console.log('🚚 [DELIVERY FREE] Status calculado via regiões:', {
        companyId,
        hasDelivery,
        hasFreeDelivery,
        allRegionsFree,
        someRegionsFree,
        freeRegionsCount,
        totalRegions,
        regioesData: regioes
      });

      // Log detalhado para debug
      console.log('🚚 [DELIVERY FREE] Debug detalhado:', {
        regioes: regioes?.map(r => ({ nome: r.nome || 'Sem nome', valor: r.valor, status: r.status })),
        freeRegions: regioes?.filter(r => (r.valor || 0) === 0),
        activeRegions: regioes?.filter(r => r.status === true)
      });

    } catch (error) {
      console.error('Erro ao carregar status de entrega grátis:', error);
      setDeliveryStatus({
        hasDelivery: false,
        hasFreeDelivery: false,
        allRegionsFree: false,
        someRegionsFree: false,
        freeRegionsCount: 0,
        totalRegionsCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    deliveryStatus,
    loading,
    refetch: loadDeliveryFreeStatus
  };
};