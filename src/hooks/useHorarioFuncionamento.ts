
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HorarioFuncionamento {
  id: string;
  company_id: string;
  fuso_horario: string;
  tipo_disponibilidade: 'sempre' | 'especificos' | 'agendados' | 'fechado';
  created_at: string;
  updated_at: string;
}

export interface HorarioDia {
  id: string;
  horario_funcionamento_id: string;
  dia_semana: number;
  horario_inicio: string;
  horario_fim: string;
  ativo: boolean;
  created_at: string;
}

const useHorario = (companyId?: string) => {
  const [horario, setHorario] = useState<HorarioFuncionamento | null>(null);
  const [horariosDias, setHorariosDias] = useState<HorarioDia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHorario = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: horarioData, error: horarioError } = await supabase
        .from('horario_funcionamento')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (horarioError && horarioError.code !== 'PGRST116') throw horarioError;
      
      if (horarioData) {
        const horarioTyped: HorarioFuncionamento = {
          ...horarioData,
          tipo_disponibilidade: horarioData.tipo_disponibilidade as 'sempre' | 'especificos' | 'agendados' | 'fechado'
        };
        setHorario(horarioTyped);

        const { data: horariosDiasData, error: horariosDiasError } = await supabase
          .from('horarios_dias')
          .select('*')
          .eq('horario_funcionamento_id', horarioData.id);

        if (horariosDiasError) throw horariosDiasError;
        
        const diasTyped: HorarioDia[] = (horariosDiasData || []).map(dia => ({
          id: dia.id,
          horario_funcionamento_id: dia.horario_funcionamento_id,
          dia_semana: dia.dia_semana,
          horario_inicio: dia.horario_inicio,
          horario_fim: dia.horario_fim,
          ativo: dia.ativo,
          created_at: dia.created_at
        }));
        setHorariosDias(diasTyped);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const refetch = useCallback(async () => {
    await fetchHorario();
  }, [fetchHorario]);

  useEffect(() => {
    fetchHorario();
  }, [fetchHorario, companyId]);

  return { horario, horariosDias, loading, error, refetch };
};

export const useHorarioFuncionamento = (companyId?: string) => {
  const { horario, horariosDias, loading, error, refetch } = useHorario(companyId);

  const salvarHorarios = async (fuso: string, tipo: string, horarios: Record<number, {inicio: string, fim: string}[]>) => {
    if (!companyId) throw new Error('Company ID é obrigatório');
    
    try {
      const { data: horarioData, error: horarioError } = await supabase
        .from('horario_funcionamento')
        .upsert({
          company_id: companyId,
          fuso_horario: fuso,
          tipo_disponibilidade: tipo,
        }, {
          onConflict: 'company_id'
        })
        .select()
        .single();

      if (horarioError) throw horarioError;

      // Clear existing horarios_dias
      await supabase
        .from('horarios_dias')
        .delete()
        .eq('horario_funcionamento_id', horarioData.id);

      // Insert new horarios_dias
      const horariosToInsert = Object.entries(horarios)
        .filter(([dia, horariosList]) => horariosList.some(h => h.inicio && h.fim))
        .flatMap(([dia, horariosList]) => 
          horariosList
            .filter(h => h.inicio && h.fim)
            .map(h => ({
              horario_funcionamento_id: horarioData.id,
              dia_semana: parseInt(dia),
              horario_inicio: h.inicio,
              horario_fim: h.fim,
              ativo: true
            }))
        );

      if (horariosToInsert.length > 0) {
        const { error: diasError } = await supabase
          .from('horarios_dias')
          .insert(horariosToInsert);

        if (diasError) throw diasError;
      }

      await refetch();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    horario,
    horariosDias,
    loading,
    error,
    salvarHorarios,
    refetch
  };
};
