import React, { useState } from 'react';

interface PagamentoPixPDVProps {
  onConfirm: (dados: any) => void;
  total: number;
}

export const PagamentoPixPDV: React.FC<PagamentoPixPDVProps> = ({ 
  onConfirm, 
  total 
}) => {
  const [chavePix, setChavePix] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleConfirm = () => {
    onConfirm({
      tipo: 'pix',
      chavePix,
      observacoes;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Pagamento PIX</h3>
        <p className="text-gray-600">
          Transferência instantânea via PIX
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

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-2">Instruções para o cliente:</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Abra o app do seu banco</li>
            <li>• Acesse a área PIX</li>
            <li>• Escaneie o QR Code ou copie a chave PIX</li>
            <li>• Confirme o pagamento</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chave PIX do estabelecimento
          </label>
          <input
            type="text"
            value={chavePix}
            onChange={(e) => setChavePix(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Digite a chave PIX (CPF, CNPJ, email ou telefone)"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-blue-800">QR Code</span>
          </div>
          <p className="text-sm text-blue-700">
            O QR Code PIX será gerado automaticamente após a confirmação
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações (opcional)
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            rows={3}
            placeholder="Observações sobre o pagamento..."
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button 
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={!chavePix}
        >
          <span className="font-mono text-xs mr-2">[ENTER]</span>
          Gerar PIX
        </button>
      </div>
    </div>
  );
};