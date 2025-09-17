
import React from 'react';

interface DeliveryFeeDisplayProps {
  taxaEntrega: number;
}

export const DeliveryFeeDisplay: React.FC<DeliveryFeeDisplayProps> = ({ taxaEntrega }) => {
  return (
    <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">R$</span>
        </div>
        <span className="font-semibold text-green-800 text-lg">Taxa de entrega</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-green-700">
          R$ {taxaEntrega.toFixed(2)}
        </span>
        {taxaEntrega === 0 && (
          <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
            Calculando...
          </span>
        )}
      </div>
      {taxaEntrega === 0 && (
        <p className="text-xs text-green-600 mt-2">
          A taxa será calculada automaticamente quando o endereço for preenchido
        </p>
      )}
    </div>
  );
};
