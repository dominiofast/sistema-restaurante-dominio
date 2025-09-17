import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função buildSystemPrompt idêntica à do sync-all-assistants
function buildSystemPrompt(globalConfig: any, agentConfig: any, cardapioData?: string): string {
  // Usar o template global com substituição de variáveis
  let prompt = globalConfig.system_prompt || `Você é um assistente virtual especializado em atendimento ao cliente.`;
  
  // Variáveis para substituição
  const variables = {
    company_name: globalConfig.company_name || 'Estabelecimento',
    cardapio_url: `https://pedido.dominio.tech/${globalConfig.company_slug}`,
    agent_name: agentConfig.agent_name || 'Assistente Virtual',
    contact_phone: agentConfig.telefone || 'consulte nosso telefone',
    contact_address: agentConfig.endereco || 'consulte nosso endereço', 
    opening_hours: agentConfig.horario_funcionamento || 'consulte nossos horários',
    cashback_percent: agentConfig.cashback_percent || ''
  };
  
  // Substituir variáveis no template
  prompt = prompt.replace(/{company_name}/g, variables.company_name);
  prompt = prompt.replace(/{cardapio_url}/g, variables.cardapio_url);
  prompt = prompt.replace(/{agent_name}/g, variables.agent_name);
  prompt = prompt.replace(/{contact_phone}/g, variables.contact_phone);
  prompt = prompt.replace(/{contact_address}/g, variables.contact_address);
  prompt = prompt.replace(/{opening_hours}/g, variables.opening_hours);
  
  // Tratar cashback (só incluir se tiver valor)
  if (variables.cashback_percent && variables.cashback_percent !== '') {
    prompt = prompt.replace(/{cashback_percent}/g, variables.cashback_percent.toString());
  } else {
    prompt = prompt.replace(/{cashback_percent}%/g, '');
    prompt = prompt.replace(/{cashback_percent}/g, '');
  }
  
  // Adicionar dados do cardápio se disponível
  if (cardapioData && agentConfig.product_knowledge) {
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

  return prompt;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { assistant_id } = await req.json()
    
    if (!assistant_id) {
      throw new Error('assistant_id é obrigatório')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    // Buscar dados do assistant para encontrar a empresa
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Primeiro buscar qual empresa usa este assistant_id
    const { data: assistantData, error: assistantError } = await supabase
      .from('ai_agent_assistants')
      .select('company_id')
      .eq('assistant_id', assistant_id)
      .single()

    if (assistantError || !assistantData) {
      throw new Error(`Assistant não encontrado no banco: ${assistantError?.message || 'Não existe'}`)
    }

    // Buscar dados da empresa
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('slug, name')
      .eq('id', assistantData.company_id)
      .single()

    if (companyError || !companyData) {
      throw new Error(`Empresa não encontrada: ${companyError?.message || 'Não existe'}`)
    }

    console.log(`🏢 Processando empresa: ${companyData.name} (${companyData.slug})`)

    // Buscar prompt da empresa específica
    const { data: promptData, error: promptError } = await supabase
      .from('ai_agent_prompts')
      .select('template, vars')
      .eq('agent_slug', companyData.slug)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (promptError) {
      throw new Error(`Erro ao buscar prompt: ${promptError.message}`)
    }

    console.log('📝 Prompt encontrado:', promptData.template.length, 'caracteres')

    // Substituir variáveis do template e processar se for do builder
    let finalInstructions = promptData.template;
    const vars = promptData.vars || {};
    
    // Se é template do builder, processar com o mesmo buildSystemPrompt
    if (promptData.template === 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER') {
      console.log('🔧 Processando template com builder');
      
      // Buscar dados adicionais da empresa (telefone, endereço, horários)
      const { data: companyInfo } = await supabase
        .from('company_info')
        .select('contato, endereco')
        .eq('company_id', assistantData.company_id)
        .single()
      
      const { data: addressData } = await supabase
        .from('company_addresses')
        .select('logradouro, numero, bairro, cidade, estado')
        .eq('company_id', assistantData.company_id)
        .eq('is_principal', true)
        .single()
      
      const { data: horariosData } = await supabase
        .from('horarios_dias')
        .select('dia_semana, horario_inicio, horario_fim')
        .eq('horario_funcionamento_id', (await supabase
          .from('horario_funcionamento')
          .select('id')
          .eq('company_id', assistantData.company_id)
          .single()).data?.id)
        .eq('ativo', true)
        .order('dia_semana')
      
      // Montar endereço completo
      let enderecoCompleto = '';
      if (addressData) {
        enderecoCompleto = `${addressData.logradouro}, ${addressData.numero} - ${addressData.bairro}, ${addressData.cidade}/${addressData.estado}`;
      }
      
      // Montar horários de funcionamento formatados
      let horariosFuncionamento = '';
      if (horariosData && horariosData.length > 0) {
        const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const horariosFormatados = horariosData.map(h => {
          const inicio = h.horario_inicio.slice(0, 5); // Remove segundos
          const fim = h.horario_fim.slice(0, 5);
          return `${diasSemana[h.dia_semana]}: ${inicio} às ${fim}`;
        });
        horariosFuncionamento = horariosFormatados.join('\n');
      }
      
      
      // Buscar template global para usar o sistema correto
      const { data: globalConfigData } = await supabase
        .from('ai_global_config')
        .select('system_prompt')
        .eq('is_active', true)
        .single()
      
      const globalConfig = {
        system_prompt: globalConfigData?.system_prompt,
        company_name: vars.company_name,
        company_slug: companyData.slug
      };
      
      const agentConfig = {
        agent_name: vars.agent_name,
        personality: 'simpatico',
        language: 'pt-br',
        welcome_message: `Olá! Sou o ${vars.agent_name} da ${vars.company_name}! 🍕`,
        product_knowledge: true,
        promotion_knowledge: true,
        auto_suggestions: true,
        telefone: companyInfo?.contato || undefined,
        endereco: enderecoCompleto || companyInfo?.endereco || undefined,
        horario_funcionamento: horariosFuncionamento || undefined,
        contact_phone: companyInfo?.contato || undefined,
        contact_address: enderecoCompleto || companyInfo?.endereco || undefined,
        opening_hours: horariosFuncionamento || undefined
      };
      
      // Usar o buildSystemPrompt para processar corretamente
      finalInstructions = buildSystemPrompt(globalConfig, agentConfig, null);
    } else {
      // Template personalizado - aplicar variáveis
      for (const [key, value] of Object.entries(vars)) {
        if (typeof value === 'string' && !value.includes('{{')) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          finalInstructions = finalInstructions.replace(regex, value);
        }
      }
    }

    console.log('🔄 Atualizando Assistant no OpenAI...')
    console.log(`📝 ENVIANDO INSTRUÇÕES (${finalInstructions.length} chars):`)
    console.log('==== INÍCIO DAS INSTRUÇÕES PARA OPENAI ====')
    console.log(finalInstructions.substring(0, 500) + '...')
    console.log('==== FIM DAS INSTRUÇÕES ====')

    // Atualizar o Assistant no OpenAI
    const response = await fetch(`https://api.openai.com/v1/assistants/${assistant_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        instructions: finalInstructions,
        model: 'gpt-4o-mini'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro na OpenAI: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Assistant atualizado com sucesso:', result.id)

    return new Response(JSON.stringify({ 
      success: true, 
      assistant_id: result.id,
      instructions_length: finalInstructions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro:', error.message)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})