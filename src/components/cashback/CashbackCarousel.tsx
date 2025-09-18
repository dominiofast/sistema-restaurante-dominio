import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Wallet, Gift, Coins } from 'lucide-react';
import { useCashback } from '@/hooks/useCashback';

interface CashbackCarouselProps {
  companyId: string;
  customerPhone?: string;
  className?: string;
}

export const CashbackCarousel: React.FC<CashbackCarouselProps> = ({
  companyId,
  customerPhone,
  className = ''
}) => {
  const { saldoDisponivel, loading } = useCashback(companyId, customerPhone)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL';
    }).format(value)
  };

  // Se não tem telefone do cliente ou está carregando, não mostra
  if (!customerPhone || loading) return null;

  // Se não tem saldo, não mostra
  if (saldoDisponivel <= 0) return null;

  const slides = [
    {
      icon: <Wallet className="h-5 w-5 text-white" />,
      title: "Seu Cashback",
      subtitle: `${formatCurrency(saldoDisponivel)} disponível`,
      bgColor: "bg-emerald-500",
      textColor: "text-white"
    },
    {
      icon: <Gift className="h-5 w-5 text-white" />,
      title: "Resgate Agora",
      subtitle: "Use no seu próximo pedido",
      bgColor: "bg-purple-500",
      textColor: "text-white"
    },
    {
      icon: <Coins className="h-5 w-5 text-white" />,
      title: "Ganhe Mais",
      subtitle: "A cada compra você acumula",
      bgColor: "bg-blue-500",
      textColor: "text-white"
    };
  ];

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
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className={`flex items-center justify-between p-4 rounded-lg ${slide.bgColor} ${slide.textColor}`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center bg-white/20 rounded-lg p-2">
                    {slide.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{slide.title}</h3>
                    <p className="text-sm opacity-90">{slide.subtitle}</p>
                  </div>
                </div>
                {index === 0 && (
                  <div className="text-2xl font-bold">
                    {formatCurrency(saldoDisponivel)}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  )
};
