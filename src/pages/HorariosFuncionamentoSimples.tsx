import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface HorarioDia {
  id?: string;
  dia_semana: number;
  horario_inicio: string;
  horario_fim: string;
  ativo: boolean;
}

interface HorarioFuncionamento {
  id?: string;
  company_id: string;
  tipo_disponibilidade: 'sempre' | 'especificos' | 'fechado' | 'agendados';
  fuso_horario: string;
  horarios_dias: HorarioDia[];
}

export default function HorariosFuncionamentoSimples() {
  const { user, companyId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [tipoDisponibilidade, setTipoDisponibilidade] = useState<'sempre' | 'especificos' | 'fechado' | 'agendados'>('especificos');
  const [fusoHorario, setFusoHorario] = useState('America/Sao_Paulo');
  const [horariosDias, setHorariosDias] = useState<HorarioDia[]>([]);
  const [horarioId, setHorarioId] = useState<string | null>(null);

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
    if (!companyId) {
      setError('Empresa não identificada');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar configuração de horário
      const { data: horarioData, error: horarioError } = await supabase
        .from('horario_funcionamento')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (horarioError && horarioError.code !== 'PGRST116') {
        throw horarioError;
      }

      if (!horarioData) {
        // Criar configuração padrão se não existir
        const novoHorario = {
          company_id: companyId,
          tipo_disponibilidade: 'especificos',
          fuso_horario: 'America/Sao_Paulo'
        };

        const { data: createdHorario, error: createError } = await supabase
          .from('horario_funcionamento')
          .insert(novoHorario)
          .select()
          .single();

        if (createError) throw createError;

        setHorarioId(createdHorario.id);
        setTipoDisponibilidade(createdHorario.tipo_disponibilidade as 'sempre' | 'especificos' | 'fechado' | 'agendados');
        setFusoHorario(createdHorario.fuso_horario);
        setHorariosDias([]);
        setLoading(false);
        return;
      }

      setHorarioId(horarioData.id);
      setTipoDisponibilidade(horarioData.tipo_disponibilidade as 'sempre' | 'especificos' | 'fechado' | 'agendados');
      setFusoHorario(horarioData.fuso_horario);

      // Buscar horários dos dias
      const { data: horariosData, error: horariosError } = await supabase
        .from('horarios_dias')
        .select('*')
        .eq('horario_funcionamento_id', horarioData.id)
        .order('dia_semana');

      if (horariosError) throw horariosError;

      setHorariosDias(horariosData || []);

    } catch (err) {
      console.error('Erro ao buscar horários:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const adicionarHorario = (diaSemana: number) => {
    const novoHorario: HorarioDia = {
      dia_semana: diaSemana,
      horario_inicio: '09:00',
      horario_fim: '18:00',
      ativo: true
    };
    setHorariosDias([...horariosDias, novoHorario]);
  };

  const removerHorario = (index: number) => {
    setHorariosDias(horariosDias.filter((_, i) => i !== index));
  };

  const atualizarHorario = (index: number, campo: keyof HorarioDia, valor: any) => {
    const novosHorarios = [...horariosDias];
    novosHorarios[index] = { ...novosHorarios[index], [campo]: valor };
    setHorariosDias(novosHorarios);
  };

  const handleSalvar = async () => {
    if (!companyId || !horarioId) return;

    setSalvando(true);
    try {
      // Atualizar configuração principal
      const { error: updateError } = await supabase
        .from('horario_funcionamento')
        .update({
          tipo_disponibilidade: tipoDisponibilidade,
          fuso_horario: fusoHorario
        })
        .eq('id', horarioId);

      if (updateError) throw updateError;

      // Se há horários específicos, atualizar/inserir
      if (tipoDisponibilidade === 'especificos' && horariosDias.length > 0) {
        // Remover horários existentes
        await supabase
          .from('horarios_dias')
          .delete()
          .eq('horario_funcionamento_id', horarioId);

        // Inserir novos horários
        const horariosParaInserir = horariosDias.map(h => ({
          horario_funcionamento_id: horarioId,
          dia_semana: h.dia_semana,
          horario_inicio: h.horario_inicio,
          horario_fim: h.horario_fim,
          ativo: h.ativo
        }));

        const { error: insertError } = await supabase
          .from('horarios_dias')
          .insert(horariosParaInserir);

        if (insertError) throw insertError;
      }

      toast.success('Horários salvos com sucesso!');
      await fetchHorarios(); // Recarregar dados
      
    } catch (err) {
      console.error('Erro ao salvar horários:', err);
      toast.error('Erro ao salvar horários');
    } finally {
      setSalvando(false);
    }
  };

  const getHorariosPorDia = (diaSemana: number) => {
    return horariosDias.filter(h => h.dia_semana === diaSemana);
  };

  useEffect(() => {
    fetchHorarios();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando horários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Horários de Funcionamento
        </h1>
        <p className="text-gray-600 mt-2">
          Configure os horários de funcionamento do seu estabelecimento
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Configurações Gerais */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Configurações Gerais</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuso Horário
              </label>
              <select
                value={fusoHorario}
                onChange={(e) => setFusoHorario(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fusoHorarios.map(fuso => (
                  <option key={fuso.value} value={fuso.value}>
                    {fuso.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Disponibilidade
              </label>
              <select
                value={tipoDisponibilidade}
                onChange={(e) => setTipoDisponibilidade(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sempre">Sempre Disponível</option>
                <option value="especificos">Dias e Horários Específicos</option>
                <option value="agendados">Apenas para Pedidos Agendados</option>
                <option value="fechado">Fechado Permanentemente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Horários Específicos */}
        {tipoDisponibilidade === 'especificos' && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Horários por Dia da Semana</h2>
            
            <div className="space-y-6">
              {diasSemana.map(dia => {
                const horariosHoje = getHorariosPorDia(dia.id);
                
                return (
                  <div key={dia.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{dia.nome}</h3>
                      <button
                        onClick={() => adicionarHorario(dia.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Horário
                      </button>
                    </div>

                    {horariosHoje.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        Nenhum horário configurado para este dia
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {horariosHoje.map((horario, index) => {
                          const globalIndex = horariosDias.findIndex(h => 
                            h.dia_semana === dia.id && 
                            h.horario_inicio === horario.horario_inicio &&
                            h.horario_fim === horario.horario_fim
                          );
                          
                          return (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={horario.ativo}
                                  onChange={(e) => 
                                    atualizarHorario(globalIndex, 'ativo', e.target.checked)
                                  }
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm">Ativo</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm">De:</span>
                                <input
                                  type="time"
                                  value={horario.horario_inicio}
                                  onChange={(e) => 
                                    atualizarHorario(globalIndex, 'horario_inicio', e.target.value)
                                  }
                                  className="p-1 border border-gray-300 rounded"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm">Até:</span>
                                <input
                                  type="time"
                                  value={horario.horario_fim}
                                  onChange={(e) => 
                                    atualizarHorario(globalIndex, 'horario_fim', e.target.value)
                                  }
                                  className="p-1 border border-gray-300 rounded"
                                />
                              </div>

                              <button
                                onClick={() => removerHorario(globalIndex)}
                                className="p-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button 
            onClick={handleSalvar} 
            disabled={salvando}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {salvando ? 'Salvando...' : 'Salvar Horários'}
          </button>
        </div>
      </div>
    </div>
  );
}
