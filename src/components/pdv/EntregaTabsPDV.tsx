import React from 'react';

export const EntregaTabsPDV = ({ tab, setTab }: { tab: string; setTab: (t: 'delivery'|'pickup'|'eat_in') => void }) => (
  <div className="flex bg-white border-b border-gray-200">
    <button 
      className={`flex-1 py-3 px-6 text-sm font-medium transition-colors relative ${
        tab === 'delivery' 
          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`} 
      onClick={() => setTab('delivery')}
    >
      <span className="font-mono text-xs mr-2">[E]</span>
      Entrega (delivery)
    </button>
    <button 
      className={`flex-1 py-3 px-6 text-sm font-medium transition-colors relative ${
        tab === 'pickup' 
          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`} 
      onClick={() => setTab('pickup')}
    >
      <span className="font-mono text-xs mr-2">[R]</span>
      Retirar no local
    </button>
    <button 
      className={`flex-1 py-3 px-6 text-sm font-medium transition-colors relative ${
        tab === 'eat_in' 
          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`} 
      onClick={() => setTab('eat_in')}
    >
      <span className="font-mono text-xs mr-2">[C]</span>
      Consumir no local
    </button>
  </div>
)
