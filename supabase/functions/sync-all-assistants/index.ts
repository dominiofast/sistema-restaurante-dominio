import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função buildSystemPrompt usando template global
function buildSystemPrompt(globalConfig: any, agentConfig: any, cardapioData?: string): string {
  // Usar o template global com substituição de variáveis
  let prompt = globalConfig.system_prompt || `Você é um assistente virtual especializado em atendimento ao cliente.`;
  
  // Variáveis para substituição
  const variables = {
    company_name: globalConfig.company_name || 'Estabelecimento',
    cardapio_url: `https://pedido.dominio.tech/${globalConfig.company_slug}`,
    agent_name: agentConfig.agent_name || 'Assistente Virtual',
    contact_phone: agentConfig.contact_phone || 'consulte nosso telefone',
    contact_address: agentConfig.contact_address || 'consulte nosso endereço', 
    opening_hours: agentConfig.opening_hours || 'consulte nossos horários',
    cashback_percent: agentConfig.cashback_percent || ''
  };
  
  // Substituir variáveis no template
  prompt = prompt.replace(/\{\{company_name\}\}/g, variables.company_name);
  prompt = prompt.replace(/\{\{cardapio_url\}\}/g, variables.cardapio_url);
  prompt = prompt.replace(/\{\{agent_name\}\}/g, variables.agent_name);
  prompt = prompt.replace(/\{\{contact_phone\}\}/g, variables.contact_phone);
  prompt = prompt.replace(/\{\{contact_address\}\}/g, variables.contact_address);
  prompt = prompt.replace(/\{\{opening_hours\}\}/g, variables.opening_hours);
  
  // Tratar cashback (só incluir se tiver valor)
  if (variables.cashback_percent && variables.cashback_percent !== '') {
    prompt = prompt.replace(/\{\{cashback_percent\}\}/g, variables.cashback_percent.toString());
  } else {
    prompt = prompt.replace(/\{\{cashback_percent\}\}%/g, '');
    prompt = prompt.replace(/\{\{cashback_percent\}\}/g, '');
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 SYNC ALL ASSISTANTS - Iniciando sincronização global');
    
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('✅ OpenAI API Key encontrada');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    console.log('✅ Supabase client criado');

    // Buscar TODOS os assistentes ativos
    const { data: assistants, error: assistantsError } = await supabase
      .from('ai_agent_assistants')
      .select('id, company_id, bot_name, assistant_id, is_active')
      .eq('is_active', true)
      .not('assistant_id', 'is', null);

    if (assistantsError) {
      console.error('❌ Erro ao buscar assistentes:', assistantsError);
      throw assistantsError;
    }

    console.log(`📊 Encontrados ${assistants?.length || 0} assistentes para sincronizar`);

    if (!assistants || assistants.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Nenhum assistente ativo encontrado',
        updated: 0 
      }), {
        headers: corsHeaders,
        status: 200
      });
    }

    let updatedCount = 0;
    let errors: string[] = [];

    for (const assistant of assistants) {
      try {
        console.log(`🔄 Processando assistente ID: ${assistant.id}`);

        // Buscar dados da empresa
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('slug, name')
          .eq('id', assistant.company_id)
          .single();

        if (companyError || !company?.slug) {
          console.log(`⚠️ Empresa não encontrada para assistant ${assistant.id}:`, companyError);
          continue;
        }

        console.log(`🏢 Empresa: ${company.name} (${company.slug})`);
        
        // Buscar prompt da empresa
        const { data: promptData, error: promptError } = await supabase
          .from('ai_agent_prompts')
          .select('template, vars')
          .eq('agent_slug', company.slug)
          .single();

        if (promptError || !promptData) {
          console.log(`⚠️ Prompt não encontrado para ${company.slug}:`, promptError);
          continue;
        }

        console.log(`📝 Processando prompt para ${company.slug}`);

        let instructions = '';
        
        // Se o template é para ser renderizado pelo builder, usar o AIPromptBuilder
        console.log(`🔍 TEMPLATE DETECTION - Template: "${promptData.template}"`);
        console.log(`🔍 TEMPLATE DETECTION - Is Builder Template: ${promptData.template === 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER'}`);
        
        if (promptData.template === 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER') {
          console.log(`🔧 Usando template global para ${company.slug}`);
          
          // Buscar template global ativo
          const { data: globalConfigData } = await supabase
            .from('ai_global_config')
            .select('system_prompt')
            .eq('is_active', true)
            .single()
          
          if (!globalConfigData) {
            console.log(`⚠️ Template global não encontrado`);
            continue;
          }
          
          const vars = promptData.vars || {};
          
          // Buscar dados adicionais da empresa (telefone, endereço, horários)
          const { data: companyInfo } = await supabase
            .from('company_info')
            .select('contato, endereco')
            .eq('company_id', assistant.company_id)
            .single()
          
          const { data: addressData } = await supabase
            .from('company_addresses')
            .select('logradouro, numero, bairro, cidade, estado')
            .eq('company_id', assistant.company_id)
            .eq('is_principal', true)
            .single()
          
          const { data: horariosData } = await supabase
            .from('horarios_dias')
            .select('dia_semana, horario_inicio, horario_fim')
            .eq('horario_funcionamento_id', (await supabase
              .from('horario_funcionamento')
              .select('id')
              .eq('company_id', assistant.company_id)
              .single()).data?.id)
            .eq('ativo', true)
            .order('dia_semana')
          
          // Montar endereço completo
          let enderecoCompleto = 'consulte nosso endereço';
          if (addressData) {
            enderecoCompleto = `${addressData.logradouro}, ${addressData.numero} - ${addressData.bairro}, ${addressData.cidade}/${addressData.estado}`;
          }
          
          // Montar horários de funcionamento formatados
          let horariosFuncionamento = 'consulte nossos horários';
          if (horariosData && horariosData.length > 0) {
            const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const horariosFormatados = horariosData.map(h => {
              const inicio = h.horario_inicio.slice(0, 5); // Remove segundos
              const fim = h.horario_fim.slice(0, 5);
              return `${diasSemana[h.dia_semana]}: ${inicio} às ${fim}`;
            });
            horariosFuncionamento = horariosFormatados.join('\n');
          }
          
          // Buscar dados do cardápio
          let cardapioData = null;
          try {
            const { data: storageFiles } = await supabase.storage
              .from('ai-knowledge')
              .download(`${assistant.company_id}/produtos.json`);
              
            if (storageFiles) {
              const fileContent = await storageFiles.text();
              cardapioData = fileContent;
              console.log(`📋 Cardápio carregado para ${company.slug}`);
            }
          } catch (error) {
            console.log(`⚠️ Cardápio não encontrado para ${company.slug}`);
          }

          const globalConfig = {
            system_prompt: globalConfigData.system_prompt,
            company_name: vars.company_name || company.name,
            company_slug: company.slug
          };
          
          const agentConfig = {
            agent_name: vars.agent_name || `Assistente ${company.name}`,
            contact_phone: companyInfo?.contato || 'consulte nosso telefone',
            contact_address: enderecoCompleto,
            opening_hours: horariosFuncionamento,
            cashback_percent: vars.cashback_percent || '',
            product_knowledge: true
          };
          
          // Usar o buildSystemPrompt para processar corretamente
          instructions = buildSystemPrompt(globalConfig, agentConfig, cardapioData);
        } else {
          console.log(`🔧 USANDO TEMPLATE PERSONALIZADO (não é builder)`);
          // Template personalizado - aplicar variáveis
          instructions = promptData.template;
          const vars = promptData.vars || {};

          // Substituir placeholders básicos
          Object.entries(vars).forEach(([key, value]) => {
            if (typeof value === 'string') {
              const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
              instructions = instructions.replace(placeholder, value);
            }
          });
        }

        // Limpeza final do texto (apenas para templates personalizados)
        if (promptData.template !== 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER') {
          instructions = instructions
            .replace(/\{\{[^}]+\}\}/g, '') // Remove {{placeholders}} não resolvidos
            .replace(/[\u200B-\u200F\u2060\uFEFF\u2000-\u206F]/g, '') // Zero-width chars
            .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // Weird spaces
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
        }

        // Adicionar apenas regras técnicas de URL
        const cleanUrlInstructions = `

🚨 REGRAS TÉCNICAS DE LINKS:
- NUNCA use caracteres invisíveis em URLs
- NUNCA use markdown [texto](url) 
- URLs devem ser copiáveis diretamente

`;

        const finalInstructions = instructions + cleanUrlInstructions;

        console.log(`🤖 Atualizando assistant OpenAI: ${assistant.assistant_id} para empresa ${company.name}`);
        console.log(`📝 INSTRUÇÕES COMPLETAS PARA DEBUG:`);
        console.log(`==== INÍCIO DAS INSTRUÇÕES ====`);
        console.log(finalInstructions);
        console.log(`==== FIM DAS INSTRUÇÕES ====`);

        console.log(`🤖 ATUALIZANDO assistant OpenAI: ${assistant.assistant_id} para empresa ${company.name}`);
        
        // Atualizar Assistant no OpenAI (sem deletar)
        const response = await fetch(`https://api.openai.com/v1/assistants/${assistant.assistant_id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({
            name: assistant.bot_name || company.name,
            instructions: finalInstructions,
            model: "gpt-4o-mini",
          })
        });
        
        console.log(`🔧 ENVIANDO PARA OPENAI - Instructions Length: ${finalInstructions.length}`);
        console.log(`🔧 PRIMEIROS 300 CHARS DAS INSTRUÇÕES: "${finalInstructions.substring(0, 300)}"`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ OpenAI error for ${company.name}:`, errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const updatedAssistant = await response.json();
        console.log(`✅ ${company.name} atualizado com sucesso! Model: ${updatedAssistant.model}, ID: ${updatedAssistant.id}`);
        
        // Aguardar um pouco entre atualizações para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        updatedCount++;

      } catch (error) {
        const errorMsg = `Erro ao atualizar assistant ${assistant.id}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`🎉 Sincronização concluída: ${updatedCount} assistentes atualizados`);
    
    if (errors.length > 0) {
      console.log(`⚠️ Erros encontrados: ${errors.length}`);
      errors.forEach(err => console.log(`  - ${err}`));
    }

    return new Response(JSON.stringify({
      message: `✅ Sincronização concluída! ${updatedCount} assistentes atualizados com instruções limpas e modelo gpt-4o-mini`,
      updated: updatedCount,
      total: assistants.length,
      errors: errors.length > 0 ? errors : undefined,
      improvements: [
        "URLs sempre limpas sem caracteres especiais",
        "Modelo atualizado para gpt-4o-mini (mais rápido)",
        "Instruções ultra-específicas contra links quebrados"
      ]
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('❌ Erro na sincronização global:', error);
    console.error('❌ Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      updated: 0
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});