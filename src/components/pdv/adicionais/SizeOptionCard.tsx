import React from 'react';

interface SizeOptionCardProps {
  adicional: any;
  isSelected: boolean;
  onClick: () => void;
}

export const SizeOptionCard: React.FC<SizeOptionCardProps> = ({
  adicional,
  isSelected,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 font-bold rounded-lg transition-all duration-200 border-2 min-h-[50px] flex flex-col justify-center items-center ${
        isSelected 
          ? 'bg-orange-500 text-white border-orange-500 shadow-lg transform scale-105' 
          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-orange-100 hover:border-orange-300'
      }`}
    >
      <div className="text-center">
        <div className="font-bold text-[10px]">{adicional.name.toUpperCase()}</div>
        {adicional.price > 0 && (
          <div className="text-[8px] mt-1 opacity-90">
            + R$ {adicional.price.toFixed(2)}
          </div>
        )}
      </div>
    </button>
  );
};