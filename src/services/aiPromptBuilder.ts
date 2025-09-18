
import { CardapioService } from './cardapioService';

interface AIGlobalConfig {
  system_prompt: string;
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
  habilitar_lancamento_pedidos?: boolean;
}

export class AIPromptBuilder {
  /**
   * Constrói o prompt do sistema personalizado usando template genérico com variáveis
   */
  static buildSystemPrompt(
    globalConfig: AIGlobalConfig,
    agentConfig: AIAgentConfig,
    cardapioData?: any,
    paymentConfig?: any,
    extras?: { cashbackPercent?: number; menuUrl?: string; companyName?: string }
  ): string {
    // Se não há prompt global, usa fallback
    if (!globalConfig.system_prompt) {
      return this.buildFallbackPrompt(agentConfig, cardapioData, paymentConfig, extras)
    }

    // Variáveis para substituição no template genérico
    const variables = {
      company_name: extras?.companyName || agentConfig.agent_name || agentConfig.nome || 'Estabelecimento',
      menu_url: extras?.menuUrl || (agentConfig as any).url_cardapio || 'https://cardapio.example.com',
      cardapio_url: extras?.menuUrl || (agentConfig as any).url_cardapio || 'https://cardapio.example.com', // Alias
      cashback_percent: extras?.cashbackPercent && extras.cashbackPercent > 0 ? extras.cashbackPercent : undefined,
      opening_hours: agentConfig.working_hours || agentConfig.horario_funcionamento || undefined,
      contact_phone: (agentConfig as any).telefone || undefined,
      contact_address: (agentConfig as any).endereco || undefined,
      agent_name: agentConfig.agent_name || agentConfig.nome || 'Assistente Virtual',
      customer_name: '{{customer_name}}' // Preservar para processamento posterior;
    };

    // Substitui variáveis no prompt global
    let prompt = globalConfig.system_prompt;
    
    // Substituição de variáveis obrigatórias (suporta ambos os formatos)
    prompt = prompt.replace(/{company_name}/g, variables.company_name)
    prompt = prompt.replace(/\{\{company_name\}\}/g, variables.company_name)
    
    prompt = prompt.replace(/{menu_url}/g, variables.menu_url)
    prompt = prompt.replace(/\{\{menu_url\}\}/g, variables.menu_url)
    
    prompt = prompt.replace(/{cardapio_url}/g, variables.cardapio_url)
    prompt = prompt.replace(/\{\{cardapio_url\}\}/g, variables.cardapio_url)
    
    prompt = prompt.replace(/{agent_name}/g, variables.agent_name)
    prompt = prompt.replace(/\{\{agent_name\}\}/g, variables.agent_name)
    
    // Substituição de variáveis opcionais (apenas se existirem)
    if (variables.cashback_percent) {
      prompt = prompt.replace(/{cashback_percent}/g, variables.cashback_percent.toString())
      prompt = prompt.replace(/\{\{cashback_percent\}\}/g, variables.cashback_percent.toString())
    } else {
      // Remove menções a cashback se não configurado
      prompt = prompt.replace(/\{cashback_percent\}%?/g, '')
      prompt = prompt.replace(/\{\{cashback_percent\}\}%?/g, '')
      prompt = prompt.replace(/cashback.*?\{cashback_percent\}.*?[.;]/gi, '')
      prompt = prompt.replace(/cashback.*?\{\{cashback_percent\}\}.*?[.;]/gi, '')
    }
    
    if (variables.opening_hours) {
      prompt = prompt.replace(/{opening_hours}/g, variables.opening_hours)
      prompt = prompt.replace(/\{\{opening_hours\}\}/g, variables.opening_hours)
    } else {
      prompt = prompt.replace(/{opening_hours}/g, 'consulte nossos horários')
      prompt = prompt.replace(/\{\{opening_hours\}\}/g, 'consulte nossos horários')
    }
    
    if (variables.contact_phone) {
      prompt = prompt.replace(/{contact_phone}/g, variables.contact_phone)
      prompt = prompt.replace(/\{\{contact_phone\}\}/g, variables.contact_phone)
    } else {
      prompt = prompt.replace(/{contact_phone}/g, 'consulte nosso telefone')
      prompt = prompt.replace(/\{\{contact_phone\}\}/g, 'consulte nosso telefone')
    }
    
    if (variables.contact_address) {
      prompt = prompt.replace(/{contact_address}/g, variables.contact_address)
      prompt = prompt.replace(/\{\{contact_address\}\}/g, variables.contact_address)
    } else {
      prompt = prompt.replace(/{contact_address}/g, 'consulte nosso endereço')
      prompt = prompt.replace(/\{\{contact_address\}\}/g, 'consulte nosso endereço')
    }
    
    // Não substituir customer_name, deixar para processamento dinâmico

    // Adiciona dados do cardápio se disponível e configurado
    const productKnowledge = agentConfig.product_knowledge !== undefined ? 
      agentConfig.product_knowledge : 
      agentConfig.conhecimento_produtos !== undefined ? ;
      agentConfig.conhecimento_produtos : true;

    if (cardapioData && productKnowledge) {
      prompt += `\n\n📊 DADOS DO CARDÁPIO:
${cardapioData}

🍽️ INSTRUÇÕES CRÍTICAS PARA PRODUTOS:
- Use EXCLUSIVAMENTE as informações acima para responder sobre produtos
- JAMAIS invente preços, sabores, tamanhos ou informações não listadas
- Se não souber algo, seja HONESTO: "Não tenho essa informação no momento"
- Para informações ausentes, diga: "Posso chamar um atendente para essa informação"
- Sempre mencione preços exatos quando relevante
- Para produtos com opções, explique todas as escolhas disponíveis
- Calcule totais corretamente incluindo adicionais
- Se produto não estiver listado, diga CLARAMENTE: "Esse produto não está disponível no cardápio"
- Destaque ofertas especiais quando houver (baseado nos dados reais)
- NUNCA assuma ou invente características de produtos`;
    }

    // Adiciona configuração PIX se disponível
    if (paymentConfig?.accept_pix && paymentConfig?.pix_key) {
      prompt += `\n\n💳 PAGAMENTO PIX:
Chave PIX da empresa: ${paymentConfig.pix_key}
Sempre mencione esta opção quando falarem sobre formas de pagamento.`;
    }

    return prompt;


  /**
   * Prompt fallback para quando não há configuração global
   */
  private static buildFallbackPrompt(
    agentConfig: AIAgentConfig,
    cardapioData?: any,
    paymentConfig?: any,
    extras?: { cashbackPercent?: number; menuUrl?: string; companyName?: string }
  ): string {
    const agentName = agentConfig.agent_name || agentConfig.nome || 'Atendente Virtual';
    const companyName = extras?.companyName || 'Estabelecimento';
    
    return `Você é ${agentName}, assistente virtual da ${companyName}.

🎯 REGRAS BÁSICAS:
- Seja educado e prestativo
- Responda apenas com informações que você tem
- JAMAIS invente dados sobre produtos, preços, horários ou qualquer informação
- Se não souber algo, seja HONESTO: "Não tenho essa informação disponível"
- Para informações que não tem, ofereça: "Posso chamar um atendente para te ajudar"
- Para pedidos, direcione ao cardápio: ${extras?.menuUrl || 'cardápio digital'}

💬 SAUDAÇÃO:
"Olá! Sou o ${agentName} da ${companyName}! Como posso ajudar?"

${cardapioData ? `📊 CARDÁPIO:\n${cardapioData}\n\n⚠️ IMPORTANTE: Use APENAS as informações do cardápio acima. NUNCA invente produtos ou preços.\n` : ''}
${extras?.cashbackPercent ? `💰 CASHBACK: ${extras.cashbackPercent}% em todos os pedidos\n` : ''}

Mantenha sempre o foco no atendimento baseado em dados reais e seja proativo nas sugestões (apenas produtos reais).`;

}
