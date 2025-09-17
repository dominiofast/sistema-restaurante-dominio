import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PagamentoTabsPDV } from './PagamentoTabsPDV';
import { PagamentoDinheiroPDV } from './PagamentoDinheiroPDV';
import { PagamentoCartaoPDV } from './PagamentoCartaoPDV';
import { PagamentoPixPDV } from './PagamentoPixPDV';

interface PagamentoModalSimplesPDVProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formaPagamento: string, dados?: any) => void;
  total: number;
}

export const PagamentoModalSimplesPDV: React.FC<PagamentoModalSimplesPDVProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  total
}) => {
  const [tab, setTab] = useState<'dinheiro'|'cartao'|'pix'>('dinheiro');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative animate-scale-in max-h-[85vh] flex flex-col border border-gray-200">
        {/* Header com estilo do PDV */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800">Forma de pagamento</h2>
            <div className="text-sm text-gray-500">
              Total: <span className="font-semibold text-green-600">R$ {total.toFixed(2)}</span>
            </div>
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
        <PagamentoTabsPDV tab={tab} setTab={setTab} />
        
        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                {tab === 'dinheiro' && (
                  <PagamentoDinheiroPDV 
                    onConfirm={(dados) => onConfirm('dinheiro', dados)} 
                    total={total}
                  />
                )}
                {tab === 'cartao' && (
                  <PagamentoCartaoPDV 
                    onConfirm={(dados) => onConfirm('cartao', dados)} 
                    total={total}
                  />
                )}
                {tab === 'pix' && (
                  <PagamentoPixPDV 
                    onConfirm={(dados) => onConfirm('pix', dados)} 
                    total={total}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};