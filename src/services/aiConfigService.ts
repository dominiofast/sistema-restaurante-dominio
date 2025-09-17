
import { supabase } from '@/integrations/supabase/client';

interface AIGlobalConfig {
  openai_api_key: string;
  openai_model: string;
  max_tokens: number;
  temperature: number;
  system_prompt: string;
  is_active: boolean;
}

interface AIAgentConfig {
  agent_name?: string;
  nome?: string;
  personality?: string;
  personalidade?: string;
  language?: string;
  idioma?: string;
  welcome_message?: string;
  mensagem_boas_vindas?: string;
  away_message?: string;
  mensagem_ausencia?: string;
  goodbye_message?: string;
  mensagem_despedida?: string;
  sales_phrases?: string;
  frases_venda?: string;
  response_speed?: number;
  velocidade_resposta?: number;
  detail_level?: number;
  nivel_detalhamento?: number;
  sales_aggressiveness?: number;
  agressividade_venda?: number;
  working_hours?: string;
  horario_funcionamento?: string;
  auto_suggestions?: boolean;
  auto_sugestoes?: boolean;
  product_knowledge?: boolean;
  conhecimento_produtos?: boolean;
  promotion_knowledge?: boolean;
  conhecimento_promocoes?: boolean;
  stock_knowledge?: boolean;
  conhecimento_estoque?: boolean;
  is_active?: boolean;
  ativo?: boolean;
  url_cardapio?: string;
  habilitar_lancamento_pedidos?: boolean;
  url_pedidos?: string;
  token_pedidos?: string;
}

export class AIConfigService {
  private globalConfig: AIGlobalConfig | null = null;
  private configCache: Map<string, AIAgentConfig> = new Map();
  private paymentCache: Map<string, any> = new Map();

  /**
   * Carrega a configuração global de IA
   */
  async loadGlobalConfig(): Promise<AIGlobalConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ai_global_config')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error || !data) {
        console.error('Configuração global de IA não encontrada ou inativa:', error);
        return null;
      }

      this.globalConfig = data as AIGlobalConfig;
      return data as AIGlobalConfig;
    } catch (error) {
      console.error('Erro ao carregar configuração global:', error);
      return null;
    }
  }

  /**
   * Carrega a configuração global mais recente (independente do status ativo)
   */
  async loadLatestGlobalConfig(): Promise<AIGlobalConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ai_global_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.error('Nenhuma configuração global encontrada:', error);
        return null;
      }

      return data as AIGlobalConfig;
    } catch (error) {
      console.error('Erro ao carregar configuração global mais recente:', error);
      return null;
    }
  }

  /**
   * Carrega a configuração do agente por empresa (compatível com ambas as tabelas)
   */
  async loadAgentConfig(companyId: string): Promise<AIAgentConfig | null> {
    try {
      // ⚠️ CACHE REMOVIDO TEMPORARIAMENTE para evitar confusão entre empresas
      // Sempre buscar dados frescos do banco
      console.log(`🔍 Carregando configuração fresca para empresa: ${companyId}`);

      // Tentar carregar da tabela nova primeiro
      const { data: newConfigData, error: newError } = await supabase
        .from('ai_agent_config')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (!newError && newConfigData) {
        console.log('✅ Configuração carregada da tabela nova:', newConfigData.agent_name, 'para empresa:', companyId);
        return newConfigData;
      }

      console.log('⚠️ Tabela nova não encontrada, tentando tabela antiga...');

      // Tentar carregar da tabela antiga como fallback
      const { data: oldConfigData, error: oldError } = await supabase
        .from('agente_ia_config')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (oldError || !oldConfigData) {
        console.error('Configuração do agente não encontrada em nenhuma tabela:', { newError, oldError });
        return null;
      }

      console.log('✅ Configuração carregada da tabela antiga:', oldConfigData);

      // Converte da estrutura antiga para a nova
      const convertedConfig = this.convertOldConfigToNew(oldConfigData);
      
      // Salva no cache por 5 minutos
      this.configCache.set(companyId, convertedConfig);
      setTimeout(() => this.configCache.delete(companyId), 5 * 60 * 1000);
      return convertedConfig;

    } catch (error) {
      console.error('Erro ao carregar configuração do agente:', error);
      return null;
    }
  }

  /**
   * Converte configuração da tabela antiga para o formato novo
   */
  private convertOldConfigToNew(oldConfig: any): AIAgentConfig {
    return {
      agent_name: oldConfig.nome,
      personality: oldConfig.personalidade,
      language: oldConfig.idioma,
      welcome_message: oldConfig.mensagem_boas_vindas,
      away_message: oldConfig.mensagem_ausencia,
      goodbye_message: oldConfig.mensagem_despedida,
      sales_phrases: oldConfig.frases_venda,
      response_speed: oldConfig.velocidade_resposta,
      detail_level: oldConfig.nivel_detalhamento,
      sales_aggressiveness: oldConfig.agressividade_venda,
      working_hours: oldConfig.horario_funcionamento,
      auto_suggestions: oldConfig.auto_sugestoes,
      product_knowledge: oldConfig.conhecimento_produtos,
      promotion_knowledge: oldConfig.conhecimento_promocoes,
      stock_knowledge: oldConfig.conhecimento_estoque,
      is_active: oldConfig.ativo
    };
  }

  /**
   * Limpa o cache de configurações
   */
  async loadPaymentDeliveryConfig(companyId: string): Promise<any | null> {
    try {
      if (this.paymentCache.has(companyId)) {
        return this.paymentCache.get(companyId)!;
      }
      const { data, error } = await supabase
        .from('payment_delivery_config')
        .select('pix_key, accept_pix')
        .eq('company_id', companyId)
        .maybeSingle();
      if (error || !data) {
        console.error('Configuração de pagamento não encontrada:', error);
        return null;
      }
      this.paymentCache.set(companyId, data);
      setTimeout(() => this.paymentCache.delete(companyId), 5 * 60 * 1000);
      return data;
    } catch (error) {
      console.error('Erro ao carregar configuração de pagamento:', error);
      return null;
    }
  }

  clearCache(): void {
    this.configCache.clear();
    this.paymentCache.clear();
    this.globalConfig = null;
  }

  /**
   * Getter para configuração global em cache
   */
  get cachedGlobalConfig(): AIGlobalConfig | null {
    return this.globalConfig;
  }
}

export const aiConfigService = new AIConfigService();

// Limpar cache na inicialização para evitar confusão entre empresas
aiConfigService.clearCache();
console.log('🧹 Cache do AI Config Service limpo na inicialização');
