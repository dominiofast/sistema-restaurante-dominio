import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';

export interface HorarioDia {
  id?: string;
  dia_semana: number;
  horario_inicio: string;
  horario_fim: string;
  ativo: boolean;
}

export interface HorarioFuncionamento {
  id?: string;
  company_id: string;
  tipo_disponibilidade: 'sempre' | 'especificos' | 'fechado' | 'agendados';
  fuso_horario: string;
  horarios_dias: HorarioDia[];
}

export const useHorariosFuncionamento = () => {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState<HorarioFuncionamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const diasSemana = [
    { id: 0, nome: 'Domingo', abrev: 'Dom' },
    { id: 1, nome: 'Segunda-feira', abrev: 'Seg' },
    { id: 2, nome: 'Terça-feira', abrev: 'Ter' },
    { id: 3, nome: 'Quarta-feira', abrev: 'Qua' },
    { id: 4, nome: 'Quinta-feira', abrev: 'Qui' },
    { id: 5, nome: 'Sexta-feira', abrev: 'Sex' },
    { id: 6, nome: 'Sábado', abrev: 'Sáb' }
  ];

  const fusoHorarios = [
    { value: 'America/Sao_Paulo', label: 'Brasília (UTC-3)' },
    { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
    { value: 'America/Rio_Branco', label: 'Rio Branco (UTC-5)' },
    { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' }
  ];

  const fetchHorarios = async () => {
    if (!user?.user_metadata?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar configuração de horário
      const { data: horarioData, error: horarioError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'horario_funcionamento')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', user.user_metadata.company_id)
        /* .single\( REMOVIDO */ ; //);

      if (horarioError && horarioError.code !== 'PGRST116') {
        throw horarioError;
      }

      if (!horarioData) {
        // Criar configuração padrão se não existir
        const novoHorario = {
          company_id: user.user_metadata.company_id,
          tipo_disponibilidade: 'especificos' as const,
          fuso_horario: 'America/Sao_Paulo'
        };

        const { data: createdHorario, error: createError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'horario_funcionamento')
          /* .insert\( REMOVIDO */ ; //novoHorario)
          /* .select\( REMOVIDO */ ; //)
          /* .single\( REMOVIDO */ ; //);

        if (createError) throw createError;

        setHorarios({
          ...createdHorario,
          tipo_disponibilidade: createdHorario.tipo_disponibilidade as 'sempre' | 'especificos' | 'fechado' | 'agendados',
          horarios_dias: []
        });
        return;
      }

      // Buscar horários dos dias
      const { data: horariosData, error: horariosError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'horarios_dias')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'horario_funcionamento_id', horarioData.id)
        /* .order\( REMOVIDO */ ; //'dia_semana');

      if (horariosError) throw horariosError;

      setHorarios({
        ...horarioData,
        tipo_disponibilidade: horarioData.tipo_disponibilidade as 'sempre' | 'especificos' | 'fechado' | 'agendados',
        horarios_dias: horariosData || []
      });

    } catch (err) {
      console.error('Erro ao buscar horários:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const salvarHorarios = async (dadosHorarios: Partial<HorarioFuncionamento>) => {
    if (!user?.user_metadata?.company_id || !horarios) return;

    try {
      setLoading(true);
      setError(null);

      // Atualizar configuração principal
      const { error: updateError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'horario_funcionamento')
        /* .update\( REMOVIDO */ ; //{
          tipo_disponibilidade: dadosHorarios.tipo_disponibilidade,
          fuso_horario: dadosHorarios.fuso_horario
        })
        /* .eq\( REMOVIDO */ ; //'id', horarios.id);

      if (updateError) throw updateError;

      // Se há horários específicos, atualizar/inserir
      if (dadosHorarios.horarios_dias && dadosHorarios.horarios_dias.length > 0) {
        // Remover horários existentes
        /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'horarios_dias')
          /* .delete\( REMOVIDO */ ; //)
          /* .eq\( REMOVIDO */ ; //'horario_funcionamento_id', horarios.id);

        // Inserir novos horários
        const horariosParaInserir = dadosHorarios.horarios_dias.map(h => ({
          horario_funcionamento_id: horarios.id!,
          dia_semana: h.dia_semana,
          horario_inicio: h.horario_inicio,
          horario_fim: h.horario_fim,
          ativo: h.ativo
        }));

        const { error: insertError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'horarios_dias')
          /* .insert\( REMOVIDO */ ; //horariosParaInserir);

        if (insertError) throw insertError;
      }

      // Recarregar dados
      await fetchHorarios();
      
      return true;
    } catch (err) {
      console.error('Erro ao salvar horários:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, [user?.user_metadata?.company_id]);

  return {
    horarios,
    loading,
    error,
    diasSemana,
    fusoHorarios,
    salvarHorarios,
    refetch: fetchHorarios
  };
};