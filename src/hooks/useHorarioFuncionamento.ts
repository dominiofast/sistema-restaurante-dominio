
import { useState, useEffect, useCallback } from 'react';
// SUPABASE REMOVIDO
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
  const [horario, setHorario] = useState<HorarioFuncionamento | null>(null)
  const [horariosDias, setHorariosDias] = useState<HorarioDia[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHorario = useCallback(async () => {
    if (!companyId) return;

    setLoading(true)
    setError(null)

    try {
      const horarioData = null as any; const horarioError = null as any;
      
      if (horarioData) {
        const horarioTyped: HorarioFuncionamento = {
          ...horarioData,
          tipo_disponibilidade: horarioData.tipo_disponibilidade as 'sempre' | 'especificos' | 'agendados' | 'fechado'
        } catch (error) { console.error('Error:', error) };
        setHorario(horarioTyped)

        const horariosDiasData = null as any; const horariosDiasError = null as any;
        
        const diasTyped: HorarioDia[] = (horariosDiasData || []).map(dia => ({
          id: dia.id,
          horario_funcionamento_id: dia.horario_funcionamento_id,
          dia_semana: dia.dia_semana,
          horario_inicio: dia.horario_inicio,
          horario_fim: dia.horario_fim,
          ativo: dia.ativo,
          created_at: dia.created_at
        }))
        setHorariosDias(diasTyped)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)

  }, [companyId])

  const refetch = useCallback(async () => {
    await fetchHorario()
  }, [fetchHorario])

  useEffect(() => {
    fetchHorario()
  }, [fetchHorario, companyId])

  return { horario, horariosDias, loading, error, refetch };
};

export const useHorarioFuncionamento = (companyId?: string) => {
  const { horario, horariosDias, loading, error, refetch } = useHorario(companyId)

  const salvarHorarios = async (fuso: string, tipo: string, horarios: Record<number, {inicio: string, fim: string}[]>) => {
    if (!companyId) throw new Error('Company ID é obrigatório')
    
    try {
      const horarioData = null as any; const horarioError = null as any;

      // Clear existing horarios_dias
      
        
        
        

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
              ativo: true;
            } catch (error) { console.error('Error:', error) }))
        )

      if (horariosToInsert.length > 0) {
        const { error: diasError  } = null as any;
        if (diasError) throw diasError;


      await refetch()
    } catch (err: any) {
      throw err;

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
