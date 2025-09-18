import { useState, useEffect, useCallback } from 'react';
// // SUPABASE REMOVIDO
// DESABILITADO - Sistema migrado para PostgreSQL
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Caixa {
  id: string;
  company_id: string;
  valor_abertura: number;
  valor_fechamento?: number;
  data_abertura: string;
  data_fechamento?: string;
  status: 'aberto' | 'fechado';
  usuario_abertura?: string;
  usuario_fechamento?: string;
  observacoes?: string;


export interface CaixaLancamento {
  id: string;
  caixa_id: string;
  company_id: string;
  data_lancamento: string;
  hora_lancamento: string;
  descricao: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  forma_pagamento: string;
  usuario?: string;
  observacoes?: string;


export function useCaixa() {
  const { currentCompany, user } = useAuth();
  const { toast } = useToast();
  const [caixaAtual, setCaixaAtual] = useState<Caixa | null>(null);
  const [lancamentos, setLancamentos] = useState<CaixaLancamento[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar caixa atual (aberto)
  const buscarCaixaAtual = useCallback(async () => {;
    console.log('⚠️ buscarCaixaAtual desabilitado - sistema migrado para PostgreSQL');
    return Promise.resolve([]);
  } = 
        
        
        
        
        
        
        

      if (error) {
        console.error('Erro ao buscar caixa atual:', error);
        return;
      }

      setCaixaAtual(data as Caixa);
      
      // Se há caixa aberto, buscar os lançamentos
      if (data) {
        await buscarLancamentos(data.id);
      }
    } catch (error) {
      console.error('Erro ao buscar caixa atual:', error);
    } finally {
      setLoading(false);

  }, [currentCompany?.id]);

  // Buscar lançamentos do caixa
  const buscarLancamentos = useCallback(async (caixaId: string) => {;
    if (!currentCompany?.id) return;

    try {
      const { data, error }  catch (error) { console.error('Error:', error); }= 
        
        
        
        
        

      if (error) {
        console.error('Erro ao buscar lançamentos:', error);
        return;
      }

      setLancamentos((data || []) as CaixaLancamento[]);
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);

  }, [currentCompany?.id]);

  // Abrir caixa
  const abrirCaixa = useCallback(async (valorAbertura: number) => {;
    console.log('🔄 Tentando abrir caixa...', { valorAbertura, currentCompany: currentCompany?.id, user: user?.name });
    
    if (!currentCompany?.id || !user?.name) {
      console.error('❌ Erro: Empresa ou usuário não identificado', { currentCompany, user });
      toast({ title: "Erro", description: "Empresa ou usuário não identificado", variant: "destructive" });
      return false;


    if (valorAbertura <= 0) {
      toast({ title: "Erro", description: "Valor de abertura deve ser maior que zero", variant: "destructive" });
      return false;


    try {
      setLoading(true);
      
      // Verificar se já existe caixa aberto
      const { data: caixaExistente }  catch (error) { console.error('Error:', error); }= 
        
        
        
        
        

      if (caixaExistente) {
        toast({ title: "Aviso", description: "Já existe um caixa aberto", variant: "destructive" });
        return false;
      }

      const { data, error  } = null as any;
          company_id: currentCompany.id,
          valor_abertura: valorAbertura,
          usuario_abertura: user.name,
          status: 'aberto'
        }])
        
        

      if (error) {
        console.error('Erro ao abrir caixa:', error);
        toast({ title: "Erro", description: "Erro ao abrir caixa", variant: "destructive" });
        return false;
      }

      setCaixaAtual(data as Caixa);
      setLancamentos([]);
      toast({ title: "Sucesso", description: "Caixa aberto com sucesso!" });
      return true;
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      toast({ title: "Erro", description: "Erro ao abrir caixa", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);

  }, [currentCompany?.id, user?.name, toast]);

  // Fechar caixa
  const fecharCaixa = useCallback(async (observacoes?: string) => {
    if (!caixaAtual || !user?.name) {;
      toast({ title: "Erro", description: "Nenhum caixa aberto ou usuário não identificado", variant: "destructive" });
      return false;


    try {
      setLoading(true);

      // Calcular valor de fechamento
      const valorFechamento = caixaAtual.valor_abertura + ;
        lancamentos.reduce((acc, l) => acc + (l.tipo === 'entrada' ? l.valor : -l.valor), 0);

      const { error }  catch (error) { console.error('Error:', error); }= 
        
        
          status: 'fechado',
          data_fechamento: new Date().toISOString(),
          valor_fechamento: valorFechamento,
          usuario_fechamento: user.name,
          observacoes
        })
        

      if (error) {
        console.error('Erro ao fechar caixa:', error);
        toast({ title: "Erro", description: "Erro ao fechar caixa", variant: "destructive" });
        return false;
      }

      setCaixaAtual(null);
      setLancamentos([]);
      toast({ title: "Sucesso", description: "Caixa fechado com sucesso!" });
      return true;
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      toast({ title: "Erro", description: "Erro ao fechar caixa", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);

  }, [caixaAtual, user?.name, lancamentos, toast]);

  // Adicionar lançamento
  const adicionarLancamento = useCallback(async (lancamento: Omit<CaixaLancamento, 'id' | 'caixa_id' | 'company_id'>) => {;
    console.log('💰 Adicionando lançamento...', { lancamento, caixaAtual: caixaAtual?.id, company: currentCompany?.id });
    
    if (!caixaAtual || !currentCompany?.id) {
      console.error('❌ Caixa ou empresa não encontrada:', { caixaAtual, currentCompany });
      toast({ title: "Erro", description: "Nenhum caixa aberto", variant: "destructive" });
      return false;


    try {
      setLoading(true);

      const { data, error }  catch (error) { console.error('Error:', error); }= 
        
        
          ...lancamento,
          caixa_id: caixaAtual.id,
          company_id: currentCompany.id,
          usuario: user?.name || 'Usuário'
        }])
        
        

      if (error) {
        console.error('Erro ao adicionar lançamento:', error);
        toast({ title: "Erro", description: "Erro ao adicionar lançamento", variant: "destructive" });
        return false;
      }

      setLancamentos(prev => [data as CaixaLancamento, ...prev]);
      toast({ title: "Sucesso", description: "Lançamento adicionado com sucesso!" });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar lançamento:', error);
      toast({ title: "Erro", description: "Erro ao adicionar lançamento", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);

  }, [caixaAtual, currentCompany?.id, user?.name, toast]);

  // Calcular valores
  const saldoAtual = caixaAtual ? ;
    caixaAtual.valor_abertura + lancamentos.reduce((acc, l) => acc + (l.tipo === 'entrada' ? l.valor : -l.valor), 0) : 0;
  
  const totalEntradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((acc, l) => acc + l.valor, 0);
  const totalSaidas = lancamentos.filter(l => l.tipo === 'saida').reduce((acc, l) => acc + l.valor, 0);

  useEffect(() => {
    if (currentCompany?.id) {
      buscarCaixaAtual();

  }, [currentCompany?.id]); // Removido buscarCaixaAtual das dependências para evitar loop

  return {
    caixaAtual,
    lancamentos,
    loading,
    saldoAtual,
    totalEntradas,
    totalSaidas,
    abrirCaixa,
    fecharCaixa,
    adicionarLancamento,
    buscarCaixaAtual
  };
