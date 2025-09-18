import React, { useState } from 'react';

interface TaxaEntregaPDVProps {
  value?: number;
  onChange?: (value: number) => void;
}

export const TaxaEntregaPDV: React.FC<TaxaEntregaPDVProps> = ({ value = 0, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange?.(newValue)
  };

  return (
    <div className="mt-6">
      <label className="block font-bold mb-1">[ V ] Valor da taxa de entrega:</label>
      <div className="flex items-center gap-2">
        <span className="bg-gray-100 px-3 py-2 rounded-l border border-gray-300">$</span>
        <input
          type="number"
          className="flex-1 border border-gray-300 rounded-r px-3 py-2"
          value={value}
          onChange={handleChange}
          min={0}
          step={0.01}
          placeholder="R$ 0,00"
        />
      </div>
    </div>
  )
};
