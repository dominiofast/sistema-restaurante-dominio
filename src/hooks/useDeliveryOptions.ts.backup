import { useQuery } from '@tanstack/react-query';
import { deliveryOptionsService, DeliveryOptions } from '@/services/deliveryOptionsService';

export const useDeliveryOptions = (companyId: string) => {
  return useQuery({
    queryKey: ['delivery-options', companyId],
    queryFn: () => deliveryOptionsService.getDeliveryOptions(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    retryDelay: 1000,
  });
};