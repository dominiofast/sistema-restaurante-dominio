import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicBrandingNew } from '@/hooks/usePublicBrandingNew';
import { useCardapioData } from '@/hooks/useCardapioData';
import { useAutoatendimentoSession } from '@/hooks/useAutoatendimentoSession';
import { AutoatendimentoWelcome } from '@/components/autoatendimento/AutoatendimentoWelcome';
import { AutoatendimentoCardapio } from '@/components/autoatendimento/AutoatendimentoCardapio';
import { AutoatendimentoCarrinho } from '@/components/autoatendimento/AutoatendimentoCarrinho';
import { AutoatendimentoCheckout } from '@/components/autoatendimento/AutoatendimentoCheckout';
import { AutoatendimentoSuccess } from '@/components/autoatendimento/AutoatendimentoSuccess';
import { AutoatendimentoHeader } from '@/components/autoatendimento/AutoatendimentoHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import '@/styles/tablet-optimizations.css';

type AutoatendimentoStep = 'welcome' | 'cardapio' | 'carrinho' | 'checkout' | 'success';

const AutoatendimentoTablet: React.FC = () => {
  const navigate = useNavigate();
  const { company_slug } = useParams();
  const [currentStep, setCurrentStep] = useState<AutoatendimentoStep>('welcome');

  console.log('🖥️ AutoatendimentoTablet - Parâmetros da URL:', { company_slug });

  // Hooks para dados
  const { branding, loading: brandingLoading, error: brandingError } = usePublicBrandingNew(company_slug);
  const effectiveCompanyId = branding?.company_id;
  const { categorias, produtos, loading: dataLoading, error: dataError } = useCardapioData(effectiveCompanyId);
  
  // Hook para sessão de autoatendimento
  const {
    session,
    isLoading: sessionLoading,
    createSession,
    updateSession,
    completeSession,
    timeLeft
  } = useAutoatendimentoSession(effectiveCompanyId);

  // Efeito para timeout automático
  useEffect(() => {
    if (timeLeft === 0 && currentStep !== 'welcome') {
      setCurrentStep('welcome');
    }
  }, [timeLeft, currentStep]);

  // Função para iniciar sessão
  const handleStartSession = async () => {
    console.log('🚀 AutoatendimentoTablet - handleStartSession chamado');
    console.log('🏢 AutoatendimentoTablet - effectiveCompanyId:', effectiveCompanyId);
    
    try {
      const sessionId = await createSession();
      console.log('📝 AutoatendimentoTablet - Sessão criada:', sessionId);
      
      if (sessionId) {
        console.log('✅ AutoatendimentoTablet - Mudando para step cardapio');
        setCurrentStep('cardapio');
      } else {
        console.log('❌ AutoatendimentoTablet - Falha ao criar sessão');
      }
    } catch (error) {
      console.error('💥 AutoatendimentoTablet - Erro ao criar sessão:', error);
    }
  };

  // Função para navegar entre etapas
  const handleStepChange = (step: AutoatendimentoStep) => {
    setCurrentStep(step);
  };

  // Função para finalizar pedido
  const handleCompleteOrder = async (orderData: any) => {
    const success = await completeSession(orderData);
    if (success) {
      setCurrentStep('success');
      // Auto-reset após 10 segundos
      setTimeout(() => {
        setCurrentStep('welcome');
      }, 10000);
    }
  };

  // Estados de loading e erro
  if (brandingLoading || dataLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <div className="text-xl font-medium text-muted-foreground tablet-text">Carregando sistema de autoatendimento...</div>
        </div>
      </div>
    );
  }

  if (brandingError || dataError || !effectiveCompanyId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Alert className="max-w-md tablet-card" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="tablet-text">
            Sistema de autoatendimento indisponível. Entre em contato com a loja.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Configurações de branding
  const primaryColor = branding?.primary_color || '#3B82F6';
  const backgroundColor = branding?.background_color || '#FFFFFF';
  const textColor = branding?.text_color || '#1F2937';
  const companyName = branding?.company_name || 'Loja';

  return (
    <div 
      className="min-h-screen kiosk-mode tablet-optimized" 
      style={{ 
        backgroundColor,
        color: textColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header sempre visível exceto no welcome */}
      {currentStep !== 'welcome' && (
        <AutoatendimentoHeader
          companyName={companyName}
          branding={branding}
          timeLeft={timeLeft}
          onReset={() => setCurrentStep('welcome')}
          primaryColor={primaryColor}
        />
      )}

      {/* Conteúdo principal */}
      <div className={`${currentStep !== 'welcome' ? 'pt-20' : ''} h-full`}>
        {currentStep === 'welcome' && (
          <AutoatendimentoWelcome
            companyName={companyName}
            branding={branding}
            onStart={handleStartSession}
            primaryColor={primaryColor}
          />
        )}

        {currentStep === 'cardapio' && (
          <AutoatendimentoCardapio
            categorias={categorias.map(cat => ({ ...cat, company_id: effectiveCompanyId }))}
            produtos={produtos}
            branding={branding}
            onNext={() => handleStepChange('carrinho')}
            primaryColor={primaryColor}
          />
        )}

        {currentStep === 'carrinho' && (
          <AutoatendimentoCarrinho
            onBack={() => handleStepChange('cardapio')}
            onNext={() => handleStepChange('checkout')}
            primaryColor={primaryColor}
          />
        )}

        {currentStep === 'checkout' && (
          <AutoatendimentoCheckout
            companyId={effectiveCompanyId}
            onBack={() => handleStepChange('carrinho')}
            onComplete={handleCompleteOrder}
            primaryColor={primaryColor}
          />
        )}

        {currentStep === 'success' && (
          <AutoatendimentoSuccess
            companyName={companyName}
            primaryColor={primaryColor}
          />
        )}
      </div>

      {/* CSS para modo kiosk */}
      <style>{`
        .kiosk-mode {
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .kiosk-mode * {
          -webkit-touch-callout: none;
          -webkit-text-size-adjust: none;
        }

        /* Otimizações específicas para tablets */
        .tablet-optimized {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .tablet-optimized * {
          touch-action: manipulation;
        }

        /* Melhorar feedback de toque */
        .tablet-optimized button,
        .tablet-optimized [role="button"] {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .tablet-optimized button:active,
        .tablet-optimized [role="button"]:active {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }

        /* Otimizar scroll para tablets */
        .tablet-optimized .overflow-y-auto,
        .tablet-optimized .overflow-x-auto {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        /* Melhorar contraste para tablets */
        .tablet-optimized {
          color-scheme: light;
        }

        /* Otimizar animações para tablets */
        .tablet-optimized * {
          will-change: auto;
        }

        .tablet-optimized .animate-spin,
        .tablet-optimized .hover\\:scale-105:hover {
          will-change: transform;
        }

        /* Ajustar layout para header e footer fixos */
        .tablet-optimized .pt-20 {
          padding-top: 80px;
        }

        /* Garantir que o conteúdo não fique sobreposto */
        .tablet-optimized .h-screen {
          height: 100vh;
          overflow: hidden;
        }

        /* Ajustar z-index para elementos fixos */
        .tablet-optimized .fixed {
          z-index: 50;
        }

        .tablet-optimized .z-40 {
          z-index: 40;
        }
      `}</style>
    </div>
  );
};

export default AutoatendimentoTablet;