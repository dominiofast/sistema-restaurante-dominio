import React, { useState } from 'react';

interface PagamentoCartaoPDVProps {
  onConfirm: (dados: any) => void;
  total: number;
}

export const PagamentoCartaoPDV: React.FC<PagamentoCartaoPDVProps> = ({ 
  onConfirm, 
  total 
}) => {
  const [tipoCartao, setTipoCartao] = useState<'credito'|'debito'>('debito')
  const [bandeira, setBandeira] = useState('')
  const [parcelas, setParcelas] = useState(1)
  const [observacoes, setObservacoes] = useState('')

  const handleConfirm = () => {
    onConfirm({
      tipo: 'cartao',
      tipoCartao,
      bandeira,
      parcelas,
      observacoes;
    })
  };

  const bandeiras = [
    'Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros';
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Pagamento no cartão</h3>
        <p className="text-gray-600">
          Configure os dados da transação
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
            Tipo de cartão
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTipoCartao('debito')}
              className={`p-3 rounded-lg border transition-colors ${
                tipoCartao === 'debito'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Débito
            </button>
            <button
              onClick={() => setTipoCartao('credito')}
              className={`p-3 rounded-lg border transition-colors ${
                tipoCartao === 'credito'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Crédito
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bandeira do cartão
          </label>
          <select
            value={bandeira}
            onChange={(e) => setBandeira(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione a bandeira</option>
            {bandeiras.map(band => (
              <option key={band} value={band}>{band}</option>
            ))}
          </select>
        </div>

        {tipoCartao === 'credito' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de parcelas
            </label>
            <select
              value={parcelas}
              onChange={(e) => setParcelas(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array
                <option key={num} value={num}>
                  {num}x de R$ {(total / num).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações (opcional)
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Observações sobre o pagamento..."
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={!bandeira}
        >
          <span className="font-mono text-xs mr-2">[ENTER]</span>
          Confirmar pagamento
        </button>
      </div>
    </div>
  )
};
