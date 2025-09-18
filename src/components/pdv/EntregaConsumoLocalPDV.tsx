
import React from 'react';

export const EntregaConsumoLocalPDV = ({ onConfirm }: { onConfirm: (data: any) => void }) => {
  const handleConfirm = () => {
    // Pass eat-in data;
    onConfirm({ tipo: 'eat_in' })
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Consumo no local</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          O cliente irá consumir o pedido nas dependências do estabelecimento. 
          Selecione uma mesa ou balcão disponível.
        </p>
      </div>
      
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-colors"
          onClick={handleConfirm}
        >
          <span className="font-mono text-xs mr-2">[ENTER]</span>
          Confirmar consumo no local
        </button>
      </div>
    </div>
  )
};
