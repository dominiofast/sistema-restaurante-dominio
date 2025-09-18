import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CashbackCardAdaptive } from '@/components/cashback/CashbackCardAdaptive';
import { DeliveryFreeCard } from '@/components/delivery/DeliveryFreeCard';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';
import { useDeliveryFreeConfig } from '@/hooks/useDeliveryFreeConfig';

interface PromotionalCarouselProps {
  companyId: string;
  companySlug?: string;
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PromotionalCarousel: React.FC<PromotionalCarouselProps> = ({
  companyId,
  companySlug,
  variant = 'banner',
  className = ''
}) => {
  const { data: cashbackConfig, isLoading: cashbackLoading } = useCashbackConfig(companyId)
  const { deliveryStatus, loading: deliveryLoading } = useDeliveryFreeConfig(companyId)

  // Debug para ver status dos cards
  console.log('🎠 [PROMOTIONAL] Status dos cards:', {
    companyId,
    cashbackConfig: cashbackConfig?.is_active,
    cashbackLoading,
    deliveryStatus: {
      hasDelivery: deliveryStatus.hasDelivery,
      hasFreeDelivery: deliveryStatus.hasFreeDelivery,
      allRegionsFree: deliveryStatus.allRegionsFree,
      someRegionsFree: deliveryStatus.someRegionsFree,
      freeRegionsCount: deliveryStatus.freeRegionsCount,
      totalRegionsCount: deliveryStatus.totalRegionsCount
    },
    deliveryLoading,
    showCashback: cashbackConfig?.is_active && !cashbackLoading,
    showDeliveryFree: deliveryStatus.hasFreeDelivery && !deliveryLoading
  })
  console.log('🎠 [PROMOTIONAL CAROUSEL] Status:', {
    companyId,
    cashbackLoading,
    deliveryLoading,
    cashbackConfig,
    deliveryStatus,
    showCashback: cashbackConfig && cashbackConfig.is_active,
    showDeliveryFree: deliveryStatus.hasFreeDelivery
  })

  // Se ainda está carregando, não renderiza nada
  if (cashbackLoading || deliveryLoading) {
    console.log('🎠 [PROMOTIONAL CAROUSEL] Ainda carregando')
    return null;


  // Verificar quais cards devem ser mostrados
  const showCashback = cashbackConfig && cashbackConfig.is_active;
  const showDeliveryFree = deliveryStatus.hasFreeDelivery;

  console.log('🎠 [PROMOTIONAL CAROUSEL] Cards para mostrar:', {
    showCashback,
    showDeliveryFree
  })

  // Se não há nenhum card para mostrar, não renderiza
  if (!showCashback && !showDeliveryFree) {
    console.log('🎠 [PROMOTIONAL CAROUSEL] Nenhum card para mostrar')
    return null;


  // Se há apenas um card, mostra sem carrossel
  if ((showCashback && !showDeliveryFree) || (!showCashback && showDeliveryFree)) {
    console.log('🎠 [PROMOTIONAL CAROUSEL] Mostrando apenas um card')
    return (
      <div className={className}>
        {showCashback && (
          <CashbackCardAdaptive
            companyId={companyId}
            companySlug={companySlug}
            variant={variant}
          />
        )}
        {showDeliveryFree && (
          <DeliveryFreeCard
            companyId={companyId}
            companySlug={companySlug}
            variant={variant}
          />
        )}
      </div>
    )


  // Se há múltiplos cards, mostra com carrossel
  console.log('🎠 [PROMOTIONAL CAROUSEL] Mostrando carrossel com múltiplos cards')
  return (
    <div className={`w-full ${className}`}>
      <Carousel 
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {showCashback && (
            <CarouselItem>
              <CashbackCardAdaptive
                companyId={companyId}
                companySlug={companySlug}
                variant={variant}
              />
            </CarouselItem>
          )}
          {showDeliveryFree && (
            <CarouselItem>
              <DeliveryFreeCard
                companyId={companyId}
                companySlug={companySlug}
                variant={variant}
              />
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  )
};
