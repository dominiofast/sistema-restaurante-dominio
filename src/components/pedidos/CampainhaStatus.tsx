import React from 'react';
import { Bell, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CampainhaStatusProps {
  tocando: boolean;
  audioEnabled: boolean;
  notificationsEnabled: boolean;
  userInteracted: boolean;
  pedidosEmAnalise: number;
  onTest: () => void;
  onStop: () => void;
}

export const CampainhaStatus: React.FC<CampainhaStatusProps> = ({
  tocando,
  audioEnabled,
  notificationsEnabled,
  userInteracted,
  pedidosEmAnalise,
  onTest,
  onStop
}) => {
  const getStatusColor = () => {
    if (tocando) return 'text-red-500';
    if (audioEnabled && notificationsEnabled) return 'text-green-500';
    if (audioEnabled || notificationsEnabled) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    if (tocando) return 'Campainha Tocando';
    if (!userInteracted) return 'Clique em qualquer lugar para ativar';
    if (audioEnabled && notificationsEnabled) return 'Sistema Completo Ativo';
    if (audioEnabled) return 'Apenas Áudio Ativo';
    if (notificationsEnabled) return 'Apenas Notificações Ativas';
    return 'Sistema Inativo';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`relative ${getStatusColor()}`}>
            <Bell className={`h-5 w-5 ${tocando ? 'animate-bounce' : ''}`} />
            {tocando && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">Sistema de Campainha</span>
              <span className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-1">
                {audioEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
                <span>Áudio: {audioEnabled ? 'OK' : 'Inativo'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span>Notificações: {notificationsEnabled ? 'OK' : 'Negadas'}</span>
              </div>
              
              {pedidosEmAnalise > 0 && (
                <div className="flex items-center gap-1 text-orange-600 font-medium">
                  <span>{pedidosEmAnalise} pedido(s) em análise</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            disabled={!userInteracted}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Testar Som
          </Button>
          
          {tocando && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Parar
            </Button>
          )}
        </div>
      </div>
      
      {!userInteracted && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Para que a campainha funcione, você precisa interagir com a página primeiro (clicar em qualquer lugar).
            </span>
          </div>
        </div>
      )}
      
      {userInteracted && !audioEnabled && !notificationsEnabled && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Sistema de notificações não está funcionando. Verifique as permissões do navegador.
            </span>
          </div>
        </div>
      )}
    </div>
  )
};
