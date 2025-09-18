/**
 * Component for displaying delivery methods loading states and status messages
 */

import React from 'react';
import { DeliveryMethodsConfig } from '@/utils/deliveryMethodsFallback';

interface DeliveryMethodsStatusProps {
  isLoading: boolean;
  isRetrying: boolean;
  error: Error | null;
  deliveryMethods: DeliveryMethodsConfig | null;
  companyName?: string;
  primaryColor: string;
  onRetry?: () => void;
}

export const DeliveryMethodsStatus: React.FC<DeliveryMethodsStatusProps> = ({
  isLoading,
  isRetrying,
  error,
  deliveryMethods,
  companyName,
  primaryColor,
  onRetry
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
        <span className="ml-2 text-gray-600">
          {isRetrying ? (
            <>
              <span className="font-medium">Tentando novamente...</span>
              <br />
              <span className="text-xs text-gray-500">Verificando opções de entrega</span>
            </>
          ) : (
            <>
              <span className="font-medium">Carregando opções de entrega...</span>
              <br />
              <span className="text-xs text-gray-500">Configurando {companyName}</span>
            </>
          )}
        </span>
      </div>
    );


  // Error state
  if (error && !deliveryMethods) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-red-500 text-xl flex-shrink-0">⚠️</div>
          <div className="flex-1">
            <p className="text-red-800 text-sm font-medium mb-1">
              Problema ao carregar opções de entrega
            </p>
            <p className="text-red-700 text-xs mb-3">
              Não conseguimos carregar as configurações de entrega para {companyName}. 
              Isso pode ser um problema temporário de conexão.
            </p>
            <div className="flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded transition-colors font-medium"
                >
                  Tentar novamente
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded transition-colors border border-red-200"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      </div>
    );


  // Success states with different sources
  if (deliveryMethods) {
    switch (deliveryMethods.source) {
      case 'fallback':
        return (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 text-sm flex-shrink-0">ℹ️</div>
              <div className="flex-1">
                <p className="text-yellow-800 text-xs font-medium mb-1">
                  Usando configurações temporárias
                </p>
                <p className="text-yellow-700 text-xs">
                  Aplicamos configurações padrão para {companyName}. 
                  Se houver problemas, entre em contato conosco.
                </p>
              </div>
            </div>
          </div>
        );

      case 'auto-created':
        return (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-sm flex-shrink-0">✨</div>
              <div className="flex-1">
                <p className="text-blue-800 text-xs font-medium mb-1">
                  Configurações criadas automaticamente
                </p>
                <p className="text-blue-700 text-xs">
                  Configuramos as opções de entrega para {companyName} baseado nas suas preferências.
                </p>
              </div>
            </div>
          </div>
        );

      case 'database':
        // No message for normal database load - this is the expected behavior
        return null;

      default:
        return null;



  return null;
};

/**
 * Component for displaying when no delivery options are available
 */
export const NoDeliveryOptionsMessage: React.FC<{
  companyName?: string;
  onContactSupport?: () => void;
}> = ({ companyName, onContactSupport }) => {
  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
      <div className="text-gray-400 text-4xl mb-3">📦</div>
      <h3 className="text-gray-800 font-medium mb-2">
        Nenhuma opção de entrega disponível
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        {companyName} não tem opções de entrega configuradas no momento.
      </p>
      <div className="space-y-2">
        <p className="text-gray-500 text-xs">
          Entre em contato conosco para mais informações:
        </p>
        {onContactSupport ? (
          <button
            onClick={onContactSupport}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
          >
            Falar com o suporte
          </button>
        ) : (
          <p className="text-gray-500 text-xs">
            Tente novamente mais tarde ou entre em contato diretamente com {companyName}.
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Component for displaying delivery options summary
 */
export const DeliveryOptionsSummary: React.FC<{
  deliveryMethods: DeliveryMethodsConfig;
  companyName?: string;
}> = ({ deliveryMethods, companyName }) => {
  const options = [];
  
  if (deliveryMethods.delivery) options.push('📦 Entrega');
  if (deliveryMethods.pickup) options.push('🏪 Retirada');
  if (deliveryMethods.eat_in) options.push('🍽️ Consumo no local');

  if (options.length === 0) {
    return null;


  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
      <div className="flex items-start gap-2">
        <div className="text-green-600 text-sm flex-shrink-0">✅</div>
        <div className="flex-1">
          <p className="text-green-800 text-xs font-medium mb-1">
            Opções disponíveis em {companyName}
          </p>
          <p className="text-green-700 text-xs">
            {options.join(' • ')}
          </p>
        </div>
      </div>
    </div>
  );
};