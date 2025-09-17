
import React, { useState, useEffect } from 'react';
import { useHorarioFuncionamento } from '@/hooks/useHorarioFuncionamento';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface HorarioStepProps {
  companyId?: string;
}

const diasSemana = [
  { label: 'D', nome: 'Domingo', value: 0 },
  { label: 'S', nome: 'Segunda', value: 1 },
  { label: 'T', nome: 'Terça', value: 2 },
  { label: 'Q', nome: 'Quarta', value: 3 },
  { label: 'Q', nome: 'Quinta', value: 4 },
  { label: 'S', nome: 'Sexta', value: 5 },
  { label: 'S', nome: 'Sábado', value: 6 },
];

export const HorarioStep: React.FC<HorarioStepProps> = ({ companyId }) => {
  const { horario, horariosDias, loading, error } = useHorarioFuncionamento(companyId);
  const [horarios, setHorarios] = useState<Record<number, {inicio: string, fim: string}[]>>({
    0: [{inicio: '', fim: ''}],
    1: [{inicio: '18:00', fim: '23:00'}],
    2: [{inicio: '18:00', fim: '23:00'}],
    3: [{inicio: '18:00', fim: '23:00'}],
    4: [{inicio: '18:00', fim: '23:00'}],
    5: [{inicio: '18:00', fim: '23:00'}],
    6: [{inicio: '18:00', fim: '23:00'}],
  });

  useEffect(() => {
    if (horario && horariosDias.length > 0) {
      const novoHorarios: Record<number, {inicio: string, fim: string}[]> = {};
      
      // Initialize all days with empty array
      for (let i = 0; i <= 6; i++) {
        novoHorarios[i] = [];
      }

      // Populate with existing data
      horariosDias.forEach(dia => {
        if (!novoHorarios[dia.dia_semana]) {
          novoHorarios[dia.dia_semana] = [];
        }
        novoHorarios[dia.dia_semana].push({
          inicio: dia.horario_inicio,
          fim: dia.horario_fim
        });
      });

      // Ensure each day has at least one empty slot if no data
      Object.keys(novoHorarios).forEach(dia => {
        const diaNum = parseInt(dia);
        if (novoHorarios[diaNum].length === 0) {
          novoHorarios[diaNum] = [{inicio: '', fim: ''}];
        }
      });

      setHorarios(novoHorarios);
    }
  }, [horario, horariosDias]);

  if (loading) {
    return <div>Carregando horários...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar horários: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Horário de Funcionamento</h3>
        
        {diasSemana.map((dia) => (
          <div key={dia.value} className="flex items-center gap-4 mb-4">
            <div className="w-20 text-sm font-medium">
              {dia.nome}
            </div>
            
            <div className="flex-1 space-y-2">
              {horarios[dia.value]?.map((horario, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="time"
                    value={horario.inicio}
                    onChange={(e) => {
                      const novosHorarios = { ...horarios };
                      novosHorarios[dia.value][index].inicio = e.target.value;
                      setHorarios(novosHorarios);
                    }}
                    className="border rounded px-3 py-1"
                  />
                  <span>às</span>
                  <input
                    type="time"
                    value={horario.fim}
                    onChange={(e) => {
                      const novosHorarios = { ...horarios };
                      novosHorarios[dia.value][index].fim = e.target.value;
                      setHorarios(novosHorarios);
                    }}
                    className="border rounded px-3 py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Configure os horários de funcionamento para cada dia da semana.
        </AlertDescription>
      </Alert>
    </div>
  );
};
