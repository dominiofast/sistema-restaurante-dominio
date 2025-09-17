import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SYNC ASSISTANT FUNCTION CALLED ===');
    console.log('TIMESTAMP:', new Date().toISOString());
    
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));

    // Validação de entrada
    if (!body || typeof body !== 'object') {
      throw new Error('Corpo da requisição inválido');
    }

    const { company_id, slug } = body;

    // Validação de parâmetros obrigatórios
    if (!company_id || !slug) {
      throw new Error('Parâmetros company_id e slug são obrigatórios');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Configurações do Supabase não encontradas');
    }

    console.log('Inicializando Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar dados do assistente
    console.log('Buscando dados do assistente...');
    const { data: assistant, error: assistantError } = await supabase
      .from('ai_agent_assistants')
      .select('*')
      .eq('company_id', company_id)
      .single();

    if (assistantError || !assistant) {
      console.error('Erro ao buscar assistente:', assistantError);
      throw new Error('Assistente não encontrado');
    }

    console.log('Assistente encontrado:', assistant);

    if (!assistant.assistant_id) {
      console.error('Assistant ID não encontrado');
      throw new Error('Assistant ID não configurado');
    }

    console.log('Buscando template do prompt...');
    const { data: promptData, error: promptError } = await supabase
      .from('ai_agent_prompts')
      .select('*')
      .eq('agent_slug', slug)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    console.log('QUERY PROMPT RESULT:', { promptData, promptError });

    if (promptError || !promptData) {
      console.warn('⚠️ Prompt específico não encontrado. Usando template GLOBAL como fallback.', { promptError, slug });
      // Buscar template global ativo
      const { data: globalTemplate, error: globalErr } = await supabase
        .from('ai_global_prompt_template')
        .select('template, default_vars')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (globalErr || !globalTemplate?.template) {
        console.error('❌ Template global ausente:', globalErr);
        throw new Error('Nenhum template de prompt disponível');
      }

      // Montar variáveis mínimas
      const { data: company } = await supabase
        .from('companies')
        .select('name, slug')
        .eq('id', company_id)
        .single();

      const vars = {
        ...(typeof globalTemplate.default_vars === 'object' ? globalTemplate.default_vars : {}),
        company_name: company?.name || 'Estabelecimento',
        agent_name: assistant.bot_name || 'Assistente Virtual',
        cardapio_url: `https://pedido.dominio.tech/${company?.slug || slug}`,
        customer_name: '{{customer_name}}'
      } as Record<string, string>;

      // Render simples de {{variavel}}
      let rendered = globalTemplate.template;
      Object.entries(vars).forEach(([k, v]) => {
        const ph = new RegExp(`\\{\\{${k}\\}\\}`,'g');
        rendered = rendered.replace(ph, v);
      });
      // Remover placeholders remanescentes
      rendered = rendered.replace(/\\{\\{[^}]+\\}\\}/g, '');

      promptData = { template: rendered, vars } as any;
    }

    console.log('Template original:', promptData.template);
    console.log('Variáveis originais:', promptData.vars);

    // Função buildSystemPrompt idêntica à do force-sync-assistant
    function buildSystemPrompt(globalConfig: any, agentConfig: any, cardapioData?: string): string {
      // Prompt base sem qualquer menção a cardápio ou links
      let prompt = `Você é ${agentConfig.agent_name}, assistente virtual especializado em atendimento ao cliente.

🏢 EMPRESA: ${globalConfig.company_name || 'Estabelecimento'}
📱 ATENDIMENTO: Delivery, Retirada no local, Salão

🎯 PERSONALIDADE: Simpático, acolhedor e direto
🌍 IDIOMA: Português brasileiro
💬 SAUDAÇÃO: "${agentConfig.welcome_message}"

⚡ COMPORTAMENTO:
- Seja útil e educado sempre
- Responda diretamente sobre produtos
- Sugira produtos quando apropriado
- Destaque promoções disponíveis
- Use emojis com moderação

🚨 REGRAS CRÍTICAS:
- Mencione o cardápio na saudação inicial e quando solicitado
- Use sempre o link limpo do cardápio quando apropriado
- Evite repetir o link múltiplas vezes na mesma conversa
- Responda com base nas informações que você possui
- Seja proativo em oferecer o cardápio quando relevante

📋 MODALIDADES:
- DELIVERY: padrão (sempre perguntar endereço)
- RETIRADA: cliente busca no local
- SALÃO: consumo no estabelecimento

`;

      // Adicionar informações do cardápio se disponível
      if (cardapioData && agentConfig.product_knowledge) {
        prompt += `📊 BASE DE DADOS DOS PRODUTOS:
${cardapioData}

🍽️ INSTRUÇÕES DE ATENDIMENTO:
- Use APENAS as informações acima para responder sobre produtos
- Sempre mencione preços exatos quando relevante
- Para produtos com opções, explique todas as escolhas disponíveis
- Calcule totais corretamente incluindo adicionais
- Se produto não estiver listado, informe que não está disponível
- Destaque ofertas especiais quando houver

`;
      }

      prompt += `✅ DIRETRIZES FINAIS:
- Mantenha foco no atendimento
- Seja proativo em sugestões
- Ofereça alternativas quando necessário
- Use linguagem natural e amigável
- Processe pedidos quando solicitado

`;

      return prompt;
    }

    // Aplicar variáveis no template e processar se for do builder
    let finalInstructions = promptData.template;
    const vars = promptData.vars || {};
    
    // Se é template do builder, processar com o buildSystemPrompt
    if (promptData.template === 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER') {
      console.log('🔧 Processando template com builder');
      
      const globalConfig = {
        company_name: vars.company_name
      };
      
      const agentConfig = {
        agent_name: vars.agent_name,
        personality: 'simpatico',
        language: 'pt-br',
        welcome_message: `Olá! Sou o ${vars.agent_name} da ${vars.company_name}! 🍕`,
        product_knowledge: true,
        promotion_knowledge: true,
        auto_suggestions: true
      };
      
      // Usar o buildSystemPrompt para gerar o prompt final
      finalInstructions = buildSystemPrompt(globalConfig, agentConfig, null);
    } else {
      // Template personalizado - aplicar variáveis
      if (promptData.vars && typeof promptData.vars === 'object') {
        Object.entries(promptData.vars).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          // Não substituir se o valor for outro placeholder
          if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
            console.log(`Pulando ${placeholder} pois o valor é outro placeholder: ${value}`);
            return;
          }
          // Converter para string e garantir que não é undefined/null
          const replacementValue = String(value || '');
          const oldInstructions = finalInstructions;
          finalInstructions = finalInstructions.replaceAll(placeholder, replacementValue);
          if (oldInstructions !== finalInstructions) {
            console.log(`✅ Substituindo ${placeholder} por: "${replacementValue}"`);
          }
        });
      }

      // Remover placeholders restantes que não foram substituídos
      const placeholderRegex = /\{\{[^}]+\}\}/g;
      const remainingPlaceholders = finalInstructions.match(placeholderRegex);
      if (remainingPlaceholders) {
        console.log('Removendo placeholders restantes:', remainingPlaceholders);
        finalInstructions = finalInstructions.replace(placeholderRegex, '');
      }
    }

    // Concatenar instruções extras, se existirem
    const extra = typeof vars.extra_instructions === 'string' && vars.extra_instructions.trim().length > 0
      ? `\n\n🔧 INSTRUÇÕES EXTRAS (Específicas da Loja):\n${vars.extra_instructions.trim()}`
      : '';

    const finalWithExtras = finalInstructions + extra;

    console.log('=== INSTRUÇÕES FINAIS PARA OPENAI ===');
    console.log(finalWithExtras);
    console.log('=====================================');

    // Atualizar assistente na OpenAI com timeout
    console.log('Atualizando assistente na OpenAI...');
    
    // Primeiro, tentar atualizar o assistant existente
    const openaiPromise = fetch(`https://api.openai.com/v1/assistants/${assistant.assistant_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        instructions: finalWithExtras,
        name: assistant.bot_name,
        model: 'gpt-4o-mini'
      })
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout na chamada para OpenAI (25s)')), 25000);
    });

    let openaiResponse = await Promise.race([openaiPromise, timeoutPromise]) as Response;
    
    // Se o assistant não existir mais (404), criar um novo
    if (openaiResponse.status === 404) {
      console.log('Assistant não encontrado na OpenAI. Criando novo assistant...');
      
      const createPromise = fetch('https://api.openai.com/v1/assistants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          instructions: finalWithExtras,
          name: assistant.bot_name,
          model: 'gpt-4o-mini'
        })
      });

      const createTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na criação do assistant (25s)')), 25000);
      });

      openaiResponse = await Promise.race([createPromise, createTimeoutPromise]) as Response;
      
      if (openaiResponse.ok) {
        const newAssistant = await openaiResponse.json();
        console.log('Novo assistant criado:', newAssistant.id);
        
        // Atualizar o assistant_id na base de dados
        const { error: updateError } = await supabase
          .from('ai_agent_assistants')
          .update({ assistant_id: newAssistant.id })
          .eq('company_id', company_id);
          
        if (updateError) {
          console.error('Erro ao atualizar assistant_id:', updateError);
        } else {
          console.log('Assistant ID atualizado na base de dados');
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Novo assistant criado e sincronizado com sucesso!',
          assistant_id: newAssistant.id,
          instructions_preview: finalWithExtras.substring(0, 300) + '...'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    const openaiResult = await openaiResponse.json();
    console.log('Resposta da OpenAI:', JSON.stringify(openaiResult, null, 2));

    if (!openaiResponse.ok) {
      console.error('Erro da OpenAI:', openaiResult);
      throw new Error(`Erro da OpenAI: ${openaiResult.error?.message || 'Erro desconhecido'}`);
    }

    console.log('✅ Assistente sincronizado com sucesso!');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Assistente sincronizado com sucesso!',
      assistant_id: assistant.assistant_id,
      instructions_preview: finalInstructions.substring(0, 300) + '...'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});