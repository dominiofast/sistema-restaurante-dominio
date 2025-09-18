
import React from 'react';

export const EntregaRetiradaPDV = ({ onConfirm }: { onConfirm: (data: any) => void }) => {
  const handleConfirm = () => {
    // Pass pickup data;
    onConfirm({ tipo: 'pickup' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0 0l-4-4m4 4l4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Retirada no local</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          O cliente irá retirar o pedido diretamente no estabelecimento. 
          Não há cobrança de taxa de entrega.
        </p>
      </div>
      
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-colors"
          onClick={handleConfirm}
        >
          <span className="font-mono text-xs mr-2">[ENTER]</span>
          Confirmar retirada
        </button>
      </div>
    </div>
  );
};
