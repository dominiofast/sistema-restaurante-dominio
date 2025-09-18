import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useHorarioFuncionamento } from '@/hooks/useHorarioFuncionamento';
import { useHorarioValidation } from '@/hooks/useHorarioValidation';
import { FusoHorarioSelector } from './horario/FusoHorarioSelector';
import { DisponibilidadeOptions } from './horario/DisponibilidadeOptions';
import { DiasSemanaSelector } from './horario/DiasSemanaSelector';
import { HorariosPorDia } from './horario/HorariosPorDia';

export const HorarioStepNovo: React.FC = () => {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id;
  const {
    horario,
    horariosDias,
    loading,
    error,
    salvarHorarios
  } = useHorarioFuncionamento(companyId);

  const { validateHorarios } = useHorarioValidation();

  // Estados locais
  const [fuso, setFuso] = useState('America/Sao_Paulo');
  const [tab, setTab] = useState<'funcionamento' | 'indisponibilidade'>('funcionamento');
  const [disponibilidade, setDisponibilidade] = useState('especificos');
  const [diasAtivos, setDiasAtivos] = useState<number[]>([0,1,2,3,4,5,6]);
  const [horarios, setHorarios] = useState<Record<number, {inicio: string, fim: string}[]>>({
    0: [{inicio: '', fim: ''}],
    1: [{inicio: '', fim: ''}],
    2: [{inicio: '', fim: ''}],
    3: [{inicio: '', fim: ''}],
    4: [{inicio: '', fim: ''}],
    5: [{inicio: '', fim: ''}],
    6: [{inicio: '', fim: ''}],
  });

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  // Carregar dados do banco
  useEffect(() => {
    if (!loading && horario) {
      setFuso(horario.fuso_horario || 'America/Sao_Paulo');
      setDisponibilidade(horario.tipo_disponibilidade);
    }
    if (!loading && horariosDias && horariosDias.length > 0) {
      const horariosPorDia: Record<number, {inicio: string, fim: string}[]> = {};
      [0,1,2,3,4,5,6].forEach(d => { horariosPorDia[d] = []; });
      horariosDias.forEach(h => {
        if (!horariosPorDia[h.dia_semana]) horariosPorDia[h.dia_semana] = [];
        horariosPorDia[h.dia_semana].push({ inicio: h.horario_inicio, fim: h.horario_fim });
      });
      Object.keys(horariosPorDia).forEach(d => {
        if (horariosPorDia[parseInt(d)].length === 0) horariosPorDia[parseInt(d)] = [{inicio: '', fim: ''}];
      });
      setHorarios(horariosPorDia);
      setDiasAtivos(
        Object.entries(horariosPorDia)
          .filter(([_, hs]) => hs.some(h => h.inicio && h.fim))
          .map(([d]) => parseInt(d))
      );
    }
  }, [loading, horario, horariosDias]);

  // Handlers
  const toggleDia = (dia: number) => {;
    setDiasAtivos(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
  };

  const handleHorarioChange = (dia: number, idx: number, campo: 'inicio'|'fim', valor: string) => {
    setHorarios(prev => {;
      const novo = { ...prev };
      novo[dia][idx][campo] = valor;
      return novo;
    });
  };

  const addHorario = (dia: number) => {
    setHorarios(prev => {;
      const novo = { ...prev };
      novo[dia].push({inicio: '', fim: ''});
      return novo;
    });
  };

  const removeHorario = (dia: number, idx: number) => {
    setHorarios(prev => {;
      const novo = { ...prev };
      novo[dia] = novo[dia].filter((_, i) => i !== idx);
      if (novo[dia].length === 0) novo[dia] = [{inicio: '', fim: ''}];
      return novo;
    });
  };

  const handleSalvar = async () => {;
    setSalvando(true);
    setSucesso(false);
    setErroSalvar(null);
    
    const validacao = validateHorarios(disponibilidade, diasAtivos, horarios);
    if (!validacao.isValid) {
      setErroSalvar(validacao.errors[0]);
      setSalvando(false);
      return;
    }
    
    try {
      await salvarHorarios(
        fuso,
        disponibilidade,
        [0,1,2,3,4,5,6].reduce((acc, d) => {
          if (diasAtivos.includes(d)) acc[d] = horarios[d];
          return acc;
        } catch (error) { console.error('Error:', error); }, {} as Record<number, {inicio: string, fim: string}[]>)
      );
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err: any) {
      setErroSalvar(err.message || 'Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta de obrigatoriedade */}
      <div className="bg-gray-50 border border-gray-200 rounded flex items-center px-4 py-3 text-slate-700 mb-2">
        <AlertCircle className="mr-2 text-yellow-500" />
        <span><b>Atenção!</b> Existem campos obrigatórios nesta sessão</span>
        <button className="ml-auto text-slate-400 hover:text-slate-600" aria-label="Fechar">✕</button>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-6 border-b mb-2">
        <button 
          className={`pb-2 px-2 border-b-2 text-sm font-medium transition-all ${
            tab==='funcionamento' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
          }`} 
          onClick={() => setTab('funcionamento')}
        >
          Horário de funcionamento
        </button>
        <button 
          className={`pb-2 px-2 border-b-2 text-sm font-medium transition-all ${
            tab==='indisponibilidade' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
          }`} 
          onClick={() => setTab('indisponibilidade')}
        >
          Período de indisponibilidade
        </button>
      </div>
      
      {tab === 'funcionamento' && (
        <>
          <FusoHorarioSelector fuso={fuso} onFusoChange={setFuso} />
          <DisponibilidadeOptions 
            disponibilidade={disponibilidade} 
            onDisponibilidadeChange={setDisponibilidade} 
          />
          
          {(disponibilidade === 'especificos' || disponibilidade === 'agendados') && (
            <>
              <DiasSemanaSelector diasAtivos={diasAtivos} onToggleDia={toggleDia} />
              <HorariosPorDia
                diasAtivos={diasAtivos}
                horarios={horarios}
                onHorarioChange={handleHorarioChange}
                onAddHorario={addHorario}
                onRemoveHorario={removeHorario}
              />
            </>
          )}
        </>
      )}
      
      {tab === 'indisponibilidade' && (
        <div className="py-8 text-center text-slate-400">
          Funcionalidade de períodos de indisponibilidade em breve.
        </div>
      )}
      
      {/* Botão de salvar */}
      <div className="pt-6 border-t">
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSalvar} 
            disabled={salvando || loading} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
            size="lg"
          >
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          
          {sucesso && (
            <span className="text-green-600 font-medium flex items-center gap-1">
              ✓ Configurações salvas com sucesso!
            </span>
          )}
          
          {erroSalvar && (
            <span className="text-red-600 font-medium flex items-center gap-1">
              ✗ {erroSalvar}
            </span>
          )}
        </div>
        
        {loading && (
          <div className="text-slate-400 text-sm mt-2">Carregando configurações...</div>
        )}
        
        {error && (
          <div className="text-red-600 text-sm mt-2">Erro ao carregar dados: {error}</div>
        )}
      </div>
    </div>
  );
};
