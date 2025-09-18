
import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface PedidosDashboardStatesProps {
  loading: boolean;
  error: string | null;
  companyId?: string;
  reloadPedidos: () => void;
}

export const PedidosDashboardStates: React.FC<PedidosDashboardStatesProps> = ({
  loading,
  error,
  companyId,
  reloadPedidos
}) => {
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-4 text-lg text-blue-700 font-semibold">Carregando pedidos...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <span className="text-lg text-red-700 font-semibold mb-2">Erro ao carregar pedidos</span>
        <span className="text-gray-700 mb-4">{error}</span>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recarregar Página
          </button>
          <button 
            onClick={reloadPedidos} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar Pedidos
          </button>
        </div>
      </div>
    )
  }

  if (!companyId) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white">
        <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
        <span className="text-lg text-yellow-700 font-semibold mb-2">Nenhuma empresa selecionada</span>
        <span className="text-gray-700">Selecione uma empresa para visualizar os pedidos</span>
      </div>
    )
  }

  return null;
};
