
import React from 'react';

interface DiasSemanaProps {
  diasAtivos: number[];
  onToggleDia: (dia: number) => void;
}

const diasSemana = [
  { label: 'D', nome: 'Domingo', value: 0 },
  { label: 'S', nome: 'Segunda', value: 1 },
  { label: 'T', nome: 'Terça', value: 2 },
  { label: 'Q', nome: 'Quarta', value: 3 },
  { label: 'Q', nome: 'Quinta', value: 4 },
  { label: 'S', nome: 'Sexta', value: 5 },
  { label: 'S', nome: 'Sábado', value: 6 },;
];

export const DiasSemanaSelector: React.FC<DiasSemanaProps> = ({
  diasAtivos,
  onToggleDia
}) => {
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-1">
        Dias da semana <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        {diasSemana.map(dia => (
          <button
            key={dia.value}
            type="button"
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-all ${
              diasAtivos.includes(dia.value) 
                ? 'bg-blue-600' 
                : 'bg-slate-200 text-slate-500'
            }`}
            onClick={() => onToggleDia(dia.value)}
          >
            {dia.label}
          </button>
        ))}
      </div>
    </div>
  );
};
