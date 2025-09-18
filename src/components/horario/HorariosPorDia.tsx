
import React from 'react';

interface HorariosPorDiaProps {
  diasAtivos: number[];
  horarios: Record<number, {inicio: string, fim: string}[]>;
  onHorarioChange: (dia: number, idx: number, campo: 'inicio' | 'fim', valor: string) => void;
  onAddHorario: (dia: number) => void;
  onRemoveHorario: (dia: number, idx: number) => void;
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

export const HorariosPorDia: React.FC<HorariosPorDiaProps> = ({
  diasAtivos,
  horarios,
  onHorarioChange,
  onAddHorario,
  onRemoveHorario
}) => {
  return (
    <>
      {diasSemana.filter(d => diasAtivos.includes(d.value)).map(dia => (
        <div key={dia.value} className="mb-2">
          <div className="font-medium text-slate-700 mb-1 flex items-center gap-2">
            {dia.nome} <span className="text-xs text-slate-400">*</span>
          </div>
          {horarios[dia.value].map((h, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <input
                type="time"
                value={h.inicio}
                onChange={e => onHorarioChange(dia.value, idx, 'inicio', e.target.value)}
                className="border rounded px-2 py-1"
              />
              <span>às</span>
              <input
                type="time"
                value={h.fim}
                onChange={e => onHorarioChange(dia.value, idx, 'fim', e.target.value)}
                className="border rounded px-2 py-1"
              />
              {horarios[dia.value].length > 1 && (
                <button
                  type="button"
                  className="ml-2 text-red-500"
                  onClick={() => onRemoveHorario(dia.value, idx)}
                  title="Remover horário"
                >
                  ✕
                </button>
              )}
              {idx === horarios[dia.value].length - 1 && (
                <button
                  type="button"
                  className="ml-2 text-blue-600"
                  onClick={() => onAddHorario(dia.value)}
                  title="Adicionar horário"
                >
                  + Horário
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
