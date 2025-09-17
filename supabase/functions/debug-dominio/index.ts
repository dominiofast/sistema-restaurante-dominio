import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    const dominioId = '550e8400-e29b-41d4-a716-446655440001'
    
    console.log('🔍 DEBUG: Carregando dados da Domínio Pizzas...')

    // 1. Buscar empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', dominioId)
      .single()

    console.log('1️⃣ Empresa encontrada:', company?.name)
    if (companyError) console.error('❌ Erro empresa:', companyError)

    // 2. Buscar configuração AI
    const { data: aiConfig, error: aiConfigError } = await supabase
      .from('ai_agent_config')
      .select('*')
      .eq('company_id', dominioId)
      .eq('is_active', true)
      .single()

    console.log('2️⃣ Config AI encontrada:', aiConfig?.agent_name)
    if (aiConfigError) console.error('❌ Erro AI config:', aiConfigError)

    // 3. Testar prompt system
    let systemPrompt = 'Você é um assistente útil e amigável.'
    
    if (aiConfig && company) {
      systemPrompt = `Você é ${aiConfig.agent_name}, um assistente virtual da ${company.name}. 
      
Características:
- Nome: ${aiConfig.agent_name}
- Empresa: ${company.name}
- Personalidade: ${aiConfig.personality}

Responda sempre identificando-se como assistente da ${company.name} especificamente.`
    }

    console.log('3️⃣ System prompt criado:', systemPrompt.substring(0, 100) + '...')

    // 4. Testar chamada OpenAI
    if (openaiApiKey) {
      console.log('4️⃣ Testando OpenAI...')
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Olá, quem é você? Me apresente a empresa.' }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content || 'Erro na resposta'
      
      console.log('4️⃣ Resposta OpenAI:', aiResponse)

      return new Response(JSON.stringify({
        success: true,
        debug: {
          company: company?.name,
          aiAgent: aiConfig?.agent_name,
          systemPrompt: systemPrompt,
          aiResponse: aiResponse
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: false,
      debug: {
        company: company?.name,
        aiAgent: aiConfig?.agent_name,
        systemPrompt: systemPrompt,
        error: 'OpenAI API Key não encontrada'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro debug:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})