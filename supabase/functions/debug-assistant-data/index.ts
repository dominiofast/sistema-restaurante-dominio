import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { slug_empresa } = body

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Buscar empresa
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug_empresa)
      .single()

    // Buscar assistente
    const { data: assistant } = await supabase
      .from('ai_agent_assistants')
      .select('*')
      .eq('company_id', company?.id)
      .single()

    // Buscar prompt
    const { data: prompt } = await supabase
      .from('ai_agent_prompts')
      .select('*')
      .eq('agent_slug', slug_empresa)
      .single()

    const result = {
      slug_empresa,
      company: {
        id: company?.id,
        name: company?.name,
        slug: company?.slug
      },
      assistant: {
        id: assistant?.id,
        bot_name: assistant?.bot_name,
        assistant_id: assistant?.assistant_id,
        cardapio_url: assistant?.cardapio_url
      },
      prompt: {
        template: prompt?.template?.substring(0, 200) + '...',
        vars: prompt?.vars
      }
    }

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})