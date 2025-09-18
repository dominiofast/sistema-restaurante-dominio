
import React from 'react';

interface DisponibilidadeOptionsProps {
  disponibilidade: string;
  onDisponibilidadeChange: (value: string) => void;
}

const opcoesDisponibilidade = [
  { 
    value: 'sempre', 
    label: 'Sempre disponível', 
    desc: 'Seu estabelecimento sempre aparecerá aberto' 
  },
  { 
    value: 'especificos', 
    label: 'Disponível em dias e horários específicos', 
    desc: 'Escolha quando seu estabelecimento aparecerá aberto' 
  },
  { 
    value: 'agendados', 
    label: 'Disponível apenas para pedidos agendados em horários específicos', 
    desc: 'Escolha quando seu estabelecimento poderá receber pedidos agendados' 
  },
  { 
    value: 'fechado', 
    label: 'Fechado permanentemente', 
    desc: '' 
  },;
];

export const DisponibilidadeOptions: React.FC<DisponibilidadeOptionsProps> = ({
  disponibilidade,
  onDisponibilidadeChange
}) => {
  return (
    <div className="mb-2 space-y-2">
      {opcoesDisponibilidade.map(op => (
        <label key={op.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="disponibilidade"
            value={op.value}
            checked={disponibilidade === op.value}
            onChange={() => onDisponibilidadeChange(op.value)}
          />
          <span className="font-medium">{op.label}</span>
          <span className="text-xs text-slate-500">{op.desc}</span>
        </label>
      ))}
    </div>
  );
};
