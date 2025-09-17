import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIProcessRequest {
  message: string
  phoneNumber: string
  companyId: string
  customerName?: string
  context?: string
}

interface AIProcessResponse {
  success: boolean
  response?: string
  assistantId?: string
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 [AI-PROCESSOR v4.0] INICIANDO PROCESSAMENTO')
    const { message, phoneNumber, companyId, customerName, context }: AIProcessRequest = await req.json()
    console.log('🚀 [AI-PROCESSOR v4.0] Dados recebidos:', { message: message?.substring(0, 50), phoneNumber, companyId, customerName })

    // Validações básicas
    if (!message || !phoneNumber || !companyId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Dados obrigatórios não fornecidos'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar configuração da empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Empresa não encontrada'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Buscar configuração da IA para esta empresa específica
    const { data: aiConfig, error: aiConfigError } = await supabase
      .from('ai_agent_config')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single()

    // 🚀 NOVA LÓGICA: Verificar se deve usar modo direto
    const { data: assistantConfig, error: assistantError } = await supabase
      .from('ai_agent_assistants')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle()

    console.log('🔍 [AI-PROCESSOR] Assistant config:', assistantConfig)
    console.log('🔍 [AI-PROCESSOR] use_direct_mode:', assistantConfig?.use_direct_mode)

    // Se use_direct_mode está ativo, redirecionar para ai-chat-direct
    if (assistantConfig?.use_direct_mode === true) {
      console.log('🔄 [AI-PROCESSOR] Redirecionando para modo direto...')
      
      try {
        const directPayload = {
          company_id: companyId,
          company_slug: company.slug,
          user_message: message,
          conversation_history: [],
          customer_phone: phoneNumber,
          customer_name: customerName
        }
        
        console.log('🚀 [AI-PROCESSOR] Chamando ai-chat-direct:', directPayload)
        
        const { data: directResponse, error: directError } = await supabase.functions.invoke('ai-chat-direct', {
          body: directPayload
        })
        
        if (directError) {
          console.log('❌ [AI-PROCESSOR] Erro no modo direto:', directError)
          // Continuar com fallback
        } else {
          console.log('✅ [AI-PROCESSOR] Resposta do modo direto:', directResponse)
          return new Response(JSON.stringify({
            success: true,
            response: directResponse?.response || directResponse?.content || 'Resposta gerada pelo modo direto',
            mode: 'direct'
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      } catch (error) {
        console.log('❌ [AI-PROCESSOR] Erro na chamada do modo direto:', error)
        // Continuar com fallback
      }
    }

    // Buscar integração WhatsApp
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('company_id', companyId)
      .eq('purpose', 'primary')
      .single()

    if (integrationError || !integration) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Configuração WhatsApp não encontrada'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Se não tem configuração de IA ativa, usar configuração padrão da empresa
    if (aiConfigError || !aiConfig) {
      console.log(`⚠️ Configuração de IA não encontrada para ${company.name}, usando contexto básico`)
    }

    // Processar com IA (modo legado)
    let aiResponse: any = null
    let assistantId: string | undefined = undefined

    if (integration.ia_agent_preset) {
      // Usar Assistant específico
      try {
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openaiApiKey) {
          throw new Error('OpenAI API Key não configurada')
        }

        // Criar thread
        const threadResponse = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v1'
          }
        })

        const thread = await threadResponse.json()

        // Adicionar mensagem à thread
        await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v1'
          },
          body: JSON.stringify({
            role: 'user',
            content: message
          })
        })

        // Executar assistant
        const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v1'
          },
          body: JSON.stringify({
            assistant_id: integration.ia_agent_preset
          })
        })

        const run = await runResponse.json()
        assistantId = integration.ia_agent_preset

        // Aguardar conclusão
        let runStatus = 'queued'
        while (runStatus === 'queued' || runStatus === 'in_progress') {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'OpenAI-Beta': 'assistants=v1'
            }
          })
          
          const statusData = await statusResponse.json()
          runStatus = statusData.status
        }

        if (runStatus === 'completed') {
          // Buscar resposta
          const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'OpenAI-Beta': 'assistants=v1'
            }
          })
          
          const messages = await messagesResponse.json()
          const lastMessage = messages.data[0]
          
          aiResponse = {
            resposta: lastMessage.content[0]?.text?.value || 'Desculpe, não consegui processar sua mensagem.',
            assistant_id: assistantId
          }
        } else {
          throw new Error(`Assistant falhou com status: ${runStatus}`)
        }

      } catch (assistantError) {
        console.error('❌ Erro no Assistant:', assistantError)
        // Fallback para completion com configurações da empresa
        const aiContext = aiConfig 
          ? `${aiConfig.agent_name || company.name} - ${company.name}. ${context || ''}`
          : `${company.name}. ${context || ''}`
        
        aiResponse = await processWithCompletion(message, aiContext, aiConfig, company)
      }
    } else {
      // Usar completion com configurações da empresa
      const aiContext = aiConfig 
        ? `${aiConfig.agent_name || company.name} - ${company.name}. ${context || ''}`
        : `${company.name}. ${context || ''}`
      
      aiResponse = await processWithCompletion(message, aiContext, aiConfig, company)
    }

    // Log do processamento com informações específicas da empresa
    await supabase.from('ai_conversation_logs').insert({
      company_id: companyId,
      customer_phone: phoneNumber,
      customer_name: customerName || 'Unknown',
      message_content: `PROCESSAMENTO IA: ${company.name} | ${message.substring(0, 50)}... | Assistant: ${assistantId || 'completion'} | Resposta: ${aiResponse.resposta.substring(0, 50)}...`,
      message_type: 'ai_processed_isolated'
    })

    console.log(`✅ IA processada para ${company.name}:`, {
      companyId,
      companyName: company.name,
      assistantUsed: assistantId || 'completion',
      responseLength: aiResponse.resposta.length
    })

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse.resposta,
      assistantId: assistantId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro no AI Processor:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function processWithCompletion(message: string, context?: string, aiConfig?: any, company?: any): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) {
    throw new Error('OpenAI API Key não configurada')
  }

  // Construir prompt personalizado com base na configuração da empresa
  let systemPrompt = 'Você é um assistente útil e amigável. Responda de forma natural e concisa.'
  
  if (aiConfig && company) {
    systemPrompt = `Você é ${aiConfig.agent_name || `assistente da ${company.name}`}, um assistente virtual especializado em atendimento ao cliente para ${company.name}. 

Suas características:
- Nome: ${aiConfig.agent_name || `Assistente ${company.name}`}
- Empresa: ${company.name}
- Personalidade: ${aiConfig.personality || 'simpatico'}
- Seja sempre atencioso, prestativo e profissional.

${aiConfig.sales_phrases ? `Frases de venda: ${aiConfig.sales_phrases}` : ''}

Responda sempre identificando-se como assistente da ${company.name} especificamente.`
  } else if (company) {
    systemPrompt = `Você é o assistente virtual da ${company.name}. Seja sempre atencioso, prestativo e profissional. Responda sempre identificando-se como assistente da ${company.name} especificamente.`
  }

  const prompt = context 
    ? `${context}\n\nMensagem do cliente: ${message}\n\nResponda de forma natural e útil:`
    : `Mensagem do cliente: ${message}\n\nResponda de forma natural e útil:`

  const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  })

  const completion = await completionResponse.json()
  
  return {
    resposta: completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'
  }
}
