import React from 'react';
import { Bell, BellOff, Shield, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';
import { useGlobalWhatsAppNotification } from '@/contexts/GlobalWhatsAppNotificationContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const WhatsAppNotificationSettings: React.FC = () => {
  const { 
    isEnabled, 
    setEnabled, 
    browserNotificationPermission, 
    requestNotificationPermission 
  } = useGlobalWhatsAppNotification();

  const getPermissionIcon = () => {
    switch (browserNotificationPermission) {
      case 'granted':
        return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <ShieldX className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPermissionBadge = () => {
    switch (browserNotificationPermission) {
      case 'granted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Autorizada</Badge>;
      case 'denied':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Negada</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <Bell className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <CardTitle className="text-lg">Notificações WhatsApp</CardTitle>
        </div>
        <CardDescription>
          Receba notificações em todas as páginas quando chegarem mensagens no WhatsApp
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Switch principal */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="whatsapp-notifications" className="text-sm font-medium">
              Notificações Globais
            </Label>
            <p className="text-xs text-gray-500">
              {isEnabled 
                ? 'Você receberá popups quando chegarem mensagens'
                : 'Notificações desativadas'
              }
            </p>
          </div>
          
          <Switch
            id="whatsapp-notifications"
            checked={isEnabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-green-500"
          />
        </div>

        {/* Status da permissão do navegador */}
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getPermissionIcon()}
              <span className="text-sm font-medium">Permissão do Navegador</span>
            </div>
            {getPermissionBadge()}
          </div>
          
          <p className="text-xs text-gray-600 mb-3">
            {browserNotificationPermission === 'granted' && 
              'Notificações do sistema quando a aba estiver inativa, popups quando ativa.'
            }
            {browserNotificationPermission === 'denied' && 
              'Apenas popups serão exibidos. Para notificações do sistema, autorize nas configurações do navegador.'
            }
            {browserNotificationPermission === 'default' && 
              'Autorize para receber notificações do sistema quando a aba estiver inativa.'
            }
          </p>

          {browserNotificationPermission === 'default' && (
            <Button 
              onClick={handleRequestPermission}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Autorizar Notificações do Sistema
            </Button>
          )}

          {browserNotificationPermission === 'denied' && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700">
                Para reabilitar, clique no ícone 🔒 na barra de endereços e altere a permissão para "Permitir"
              </p>
            </div>
          )}
        </div>
        
        {/* Informações quando ativado */}
        {isEnabled && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <p className="font-medium">Notificações Ativadas</p>
                <div className="text-xs mt-1 space-y-1">
                  <p>✅ Popups quando aba ativa</p>
                  <p>
                    {browserNotificationPermission === 'granted' 
                      ? '✅ Notificações do sistema quando aba inativa'
                      : '⚠️ Popups também quando aba inativa (sem autorização do navegador)'
                    }
                  </p>
                  <p>✅ Apenas uma notificação por mensagem</p>
                  <p>✅ Clique para ir direto ao chat</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
