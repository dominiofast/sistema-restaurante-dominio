const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== STEP BY STEP SYNC ===')
    
    // ETAPA 1: Ler dados
    console.log('ETAPA 1: Lendo dados...')
    const body = await req.json()
    const { company_id, slug } = body
    console.log('✅ ETAPA 1 OK:', { company_id, slug })

    if (!company_id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'company_id é obrigatório',
        failed_at: 'ETAPA 1 - Validação'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ETAPA 2: Verificar ambiente
    console.log('ETAPA 2: Verificando ambiente...')
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    console.log('✅ ETAPA 2 OK - Env vars presentes')

    if (!openaiKey || !supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Configurações de ambiente não encontradas',
        failed_at: 'ETAPA 2 - Ambiente'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ETAPA 3: Tentar importar Supabase
    console.log('ETAPA 3: Importando Supabase...')
    let createClient
    try {
      const supabaseModule = await import('https://esm.sh/@supabase/supabase-js@2')
      createClient = supabaseModule.createClient
      console.log('✅ ETAPA 3 OK - Supabase importado')
    } catch (importError) {
      console.error('❌ ETAPA 3 FALHOU - Erro na importação:', importError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Erro ao importar Supabase: ' + importError.message,
        failed_at: 'ETAPA 3 - Importação'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ETAPA 4: Conectar Supabase
    console.log('ETAPA 4: Conectando Supabase...')
    let supabase
    try {
      supabase = createClient(supabaseUrl, supabaseKey)
      console.log('✅ ETAPA 4 OK - Supabase conectado')
    } catch (connectionError) {
      console.error('❌ ETAPA 4 FALHOU - Erro na conexão:', connectionError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Erro ao conectar Supabase: ' + connectionError.message,
        failed_at: 'ETAPA 4 - Conexão'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ETAPA 5: Buscar assistente
    console.log('ETAPA 5: Buscando assistente...')
    let assistant
    try {
      const { data, error } = await supabase
        .from('ai_agent_assistants')
        .select('id, bot_name, assistant_id')
        .eq('company_id', company_id)
        .single()

      if (error) throw error
      assistant = data
      console.log('✅ ETAPA 5 OK - Assistente encontrado:', assistant?.bot_name)
    } catch (dbError) {
      console.error('❌ ETAPA 5 FALHOU - Erro no banco:', dbError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Erro ao buscar assistente: ' + dbError.message,
        failed_at: 'ETAPA 5 - Banco de dados'
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!assistant?.assistant_id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Assistant ID não configurado',
        failed_at: 'ETAPA 5 - Validação Assistant ID'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ETAPA 6: Buscar empresa
    console.log('ETAPA 6: Buscando empresa...')
    let company
    try {
      const { data } = await supabase
        .from('companies')
        .select('name')
        .eq('id', company_id)
        .single()
      company = data
      console.log('✅ ETAPA 6 OK - Empresa encontrada:', company?.name)
    } catch (companyError) {
      console.log('⚠️ ETAPA 6 - Empresa não encontrada, usando padrão')
      company = { name: 'Estabelecimento' }
    }

    // ETAPA 7: Preparar dados
    console.log('ETAPA 7: Preparando dados...')
    const companyName = company?.name || 'Estabelecimento'
    const botName = assistant.bot_name || 'Assistente Virtual'
    const instructions = 'Você é ' + botName + ', assistente virtual da ' + companyName + '. Seja simpático e prestativo.'
    console.log('✅ ETAPA 7 OK - Dados preparados')

    // ETAPA 8: Testar OpenAI (sem fazer update real)
    console.log('ETAPA 8: Testando OpenAI...')
    try {
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': 'Bearer ' + openaiKey,
        }
      })
      
      if (!testResponse.ok) {
        throw new Error('OpenAI API retornou status ' + testResponse.status)
      }
      
      console.log('✅ ETAPA 8 OK - OpenAI acessível')
    } catch (openaiError) {
      console.error('❌ ETAPA 8 FALHOU - Erro OpenAI:', openaiError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Erro ao acessar OpenAI: ' + openaiError.message,
        failed_at: 'ETAPA 8 - OpenAI'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // SUCESSO - Todas as etapas passaram
    console.log('✅ TODAS AS ETAPAS OK!')
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Todas as etapas passaram! Pronto para sincronização real.',
      assistant_id: assistant.assistant_id,
      bot_name: botName,
      company_name: companyName,
      instructions_length: instructions.length,
      steps_completed: 8
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ ERRO GERAL:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack,
      failed_at: 'ERRO GERAL'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})