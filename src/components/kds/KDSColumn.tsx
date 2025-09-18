
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PedidoCard } from './PedidoCard';
import { PedidoKDS } from '@/hooks/usePedidosRealTime';

interface StatusConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  lightColor: string;
  borderColor: string;
  textColor: string;
  gradient: string;
}

interface KDSColumnProps {
  status: StatusConfig;
  pedidos: PedidoKDS[];
  onAvancarStatus: (id: number) => void;
  onVoltarStatus: (id: number) => void;
  isFirstStatus: boolean;
  isLastStatus: boolean;
}

export const KDSColumn: React.FC<KDSColumnProps> = ({
  status,
  pedidos,
  onAvancarStatus,
  onVoltarStatus,
  isFirstStatus,
  isLastStatus
}) => {
  const Icon = status.icon;

  const getNextActionLabel = () => {
    if (status.key === 'analise') return 'Iniciar Produção';
    if (status.key === 'producao') return 'Finalizar';
    if (status.key === 'pronto') return 'Pronto';
    return 'Avançar';
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden transition-all flex flex-col h-full">
      {/* Header da coluna */}
      <div className={`bg-gradient-to-r ${status.gradient} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="text-white" size={24} />
            <h2 className="text-lg font-bold text-white">{status.label}</h2>
          </div>
          <span className="bg-white bg-opacity-30 text-white px-3 py-1 rounded-full text-sm font-bold">
            {pedidos.length}
          </span>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
            <Icon size={48} className="mb-2" />
            <p className="text-sm">Nenhum pedido</p>
          </div>
        ) : (
          pedidos.map(pedido => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onAvancar={onAvancarStatus}
              onVoltar={onVoltarStatus}
              canGoBack={!isFirstStatus}
              canAdvance={true}
              nextActionLabel={getNextActionLabel()}
            />
          ))
        )}
      </div>
    </div>
  )
};
