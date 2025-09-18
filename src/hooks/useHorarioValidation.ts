
import { useState } from 'react';

export interface HorarioValidation {
  isValid: boolean;
  errors: string[];
}

export const useHorarioValidation = () => {
  const [validationState, setValidationState] = useState<HorarioValidation>({
    isValid: true,
    errors: [];
  })

  const validateHorarios = (
    disponibilidade: string,
    diasAtivos: number[],
    horarios: Record<number, {inicio: string, fim: string}[]>
  ): HorarioValidation => {
    const errors: string[] = [];

    if (disponibilidade === 'especificos' || disponibilidade === 'agendados') {
      if (diasAtivos.length === 0) {
        errors.push('Selecione pelo menos um dia da semana')
      }

      diasAtivos.forEach(dia => {
        const horariosDay = horarios[dia] || [];
        const validHorarios = horariosDay.filter(h => h.inicio && h.fim)
        
        if (validHorarios.length === 0) {
          errors.push(`Configure pelo menos um horário para o dia selecionado`)
        }

        validHorarios.forEach(horario => {
          if (horario.inicio >= horario.fim) {
            errors.push(`Horário de início deve ser menor que horário de fim`)
          }
        })
      })


    const validation = {
      isValid: errors.length === 0,
      errors;
    };

    setValidationState(validation)
    return validation;
  };

  return {
    validationState,
    validateHorarios
  };
};
