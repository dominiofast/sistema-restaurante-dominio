import React from 'react';

export const PagamentoTabsPDV = ({ tab, setTab }: { tab: string; setTab: (t: 'dinheiro'|'cartao'|'pix') => void }) => (
  <div className="flex bg-white border-b border-gray-200">
    <button 
      className={`flex-1 py-3 px-6 text-sm font-medium transition-colors relative ${
        tab === 'dinheiro' 
          ? 'bg-green-50 text-green-700 border-b-2 border-green-600' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`} 
      onClick={() => setTab('dinheiro')}
    >
      <span className="font-mono text-xs mr-2">[D]</span>
      Dinheiro
    </button>
    <button 
      className={`flex-1 py-3 px-6 text-sm font-medium transition-colors relative ${
        tab === 'cartao' 
          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`} 
      onClick={() => setTab('cartao')}
    >
      <span className="font-mono text-xs mr-2">[C]</span>
      Cartão
    </button>
    <button 
      className={`flex-1 py-3 px-6 text-sm font-medium transition-colors relative ${
        tab === 'pix' 
          ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`} 
      onClick={() => setTab('pix')}
    >
      <span className="font-mono text-xs mr-2">[P]</span>
      PIX
    </button>
  </div>
)
