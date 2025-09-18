
import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
export interface AgenteIAConfig {
  id?: string;
  company_id: string;
  is_active: boolean;
  agent_name: string;
  personality: string;
  language: string;
  welcome_message?: string;
  away_message?: string;
  goodbye_message?: string;
  sales_phrases?: string;
  response_speed: number;
  detail_level: number;
  sales_aggressiveness: number;
  working_hours: string;
  message_limit: number;
  auto_suggestions: boolean;
  order_reminders: boolean;
  data_collection: boolean;
  whatsapp_integration: boolean;
  manager_notifications: boolean;
  product_knowledge: boolean;
  promotion_knowledge: boolean;
  stock_knowledge: boolean;
  // Campos para compatibilidade/migração
  url_cardapio?: string;
  habilitar_lancamento_pedidos?: boolean;
  url_pedidos?: string;
  token_pedidos?: string;


const defaultConfig: Omit<AgenteIAConfig, 'company_id'> = {
  is_active: true,
  agent_name: 'Atendente Virtual',
  personality: 'simpatico',
  language: 'pt-br',
  welcome_message: 'Olá! Como posso ajudá-lo hoje?',
  away_message: 'No momento estou indisponível, mas retorno em breve.',
  goodbye_message: 'Obrigado pelo contato! Tenha um ótimo dia!',
  sales_phrases: 'Temos ofertas especiais hoje! Gostaria de conhecer?',
  response_speed: 2,
  detail_level: 3,
  sales_aggressiveness: 2,
  working_hours: '24/7',
  message_limit: 50,
  auto_suggestions: true,
  order_reminders: true,
  data_collection: false,
  whatsapp_integration: false,
  manager_notifications: true,
  product_knowledge: true,
  promotion_knowledge: true,
  stock_knowledge: false,
  // Campos para compatibilidade
// url_cardapio: '',
  habilitar_lancamento_pedidos: false,
  url_pedidos: '',
  token_pedidos: '',
};

// Função para gerar token único
const generateToken = () => {
  return 'sk-' + Array
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
};

export const useAgenteIAConfig = (companyId: string) => {
  const [config, setConfig] = useState<AgenteIAConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = async () => {
    if (!companyId) {
      console.log('⏸️ Company ID não fornecido, aguardando...')
      setLoading(false)
      return;
    }

    try {
      setLoading(true)
      console.log('📥 Carregando configuração para empresa:', companyId)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        

      if (error) {
        console.error('❌ Erro ao carregar configuração:', error)
        // Se não encontrar configuração, criar uma nova com valores padrão
        const newConfig = { 
          ...defaultConfig, 
          company_id: companyId,
          // Auto-gerar URL e token para pedidos
          url_pedidos: `${window.location.origin}/functions/v1/criar-pedido`,
          token_pedidos: generateToken()
        };
        console.log('🆕 Criando configuração padrão:', newConfig)
        setConfig(newConfig)
      } else if (data) {
        console.log('✅ Configuração carregada:', data)
        // Adicionar campos de compatibilidade se necessário
        const configWithDefaults = {
          ...data,
          url_cardapio: '',
          habilitar_lancamento_pedidos: false,
          url_pedidos: `${window.location.origin}/functions/v1/criar-pedido`,
          token_pedidos: generateToken()
        };
        setConfig(configWithDefaults)
      } else {
        // Não existe configuração, criar uma nova
        console.log('🆕 Nenhuma configuração encontrada, criando padrão')
        const newConfig = { 
          ...defaultConfig, 
          company_id: companyId,
          // Auto-gerar URL e token para pedidos
          url_pedidos: `${window.location.origin}/functions/v1/criar-pedido`,
          token_pedidos: generateToken()
        };
        setConfig(newConfig)

    } catch (error) {
      console.error('❌ Erro inesperado ao carregar configuração:', error)
      const newConfig = { 
        ...defaultConfig, 
        company_id: companyId,
        // Auto-gerar URL e token para pedidos
        url_pedidos: `${window.location.origin}/functions/v1/criar-pedido`,
        token_pedidos: generateToken()
      };
      setConfig(newConfig)
    } finally {
      setLoading(false)
    }
  };

  const saveConfig = async (configToSave: AgenteIAConfig) => {
    if (!companyId) {
      console.error('❌ Company ID não fornecido para salvar')
      return false;
    }

    setSaving(true)
    try {
      console.log('💾 Salvando configuração:', configToSave)
      
      // Remover campos que não existem na nova tabela antes de salvar
      const { url_cardapio, habilitar_lancamento_pedidos, url_pedidos, token_pedidos, ...configToSend }  catch (error) { console.error('Error:', error) }= configToSave;
      
      // Verificar se já existe uma configuração
      const existingConfig = null as any; const checkError = null as any;
        return false;


      let result;
      if (existingConfig?.id) {
        // Atualizar configuração existente
        console.log('🔄 Atualizando configuração existente ID:', existingConfig.id)
        result = 
          
          
          
          
          
      } else {
        // Inserir nova configuração
        console.log('➕ Inserindo nova configuração')
        result = 
          
          
          
          


      if (result.error) {
        console.error('❌ Erro ao salvar configuração:', result.error)
        return false;


      console.log('✅ Configuração salva com sucesso:', result.data)
      // Atualizar o estado local com os dados salvos + campos de compatibilidade
      const savedConfigWithDefaults = {
        ...result.data,
        url_cardapio: '',
        habilitar_lancamento_pedidos: false,
        url_pedidos: `${window.location.origin}/functions/v1/criar-pedido`,
        token_pedidos: generateToken()
      };
      setConfig(savedConfigWithDefaults)
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar configuração:', error)
      return false;
    } finally {
      setSaving(false)
    }
  };

  useEffect(() => {
    loadConfig()
  }, [companyId])

  return {
    config,
    loading,
    saving,
    saveConfig,
    refreshConfig: loadConfig
  };
};
