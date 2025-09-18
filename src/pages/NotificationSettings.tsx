import React from 'react';
import { WhatsAppNotificationSettings } from '@/components/whatsapp/WhatsAppNotificationSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Bell } from 'lucide-react';

/**
 * Página de exemplo para configurações de notificações
 * Este componente pode ser integrado em qualquer página de configurações
 */
export const NotificationSettings: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações de Notificações</h1>
          <p className="text-gray-600">Gerencie como você recebe notificações do sistema</p>
        </div>
      </div>

      {/* Grid de configurações */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* WhatsApp Notifications */}
        <WhatsAppNotificationSettings />

        {/* Outras configurações podem ser adicionadas aqui */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg">Outras Notificações</CardTitle>
            </div>
            <CardDescription>
              Configure outros tipos de notificações do sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="text-sm text-gray-500">
              Configurações adicionais podem ser adicionadas aqui, como:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Notificações de pedidos</li>
                <li>Alertas de estoque</li>
                <li>Notificações de sistema</li>
                <li>E-mail notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como Funcionam as Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Aba Ativa</h4>
              <p className="text-sm text-gray-600">
                Quando você está usando o sistema, aparece um popup elegante 
                no topo da tela com a mensagem recebida.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">🔔 Aba Inativa</h4>
              <p className="text-sm text-gray-600">
                Quando está em outra aba ou aplicativo, mostra notificação do sistema 
                (com permissão) ou popup quando voltar ao sistema.
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>📌 Importante:</strong> Sempre mostra apenas uma notificação por mensagem - 
              nunca duplicatas ou spam de notificações.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  )
};

export default NotificationSettings;
