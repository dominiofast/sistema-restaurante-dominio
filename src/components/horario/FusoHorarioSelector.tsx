
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FusoHorarioSelectorProps {
  fuso: string;
  onFusoChange: (fuso: string) => void;
}

const fusos = [
  { value: 'America/Sao_Paulo', label: 'Horário de Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Amazonas (GMT-4)' },
  { value: 'America/Fortaleza', label: 'Ceará (GMT-3)' },
  { value: 'America/Recife', label: 'Pernambuco (GMT-3)' },
  { value: 'America/Porto_Velho', label: 'Rondônia (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Acre (GMT-5)' },
  { value: 'America/Boa_Vista', label: 'Roraima (GMT-4)' },
];

export const FusoHorarioSelector: React.FC<FusoHorarioSelectorProps> = ({
  fuso,
  onFusoChange
}) => {
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-1">
        Fuso horário <span className="text-red-500">*</span>
      </label>
      <Select value={fuso} onValueChange={onFusoChange}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Selecione o fuso horário" />
        </SelectTrigger>
        <SelectContent>
          {fusos.map(f => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
