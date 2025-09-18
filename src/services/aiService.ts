
import { aiConfigService } from './aiConfigService';
import { AIPromptBuilder } from './aiPromptBuilder';
import { AIConversationLogger } from './aiConversationLogger';
import { AICardapioService } from './aiCardapioService';
// SUPABASE REMOVIDO
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private useDirectMode: boolean = false;

  constructor() {
    // Inicializar modo direto a partir do localStorage na criação da instância
    console.log('🚀 [AISERVICE] Constructor sendo executado...');
    this.initializeDirectMode();
  }

  /**
   * Inicializa o modo direto a partir do localStorage
   */
  private initializeDirectMode(): void {
    console.log('🔍 [AISERVICE] initializeDirectMode chamado...');
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('ai_mode_direct');
      const isDirectModeEnabled = savedMode === 'true';
      this.useDirectMode = isDirectModeEnabled;
      console.log(`🔄 [INICIALIZAÇÃO] Modo direto ${isDirectModeEnabled ? 'ATIVADO' : 'DESATIVADO'} (localStorage: ${savedMode})`);
    } else {
      console.log('⚠️ [INICIALIZAÇÃO] Window não disponível, usando modo padrão');
    }
  }

  /**
   * Define se deve usar Chat Completions direto ou Assistants
   */
  setDirectMode(enabled: boolean): void {
    this.useDirectMode = enabled;
    console.log(`🔄 Modo direto ${enabled ? 'ATIVADO' : 'DESATIVADO'}`);
  }

  /**
   * Verifica se a IA está pausada para um chat específico
   */
  async isAIPausedForChat(companyId: string, chatId: string): Promise<boolean> {
    try {
      if (!companyId || !chatId) {
        console.log('⚠️ CompanyId ou ChatId não fornecidos para verificação de pausa');
        return false;
      }

      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'whatsapp_chats')
        /* .select\( REMOVIDO */ ; //'ai_paused')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .eq\( REMOVIDO */ ; //'chat_id', chatId)
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (error) {
        console.error('❌ Erro ao verificar estado de pausa da IA:', error);
        return false; // Em caso de erro, assumir IA ativa (comportamento seguro)
      }

      const isPaused = data?.ai_paused === true;
      console.log(`🔍 Verificação de pausa - Chat: ${chatId}, Pausado: ${isPaused}`);
      
      return isPaused;
    } catch (error) {
      console.error('❌ Erro na verificação de pausa da IA:', error);
      return false; // Em caso de erro, assumir IA ativa
    }
  }

  /**
   * Gera uma resposta usando OpenAI (Chat Completions direto ou Assistants)
   */
  async generateResponse(
    companyId: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    customerPhone?: string,
    customerName?: string,
    chatId?: string
  ): Promise<{ response: string; tokensUsed: number } | null> {
    console.log(`🔍 [DEBUG] useDirectMode atual: ${this.useDirectMode}`);
    console.log(`🔍 [DEBUG] localStorage ai_mode_direct: ${typeof window !== 'undefined' ? localStorage.getItem('ai_mode_direct') : 'N/A (server-side)'}`);
    
    if (this.useDirectMode) {
      console.log('✅ [MODO DIRETO] Usando Chat Completions');
      return this.generateResponseDirect(companyId, userMessage, conversationHistory, customerPhone, customerName, chatId);
    }
    console.log('⚠️ [MODO LEGADO] Usando Assistants OpenAI');
    return this.generateResponseLegacy(companyId, userMessage, conversationHistory, customerPhone, customerName, chatId);
  }

  /**
   * Gera resposta usando Chat Completions direto (NOVO MÉTODO)
   */
  async generateResponseDirect(
    companyId: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    customerPhone?: string,
    customerName?: string,
    chatId?: string
  ): Promise<{ response: string; tokensUsed: number } | null> {
    try {
      console.log('🤖 [DIRETO] Gerando resposta para empresa:', companyId);
      
      // Verificar se IA está pausada
      if (chatId) {
        const isPaused = await this.isAIPausedForChat(companyId, chatId);
        if (isPaused) {
          console.log('⏸️ IA pausada para este chat:', chatId);
          return null;
        }
      }

      // Buscar dados da empresa
      const { data: companyData, error: companyError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'companies')
        /* .select\( REMOVIDO */ ; //'slug, name')
        /* .eq\( REMOVIDO */ ; //'id', companyId)
        /* .single\( REMOVIDO */ ; //);

      if (companyError || !companyData) {
        console.error('❌ Empresa não encontrada:', companyError);
        return null;
      }

      // Chamar edge function ai-chat-direct
      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('ai-chat-direct', {
        body: {
          company_id: companyId,
          company_slug: companyData.slug,
          user_message: userMessage,
          conversation_history: conversationHistory,
          customer_phone: customerPhone,
          customer_name: customerName,
          chat_id: chatId
        }
      });

      if (error) {
        console.error('❌ Erro na edge function ai-chat-direct:', error);
        return null;
      }

      if (!data.success) {
        console.error('❌ Edge function retornou erro:', data.error);
        return null;
      }

      console.log('✅ [DIRETO] Resposta gerada:', {
        responseLength: data.response.length,
        tokensUsed: data.tokens_used,
        responseTime: data.response_time_ms
      });

      return {
        response: data.response,
        tokensUsed: data.tokens_used || 0
      };

    } catch (error) {
      console.error('❌ Erro no modo direto:', error);
      return null;
    }
  }

  /**
   * Gera resposta usando Assistants (MÉTODO LEGADO)
   */
  async generateResponseLegacy(
    companyId: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    customerPhone?: string,
    customerName?: string,
    chatId?: string
  ): Promise<{ response: string; tokensUsed: number } | null> {
    try {
      console.log('🤖 [LEGADO] Iniciando geração de resposta para empresa:', companyId);
      
      // Verificar se IA está pausada para este chat específico
      if (chatId) {
        const isPaused = await this.isAIPausedForChat(companyId, chatId);
        if (isPaused) {
          console.log('⏸️ IA pausada para este chat - não processando mensagem:', chatId);
          return null;
        }
      }
      
      // Carrega configurações
      const globalConfig = aiConfigService.cachedGlobalConfig || await aiConfigService.loadGlobalConfig();
      if (!globalConfig || !globalConfig.is_active) {
        console.error('❌ Configuração global não encontrada ou inativa');
        return null;
      }

      if (!globalConfig.openai_api_key || globalConfig.openai_api_key === 'CONFIGURE_YOUR_OPENAI_API_KEY_HERE') {
        console.error('❌ API Key do OpenAI não configurada');
        return null;
      }

      const agentConfig = await aiConfigService.loadAgentConfig(companyId);
      if (!agentConfig) {
        console.error('❌ Configuração do agente não encontrada para empresa:', companyId);
        return null;
      }

      console.log('✅ Configurações carregadas:', {
        globalActive: globalConfig.is_active,
        model: globalConfig.openai_model,
        agentName: agentConfig.agent_name || agentConfig.nome
      });

      // Carrega dados do cardápio se o conhecimento de produtos estiver ativo
      let cardapioData = null;
      const hasProductKnowledge = agentConfig.product_knowledge !== undefined 
        ? agentConfig.product_knowledge 
        : agentConfig.conhecimento_produtos !== undefined 
        ? agentConfig.conhecimento_produtos 
        : true;

      if (hasProductKnowledge) {
        console.log('📋 Carregando cardápio para contexto da IA...');
        const aiCardapioService = new AICardapioService();
        cardapioData = await aiCardapioService.loadCardapioData(companyId);
      }

      // Carrega configuração de pagamento se criação de pedidos estiver habilitada
      let paymentConfig = null;
      const canCreateOrders = agentConfig.habilitar_lancamento_pedidos || false;
      if (canCreateOrders) {
        console.log('💳 Carregando configuração de pagamento...');
        paymentConfig = await aiConfigService.loadPaymentDeliveryConfig(companyId);
      }


      // Extras dinâmicos (cashback e link do cardápio)
      let cashbackPercent: number | undefined = undefined;
      try {
        const { data: cashbackRow } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'cashback_config')
          /* .select\( REMOVIDO */ ; //'percentual_cashback, is_active')
          /* .eq\( REMOVIDO */ ; //'company_id', companyId)
          /* .maybeSingle\( REMOVIDO */ ; //);
        if (cashbackRow?.is_active && typeof cashbackRow.percentual_cashback === 'number') {
          cashbackPercent = cashbackRow.percentual_cashback;
        }
      } catch {}

      const menuUrl: string | undefined = (agentConfig as any).url_cardapio || undefined;

      // Constrói o prompt personalizado com extras
      const systemPrompt = AIPromptBuilder.buildSystemPrompt(
        globalConfig,
        agentConfig,
        cardapioData,
        paymentConfig,
        { cashbackPercent, menuUrl, companyName: (agentConfig as any).nome || (agentConfig as any).agent_name }
      );

      // Prepara as mensagens
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Últimas 10 mensagens para contexto
        { role: 'user', content: userMessage }
      ];

      console.log('📤 Enviando requisição para OpenAI:', {
        model: globalConfig.openai_model,
        messagesCount: messages.length,
        maxTokens: globalConfig.max_tokens,
        temperature: globalConfig.temperature,
        hasCardapio: !!cardapioData
      });

      // Chama a API do OpenAI
      const startTime = Date.now();
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalConfig.openai_api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: globalConfig.openai_model,
          messages,
          max_tokens: globalConfig.max_tokens,
          temperature: globalConfig.temperature,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erro na API OpenAI:', error);
        return null;
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      const aiResponse = data.choices[0].message.content;
      const tokensUsed = data.usage?.total_tokens || 0;

      console.log('✅ Resposta gerada com sucesso:', {
        responseTime: `${responseTime}ms`,
        tokensUsed,
        responseLength: aiResponse.length
      });

      // Salva log da conversa
      await AIConversationLogger.saveConversationLog(
        companyId,
        customerPhone,
        customerName,
        userMessage,
        aiResponse,
        tokensUsed,
        responseTime
      );

      return {
        response: aiResponse,
        tokensUsed
      };

    } catch (error) {
      console.error('❌ Erro ao gerar resposta:', error);
      return null;
    }
  }

  /**
   * Verifica se a IA está ativa para uma empresa
   */
  async isAIActive(companyId: string): Promise<boolean> {
    try {
      const globalConfig = aiConfigService.cachedGlobalConfig || await aiConfigService.loadGlobalConfig();
      if (!globalConfig || !globalConfig.is_active) {
        return false;
      }

      const agentConfig = await aiConfigService.loadAgentConfig(companyId);
      return agentConfig !== null;
    } catch (error) {
      console.error('Erro ao verificar status da IA:', error);
      return false;
    }
  }

  /**
   * Gera uma resposta de boas-vindas personalizada
   */
  async generateWelcomeMessage(companyId: string): Promise<string | null> {
    try {
      const agentConfig = await aiConfigService.loadAgentConfig(companyId);
      if (!agentConfig) return null;

      return agentConfig.welcome_message || agentConfig.mensagem_boas_vindas || null;
    } catch (error) {
      console.error('Erro ao gerar mensagem de boas-vindas:', error);
      return null;
    }
  }

  /**
   * Testa a conexão com OpenAI
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Para teste, carrega a configuração mais recente independente do status ativo
      const globalConfig = await aiConfigService.loadLatestGlobalConfig();
      
      if (!globalConfig) {
        return { success: false, message: 'Nenhuma configuração encontrada' };
      }

      if (!globalConfig.openai_api_key || globalConfig.openai_api_key === 'CONFIGURE_YOUR_OPENAI_API_KEY_HERE') {
        return { success: false, message: 'API Key do OpenAI não configurada' };
      }

      console.log('🧪 Testando com configuração:', {
        model: globalConfig.openai_model,
        isActive: globalConfig.is_active,
        hasApiKey: !!globalConfig.openai_api_key
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalConfig.openai_api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: globalConfig.openai_model,
          messages: [
            {
              role: 'system',
              content: globalConfig.system_prompt
            },
            {
              role: 'user',
              content: 'Teste de conexão - responda apenas "OK"'
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          message: `Erro na API OpenAI: ${error.error?.message || 'Erro desconhecido'}` 
        };
      }

      const data = await response.json();
      return { 
        success: true, 
        message: 'Conexão com OpenAI funcionando corretamente!',
        data: {
          model: globalConfig.openai_model,
          response: data.choices[0].message.content,
          tokensUsed: data.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return { 
        success: false, 
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  }

  /**
   * Limpa o cache de configurações e cardápio
   */
  clearCache(): void {
    aiConfigService.clearCache();
    const aiCardapioService = new AICardapioService();
    aiCardapioService.clearCache();
  }
}

// Instância singleton
export const aiService = new AIService();
export default aiService;
