import React from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, Clock, CreditCard } from 'lucide-react';

interface AutoatendimentoWelcomeProps {
  companyName: string;
  branding?: any;
  onStart: () => void;
  primaryColor: string;
}

export const AutoatendimentoWelcome: React.FC<AutoatendimentoWelcomeProps> = ({
  companyName,
  branding,
  onStart,
  primaryColor
}) => {
  const welcomeMessage = branding?.additional_settings?.welcome_message || ;
    'Bem-vindo! Faça seu pedido de forma rápida e fácil.';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - otimizada para tablets */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12">
        <div className="text-center w-full max-w-4xl">
          {/* Logo/Nome da empresa */}
          <div className="mb-8 md:mb-12">
            {branding?.logo_url ? (
              <img 
                src={branding.logo_url} 
                alt={companyName}
                className="h-20 md:h-24 lg:h-32 mx-auto mb-4 md:mb-6"
              />
            ) : (
              <div className="mb-4 md:mb-6">
                <Utensils 
                  className="mx-auto mb-3 md:mb-4 h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24"
                  style={{ color: primaryColor }}
                />
              </div>
            )}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight"
              style={{ color: primaryColor }}
            >
              {companyName}
            </h1>
          </div>

          {/* Mensagem de boas-vindas */}
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-8 md:mb-12 leading-relaxed px-4">
            {welcomeMessage}
          </p>

          {/* Botão principal - otimizado para tablets */}
          <Button
            onClick={() => {
              console.log('🖱️ AutoatendimentoWelcome - Botão Fazer Pedido clicado');
              onStart();
            }}
            className="h-16 md:h-20 lg:h-24 px-8 md:px-12 lg:px-16 text-lg md:text-xl lg:text-2xl font-semibold rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-md mx-auto"
            style={{ 
              backgroundColor: primaryColor,
              color: 'white'
            }}
          >
            <Utensils className="mr-3 md:mr-4 h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
            Fazer Pedido
          </Button>

          {/* Recursos destacados - otimizados para tablets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16 max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <Utensils className="h-8 w-8 md:h-10 md:w-10" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Cardápio Completo</h3>
              <p className="text-base md:text-lg text-muted-foreground">Veja todos os nossos pratos e bebidas</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 md:h-10 md:w-10" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Pedido Rápido</h3>
              <p className="text-base md:text-lg text-muted-foreground">Processo otimizado e intuitivo</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 md:h-10 md:w-10" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Pagamento Seguro</h3>
              <p className="text-base md:text-lg text-muted-foreground">PIX, cartão ou dinheiro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 md:p-8 text-center border-t">
        <p className="text-base md:text-lg text-muted-foreground">
          Toque na tela para começar seu pedido
        </p>
      </div>
    </div>
  );
};