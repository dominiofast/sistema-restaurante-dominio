import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoreStatus {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
  nextCloseTime?: string;
}

export const useStoreStatus = (companyId?: string) => {
  const [status, setStatus] = useState<StoreStatus>({
    isOpen: true,
    message: 'Verificando horário...'
  });
  const [loading, setLoading] = useState(true);

  const checkStoreStatus = async () => {
    if (!companyId) {
      setStatus({
        isOpen: true,
        message: 'Loja disponível'
      });
      setLoading(false);
      return;
    }

    try {
      // Buscar configuração de horário
      const { data: horarioData, error: horarioError } = await supabase
        .from('horario_funcionamento')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (horarioError || !horarioData) {
        // Se não há configuração, considerar sempre aberto
        setStatus({
          isOpen: true,
          message: 'Loja disponível'
        });
        setLoading(false);
        return;
      }

      // Verificar tipo de disponibilidade
      if (horarioData.tipo_disponibilidade === 'sempre') {
        setStatus({
          isOpen: true,
          message: 'Loja aberta 24h'
        });
        setLoading(false);
        return;
      }

      if (horarioData.tipo_disponibilidade === 'fechado') {
        setStatus({
          isOpen: false,
          message: 'Loja temporariamente fechada'
        });
        setLoading(false);
        return;
      }

      // Para tipo 'especificos', verificar horários por dia
      if (horarioData.tipo_disponibilidade === 'especificos') {
        const { data: horariosData, error: horariosError } = await supabase
          .from('horarios_dias')
          .select('*')
          .eq('horario_funcionamento_id', horarioData.id)
          .eq('ativo', true);

        if (horariosError || !horariosData || horariosData.length === 0) {
          setStatus({
            isOpen: false,
            message: 'Horários não configurados'
          });
          setLoading(false);
          return;
        }

        // Obter data/hora atual no fuso horário da empresa
        const fusoHorario = horarioData.fuso_horario || 'America/Sao_Paulo';
        const agora = new Date();
        const agoraLocal = new Date(agora.toLocaleString('en-US', { timeZone: fusoHorario }));
        const diaAtual = agoraLocal.getDay(); // 0 = Domingo, 1 = Segunda, etc.
        const horaAtual = agoraLocal.getHours();
        const minutoAtual = agoraLocal.getMinutes();
        const horaAtualCompleta = horaAtual * 60 + minutoAtual; // Em minutos desde meia-noite

        console.log('🕐 Verificando horário:', {
          fusoHorario,
          diaAtual,
          horaAtual: `${horaAtual.toString().padStart(2, '0')}:${minutoAtual.toString().padStart(2, '0')}`,
          horaAtualCompleta
        });

        // Buscar horários para o dia atual
        const horariosHoje = horariosData.filter(h => h.dia_semana === diaAtual);

        if (horariosHoje.length === 0) {
          // Verificar próximo dia com horário
          const proximoDiaAberto = findNextOpenDay(horariosData, diaAtual);
          setStatus({
            isOpen: false,
            message: proximoDiaAberto 
              ? `Fechado hoje. Próxima abertura: ${proximoDiaAberto}`
              : 'Fechado hoje'
          });
          setLoading(false);
          return;
        }

        // Verificar se está dentro de algum horário de funcionamento
        let isOpenNow = false;
        let nextCloseTime = '';
        
        for (const horario of horariosHoje) {
          const [horaInicio, minutoInicio] = horario.horario_inicio.split(':').map(Number);
          const [horaFim, minutoFim] = horario.horario_fim.split(':').map(Number);
          
          const inicioCompleto = horaInicio * 60 + minutoInicio;
          const fimCompleto = horaFim * 60 + minutoFim;

          console.log('⏰ Verificando período:', {
            periodo: `${horario.horario_inicio} - ${horario.horario_fim}`,
            inicioCompleto,
            fimCompleto,
            horaAtualCompleta
          });

          if (horaAtualCompleta >= inicioCompleto && horaAtualCompleta < fimCompleto) {
            isOpenNow = true;
            nextCloseTime = horario.horario_fim;
            break;
          }
        }

        if (isOpenNow) {
          setStatus({
            isOpen: true,
            message: `Aberto até ${nextCloseTime}`,
            nextCloseTime
          });
        } else {
          // Encontrar próximo horário de abertura
          const proximaAbertura = findNextOpenTime(horariosData, diaAtual, horaAtualCompleta);
          setStatus({
            isOpen: false,
            message: proximaAbertura 
              ? `Fechado abre ${proximaAbertura}`
              : 'Fechado',
            nextOpenTime: proximaAbertura
          });
        }
      }

    } catch (error) {
      console.error('Erro ao verificar status da loja:', error);
      setStatus({
        isOpen: true,
        message: 'Loja disponível'
      });
    } finally {
      setLoading(false);
    }
  };

  const findNextOpenDay = (horarios: any[], diaAtual: number) => {
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    for (let i = 1; i <= 7; i++) {
      const proximoDia = (diaAtual + i) % 7;
      const horariosProximoDia = horarios.filter(h => h.dia_semana === proximoDia);
      
      if (horariosProximoDia.length > 0) {
        const primeiroHorario = horariosProximoDia[0];
        return `${diasSemana[proximoDia]} às ${primeiroHorario.horario_inicio}`;
      }
    }
    
    return null;
  };

  const findNextOpenTime = (horarios: any[], diaAtual: number, horaAtualCompleta: number) => {
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Primeiro, verificar se há mais horários hoje depois da hora atual
    const horariosHoje = horarios.filter(h => h.dia_semana === diaAtual);
    
    for (const horario of horariosHoje) {
      const [horaInicio, minutoInicio] = horario.horario_inicio.split(':').map(Number);
      const inicioCompleto = horaInicio * 60 + minutoInicio;
      
      if (inicioCompleto > horaAtualCompleta) {
        return `hoje às ${horario.horario_inicio}`;
      }
    }

    // Se não há mais horários hoje, procurar próximos dias
    for (let i = 1; i <= 7; i++) {
      const proximoDia = (diaAtual + i) % 7;
      const horariosProximoDia = horarios.filter(h => h.dia_semana === proximoDia);
      
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

  useEffect(() => {
    checkStoreStatus();
    
    // Verificar a cada minuto
    const interval = setInterval(checkStoreStatus, 60000);
    
    return () => clearInterval(interval);
  }, [companyId]);

  return {
    status,
    loading,
    refetch: checkStoreStatus
  };
};