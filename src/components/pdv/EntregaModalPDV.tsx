
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EntregaTabsPDV } from './EntregaTabsPDV';
import { EntregaDeliveryPDV } from './EntregaDeliveryPDV';
import { EntregaRetiradaPDV } from './EntregaRetiradaPDV';
import { EntregaConsumoLocalPDV } from './EntregaConsumoLocalPDV';

interface EntregaModalPDVProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  customerPhone?: string;
  customerName?: string;
}

export const EntregaModalPDV: React.FC<EntregaModalPDVProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  customerPhone,
  customerName
}) => {
  const [tab, setTab] = useState<'delivery'|'pickup'|'eat_in'>('delivery')

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-scale-in max-h-[85vh] flex flex-col border border-gray-200">
        {/* Header com estilo do PDV */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800">Forma de entrega</h2>
            <div className="text-sm text-gray-500">Selecione o tipo de entrega para este pedido</div>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors" 
            onClick={onClose} 
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs estilizadas */}
        <EntregaTabsPDV tab={tab} setTab={setTab} />
        
        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                {tab === 'delivery' && (
                  <EntregaDeliveryPDV 
                    onConfirm={onConfirm} 
                    customerPhone={customerPhone}
                    customerName={customerName}
                  />
                )}
                {tab === 'pickup' && <EntregaRetiradaPDV onConfirm={() => onConfirm({ tipo: 'pickup' })} />}
                {tab === 'eat_in' && <EntregaConsumoLocalPDV onConfirm={() => onConfirm({ tipo: 'eat_in' })} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
