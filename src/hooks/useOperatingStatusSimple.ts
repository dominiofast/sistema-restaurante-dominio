
import { useState, useEffect } from 'react';
import { useHorarioFuncionamento } from './useHorarioFuncionamento';

interface OperatingStatus {
  status: 'open' | 'closed' | 'soon';
  nextChange?: string;
  message: string;
}

export const useOperatingStatusSimple = (companyId?: string) => {
  const { horario, horariosDias, loading } = useHorarioFuncionamento(companyId);
  const [operatingStatus, setOperatingStatus] = useState<OperatingStatus>({
    status: 'closed',
    message: 'Carregando...'
  });

  const findNextOpenTime = (horarios: any[], diaAtual: number, horaAtual: string): string | null => {
    const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    
    // Primeiro, verificar se há mais horários hoje depois da hora atual
    const horariosHoje = horarios.filter(h => h.dia_semana === diaAtual && h.ativo);
    
    for (const horario of horariosHoje) {
      const inicioHorario = horario.horario_inicio.slice(0, 5);
      if (horaAtual < inicioHorario) {
        return `hoje às ${inicioHorario}`;
      }
    }

    // Se não há mais horários hoje, procurar próximos dias
    for (let i = 1; i <= 7; i++) {
      const proximoDia = (diaAtual + i) % 7;
      const horariosProximoDia = horarios.filter(h => h.dia_semana === proximoDia && h.ativo);
      
      if (horariosProximoDia.length > 0) {
        const primeiroHorario = horariosProximoDia[0];
        const inicioHorario = primeiroHorario.horario_inicio.slice(0, 5);
        if (i === 1) {
          return `amanhã (${diasSemana[proximoDia]}) às ${inicioHorario}`;
        } else {
          return `${diasSemana[proximoDia]} às ${inicioHorario}`;
        }
      }
    }
    
    return null;
  };

  const calculateStatus = (): OperatingStatus => {
    if (!horario) {
      return {
        status: 'closed',
        message: 'Horários não configurados'
      };
    }

    // Se sempre disponível
    if (horario.tipo_disponibilidade === 'sempre') {
      return {
        status: 'open',
        message: 'Sempre aberto'
      };
    }

    // Se fechado permanentemente
    if (horario.tipo_disponibilidade === 'fechado') {
      return {
        status: 'closed',
        message: 'Fechado permanentemente'
      };
    }

    // Para horários específicos, usar lógica mais simples
    const now = new Date();
    const fusoHorario = horario.fuso_horario || 'America/Sao_Paulo';
    
    try {
      const now = new Date();
      const utcTime = now.toISOString();
      
      // Conversão correta para o fuso horário
      const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: fusoHorario}));
      const currentDayOfWeek = timeInTimezone.getDay();
      const currentTimeString = timeInTimezone.toTimeString().slice(0, 5);
      
      // Dias da semana para debug
      const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
      
      console.log(`🕐 DEBUG HORÁRIO:`, {
        utcTime,
        fusoHorario,
        timeInTimezone: timeInTimezone.toString(),
        currentDayOfWeek,
        nomeDia: diasSemana[currentDayOfWeek],
        currentTimeString,
        horariosParaHoje: horariosDias.filter(h => h.dia_semana === currentDayOfWeek && h.ativo)
      });

      const todaySchedules = horariosDias.filter(h => 
        h.dia_semana === currentDayOfWeek && h.ativo
      );

      if (todaySchedules.length === 0) {
        const proximaAbertura = findNextOpenTime(horariosDias, currentDayOfWeek, currentTimeString);
        return {
          status: 'closed',
          message: proximaAbertura ? `Fechado hoje - Abre ${proximaAbertura}` : 'Fechado hoje'
        };
      }

      const isOpenNow = todaySchedules.some(schedule => {
        const inicio = schedule.horario_inicio.slice(0, 5); // Remove segundos se houver
        const fim = schedule.horario_fim.slice(0, 5); // Remove segundos se houver
        
        console.log(`Checking schedule:`, {
          currentTime: currentTimeString,
          scheduleStart: inicio,
          scheduleEnd: fim,
          isInRange: currentTimeString >= inicio && currentTimeString <= fim
        });
        
        return currentTimeString >= inicio && currentTimeString <= fim;
      });

      if (isOpenNow) {
        return {
          status: 'open',
          message: 'Aberto agora'
        };
      }

      // Procurar próximo horário de abertura
      const proximaAbertura = findNextOpenTime(horariosDias, currentDayOfWeek, currentTimeString);
      
      return {
        status: 'closed',
        message: proximaAbertura ? `Fechado - Abre ${proximaAbertura}` : 'Fechado'
      };
    } catch (error) {
      return {
        status: 'closed',
        message: 'Erro ao verificar horários'
      };
    }
  };

  useEffect(() => {
    if (!loading) {
      const newStatus = calculateStatus();
      setOperatingStatus(newStatus);
    }
  }, [horario, horariosDias, loading]);

  return {
    ...operatingStatus,
    loading
  };
};
