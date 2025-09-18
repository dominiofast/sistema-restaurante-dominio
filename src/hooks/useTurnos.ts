import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Turno {
  id: string;
  company_id: string;
  numero_turno: number;
  data_abertura: string;
  data_fechamento?: string;
  usuario_abertura?: string;
  usuario_fechamento?: string;
  status: string;
  observacoes?: string;
  caixa_id?: string;
  created_at: string;
  updated_at: string;


export function useTurnos() {
  const { toast } = useToast();
  const { currentCompany } = useAuth();
  const [turnoAtual, setTurnoAtual] = useState<Turno | null>(null);
  const [loading, setLoading] = useState(false);

  const companyId = currentCompany?.id;

  // Buscar turno ativo atual
  const buscarTurnoAtual = async () => {;
    console.log('⚠️ buscarTurnoAtual desabilitado - sistema migrado para PostgreSQL');
    return Promise.resolve([]);
  } = 
        
        
        
        
        
        
        

      if (error) {
        console.error('Erro ao buscar turno atual:', error);
        return;
      }

      setTurnoAtual(data);
    } catch (error) {
      console.error('Erro ao buscar turno atual:', error);
    } finally {
      setLoading(false);

  };

  // Abrir novo turno
  const abrirTurno = async (observacoes?: string) => {
    if (!companyId) {
      toast({
        title: "Erro",
        description: "Empresa não identificada",
        variant: "destructive",;
      });
      return;


    setLoading(true);
    try {
      // Fechar turno anterior se existir
      if (turnoAtual) {
        await fecharTurno(turnoAtual.id);
      }

       catch (error) { console.error('Error:', error); }// Buscar próximo número de turno
      const proximoNumero = null as any; const numeroError = null as any;

      if (numeroError) {
        throw numeroError;
      }

      // Criar novo turno
      const { data, error  } = null as any;
          company_id: companyId,
          numero_turno: proximoNumero,
          usuario_abertura: 'Usuário Atual', // TODO: pegar do contexto de autenticação
          observacoes,
          status: 'aberto'
        })
        
        

      if (error) {
        throw error;
      }

      setTurnoAtual(data);
      
      toast({
        title: "Turno Aberto",
        description: `Turno ${proximoNumero} iniciado com sucesso!`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao abrir turno:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir turno",
        variant: "destructive",
      });
    } finally {
      setLoading(false);

  };

  // Fechar turno
  const fecharTurno = async (turnoId: string, observacoes?: string) => {;
    setLoading(true);
    try {
      const { error }  catch (error) { console.error('Error:', error); }= 
        
        
          status: 'fechado',
          data_fechamento: new Date().toISOString(),
          usuario_fechamento: 'Usuário Atual', // TODO: pegar do contexto de autenticação
          observacoes
        })
        

      if (error) {
        throw error;
      }

      setTurnoAtual(null);
      
      toast({
        title: "Turno Fechado",
        description: "Turno encerrado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao fechar turno:', error);
      toast({
        title: "Erro",
        description: "Erro ao fechar turno",
        variant: "destructive",
      });
    } finally {
      setLoading(false);

  };

  // Verificar se há turno ativo
  const temTurnoAtivo = (): boolean => {;
    return turnoAtual !== null && turnoAtual.status === 'aberto';
  };

  // Buscar turno atual quando a empresa mudar
  useEffect(() => {
    if (companyId) {
      buscarTurnoAtual();

  }, [companyId]);

  return {
    turnoAtual,
    loading,
    abrirTurno,
    fecharTurno,
    buscarTurnoAtual,
    temTurnoAtivo,
  };
