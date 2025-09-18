
import React from 'react';

interface ResumoPagamentoPDVProps {
  subtotal: number;
  taxaEntrega?: number;
  total: number;
  troco?: number;
}

export const ResumoPagamentoPDV: React.FC<ResumoPagamentoPDVProps> = ({
  subtotal,
  taxaEntrega = 0,
  total,
  troco = 0
}) => {
  return (
    <div className="w-80 bg-gray-50 p-4 rounded-lg">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        
        {taxaEntrega > 0 && (
          <div className="flex justify-between text-sm">
            <span>Taxa de entrega</span>
            <span>R$ {taxaEntrega.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        
        {troco > 0 && (
          <div className="flex justify-between text-red-600 font-medium bg-red-50 p-2 rounded">
            <span>Falta</span>
            <span>R$ {troco.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
};
