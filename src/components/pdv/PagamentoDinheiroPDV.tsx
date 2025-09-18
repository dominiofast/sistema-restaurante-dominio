import React, { useState } from 'react';

interface PagamentoDinheiroPDVProps {
  onConfirm: (dados: any) => void;
  total: number;
}

export const PagamentoDinheiroPDV: React.FC<PagamentoDinheiroPDVProps> = ({ 
  onConfirm, 
  total 
}) => {
  const [valorRecebido, setValorRecebido] = useState(total.toString());
  const [observacoes, setObservacoes] = useState('');

  const troco = parseFloat(valorRecebido || '0') - total;

  const handleConfirm = () => {
    onConfirm({
      tipo: 'dinheiro',
      valorRecebido: parseFloat(valorRecebido),
      troco: troco > 0 ? troco : 0,
      observacoes;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Pagamento em dinheiro</h3>
        <p className="text-gray-600">
          Informe o valor recebido do cliente
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total a pagar
          </label>
          <div className="text-2xl font-bold text-gray-900">
            R$ {total.toFixed(2)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor recebido
          </label>
          <input
            type="number"
            step="0.01"
            value={valorRecebido}
            onChange={(e) => setValorRecebido(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
            placeholder="0,00"
          />
        </div>

        {troco > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-800">Troco:</span>
              <span className="text-lg font-bold text-yellow-900">R$ {troco.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações (opcional)
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
            placeholder="Observações sobre o pagamento..."
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={parseFloat(valorRecebido || '0') < total}
        >
          <span className="font-mono text-xs mr-2">[ENTER]</span>
          Confirmar pagamento
        </button>
      </div>
    </div>
  );
};