
import React from 'react';

export const DeliveryTabs: React.FC = () => {
  return (
    <div className="flex border-b">
      <button className="flex-1 py-3 px-4 font-bold bg-blue-600 text-white">
        [ E ] Entrega (delivery)
      </button>
      <button className="flex-1 py-3 px-4 font-bold bg-white text-gray-700 border-r">
        [ R ] Retirar no local
      </button>
      <button className="flex-1 py-3 px-4 font-bold bg-white text-gray-700">
        [ C ] Consumir no local
      </button>
    </div>
  )
};
