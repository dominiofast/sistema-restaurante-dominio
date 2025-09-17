import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PagamentoModalPDVProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pagamento: any) => Promise<void>;
  companyId: string;
  subtotal: number;
  total: number;
}

export const PagamentoModalPDV: React.FC<PagamentoModalPDVProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  companyId,
  subtotal,
  total
}) => {
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [valorRecebido, setValorRecebido] = useState(total.toString());
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm({
        tipo: formaPagamento,
        valor: total,
        valorRecebido: parseFloat(valorRecebido),
        troco: parseFloat(valorRecebido) - total
      });
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-scale-in">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Pagamento</h2>
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors" 
            onClick={onClose} 
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total: R$ {total.toFixed(2)}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de pagamento
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="pix">PIX</option>
            </select>
          </div>

          {formaPagamento === 'dinheiro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor recebido
              </label>
              <input
                type="number"
                step="0.01"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {parseFloat(valorRecebido) > total && (
                <div className="mt-2 text-sm text-green-600">
                  Troco: R$ {(parseFloat(valorRecebido) - total).toFixed(2)}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (formaPagamento === 'dinheiro' && parseFloat(valorRecebido) < total)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};