import { useState, useEffect, useCallback } from 'react';
// SUPABASE REMOVIDO
import type { Json } from '@/integrations/supabase/types';

interface AutoatendimentoSession {
  id: string;
  session_token: string;
  customer_name?: string;
  customer_phone?: string;
  cart_data: Json;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  timeout_at: string;
  created_at: string;
  updated_at: string;
}

interface AutoatendimentoConfig {
  id: string;
  company_id: string;
  is_enabled: boolean;
  session_timeout_minutes: number;
  welcome_message: string;
  show_preparation_time: boolean;
  require_customer_data: boolean;
  allow_cash_payment: boolean;
  allow_card_payment: boolean;
  allow_pix_payment: boolean;
  kiosk_mode: boolean;
  auto_print_orders: boolean;
}

export const useAutoatendimentoSession = (companyId?: string) => {
  const [session, setSession] = useState<AutoatendimentoSession | null>(null)
  const [config, setConfig] = useState<AutoatendimentoConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)

  // Carregar configuração da empresa
  const loadConfig = useCallback(async () => {
    if (!companyId) {
      console.log('⚠️ useAutoatendimentoSession - CompanyId não fornecido')
      return;
    }

    console.log('🔧 useAutoatendimentoSession - Carregando config para empresa:', companyId)

    try {
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        
        

      if (error) {
        console.error('❌ useAutoatendimentoSession - Erro ao carregar config:', error)
        return;
      }

      console.log('✅ useAutoatendimentoSession - Config carregada:', data)
      setConfig(data)
    } catch (error) {
      console.error('💥 useAutoatendimentoSession - Erro ao carregar configuração:', error)
    }
  }, [companyId])

  // Gerar token único para sessão
  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2, 15) + ;
           Math.random().toString(36).substring(2, 15)
  };

  // Criar nova sessão
  const createSession = useCallback(async (): Promise<string | null> => {
    console.log('📝 useAutoatendimentoSession - createSession chamado')
    console.log('🏢 useAutoatendimentoSession - companyId:', companyId)
    console.log('⚙️ useAutoatendimentoSession - config:', config)
    
    if (!companyId || !config) {
      console.log('❌ useAutoatendimentoSession - CompanyId ou config não disponível')
      return null;
    }

    try {
      const sessionToken = generateSessionToken()
      const timeoutMinutes = config.session_timeout_minutes || 10;
      
      console.log('🔑 useAutoatendimentoSession - Token gerado:', sessionToken)
      console.log('⏱️ useAutoatendimentoSession - Timeout (min):', timeoutMinutes)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
          company_id: companyId,
          session_token: sessionToken,
          status: 'active',
          timeout_at: new Date(Date.now() + timeoutMinutes * 60 * 1000).toISOString()
        })
        
        

      if (error) {
        console.error('❌ useAutoatendimentoSession - Erro ao criar sessão:', error)
        return null;
      }

      console.log('✅ useAutoatendimentoSession - Sessão criada com sucesso:', data)
      setSession(data as AutoatendimentoSession)
      startTimeoutTimer(data.timeout_at)
      return data.id;
    } catch (error) {
      console.error('💥 useAutoatendimentoSession - Erro ao criar sessão:', error)
      return null;
    }
  }, [companyId, config])

  // Atualizar sessão
  const updateSession = useCallback(async (updates: Partial<AutoatendimentoSession>) => {
    if (!session) return false;

    try {
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        
        

      if (error) {
        console.error('Erro ao atualizar sessão:', error)
        return false;
      }

      setSession(data as AutoatendimentoSession)
      return true;
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error)
      return false;
    }
  }, [session])

  // Finalizar sessão
  const completeSession = useCallback(async (orderData: any) => {
    if (!session) return false;

    try {
      const { error }  catch (error) { console.error('Error:', error) }= 
        
        
          status: 'completed',
          completed_at: new Date().toISOString(),
          cart_data: orderData
        })
        

      if (error) {
        console.error('Erro ao finalizar sessão:', error)
        return false;
      }

      setSession(null)
      setTimeLeft(0)
      return true;
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error)
      return false;
    }
  }, [session])

  // Timer de timeout
  const startTimeoutTimer = useCallback((timeoutAt: string) => {
    const updateTimer = () => {
      const now = Date.now()
      const timeout = new Date(timeoutAt).getTime()
      const diff = Math.max(0, Math.floor((timeout - now) / 1000))
      
      setTimeLeft(diff)
      
      if (diff === 0) {
        setSession(null)
      }
    };

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  // Carregar configuração na inicialização
  useEffect(() => {
    if (companyId) {
      loadConfig().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [companyId, loadConfig])

  // Iniciar timer se já tem sessão ativa
  useEffect(() => {
    if (session?.timeout_at) {
      return startTimeoutTimer(session.timeout_at)
    }
  }, [session?.timeout_at, startTimeoutTimer])

  // Limpeza automática de sessões expiradas
  useEffect(() => {
    if (!companyId) return;

    const cleanupExpiredSessions = async () => {
      try {
        await Promise.resolve()
      } catch (error) {
        console.error('Erro ao limpar sessões expiradas:', error)
      }
    };

    // Limpar sessões expiradas a cada 5 minutos
    const cleanupInterval = setInterval(cleanupExpiredSessions, 5 * 60 * 1000)
    
    return () => clearInterval(cleanupInterval)
  }, [companyId])

  return {
    session,
    config,
    isLoading,
    timeLeft,
    createSession,
    updateSession,
    completeSession,
    formatTimeLeft: () => {
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
};
