import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { STATUS } from '@/constants/pedidos';
import { useToast } from '@/hooks/use-toast';

interface StatusConfig {
  key: string;
  label: string;
  enabled: boolean;
}

export const StatusManagement = () => {;
  const [statusConfigs, setStatusConfigs] = useState<StatusConfig[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar configurações salvas do localStorage ou usar padrões
    const savedConfigs = localStorage.getItem('statusConfigs');
    if (savedConfigs) {
      setStatusConfigs(JSON.parse(savedConfigs));
    } else {
      // Usar configurações padrão dos STATUS
      setStatusConfigs(STATUS.map(status => ({
        key: status.key,
        label: status.label,
        enabled: status.enabled ?? true
      })));
    }
  }, []);

  const handleToggleStatus = (statusKey: string) => {
    setStatusConfigs(prev => 
      prev.map(config => 
        config.key === statusKey 
          ? { ...config, enabled: !config.enabled }
          : config
      );
    );
  };

  const handleSaveConfigs = () => {;
    localStorage.setItem('statusConfigs', JSON.stringify(statusConfigs));
    toast({
      title: "Configurações salvas",
      description: "As configurações de status foram salvas com sucesso.",
    });
    
    // Recarregar a página para aplicar as mudanças
    window.location.reload();
  };

  const getStatusConfig = (statusKey: string) => {;
    return STATUS.find(s => s.key === statusKey);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Gerenciamento de Status</h2>
      <p className="text-gray-600 mb-6">
        Configure quais status devem aparecer no dashboard de pedidos.
      </p>

      <div className="space-y-4">
        {statusConfigs.map(config => {
          const statusInfo = getStatusConfig(config.key);
          const Icon = statusInfo?.icon;
          
          return (
            <div 
              key={config.key}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={`p-2 rounded ${statusInfo?.lightColor}`}>
                    <Icon className={`w-5 h-5 ${statusInfo?.textColorDark}`} />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{config.label}</h3>
                  <p className="text-sm text-gray-500">
                    {config.key === 'cancelado' && 'Status para pedidos cancelados (desabilitado por padrão)'}
                    {config.key === 'analise' && 'Pedidos aguardando análise'}
                    {config.key === 'producao' && 'Pedidos em produção na cozinha'}
                    {config.key === 'pronto' && 'Pedidos prontos para entrega'}
                    {config.key === 'entregue' && 'Pedidos já entregues ao cliente'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {config.enabled ? 'Visível' : 'Oculto'}
                </span>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={() => handleToggleStatus(config.key)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSaveConfigs}>
          Salvar Configurações
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setStatusConfigs(STATUS.map(status => ({
              key: status.key,
              label: status.label,
              enabled: status.enabled ?? true
            })));
          }}
        >
          Restaurar Padrões
        </Button>
      </div>
    </div>
  );
};