
import React from 'react';
import { PedidoCard } from './PedidoCard';
import { PedidoKDS } from '@/hooks/usePedidosRealTime';

interface KDSVerticalLayoutProps {
  pedidos: PedidoKDS[];
  onAvancarStatus: (id: number) => void;
  onVoltarStatus: (id: number) => void;
  columns: 1 | 2;
}

export const KDSVerticalLayout: React.FC<KDSVerticalLayoutProps> = ({
  pedidos,
  onAvancarStatus,
  onVoltarStatus,
  columns
}) => {
  // Dividir pedidos em colunas se necessário
  const dividePedidos = () => {
    if (columns === 1) {
      return [pedidos];
    }
    
    const meio = Math.ceil(pedidos.length / 2);
    return [
      pedidos.slice(0, meio),
      pedidos.slice(meio)
    ];
  };

  const colunasPedidos = dividePedidos();

  const getNextActionLabel = (status: string) => {
    if (status === 'analise') return 'Iniciar Produção';
    if (status === 'producao') return 'Finalizar';
    if (status === 'pronto') return 'Pronto';
    return 'Avançar';
  };

  const canGoBack = (status: string) => {
    return status !== 'analise';
  };

  if (pedidos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-lg">Nenhum pedido no momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <div className={`flex ${columns === 1 ? 'justify-center' : 'gap-6'} h-full`}>
        {colunasPedidos.map((colunaPedidos, colIndex) => (
          <div 
            key={colIndex} 
            className={`bg-white rounded-3xl border-4 border-blue-300 shadow-lg overflow-hidden flex flex-col ${
              columns === 1 ? 'w-full max-w-2xl' : 'flex-1'
            }`}
            style={{
              borderRadius: '2rem',
              minHeight: '500px'
            }}
          >
            {/* Header da coluna */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 text-center">
              <h3 className="text-lg font-bold">
                Coluna {colIndex + 1}
              </h3>
              <span className="text-sm opacity-90">
                {colunaPedidos.length} {colunaPedidos.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>
            
            {/* Conteúdo da coluna */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {colunaPedidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">Nenhum pedido</p>
                </div>
              ) : (
                colunaPedidos.map(pedido => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    onAvancar={onAvancarStatus}
                    onVoltar={onVoltarStatus}
                    canGoBack={canGoBack(pedido.status)}
                    canAdvance={true}
                    nextActionLabel={getNextActionLabel(pedido.status)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
